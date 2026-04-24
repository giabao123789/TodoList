import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let token: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.DATABASE_URL = mongod.getUri();
    process.env.JWT_SECRET = 'e2e-jwt-secret';
    process.env.OPENAI_API_KEY = '';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'todo-e2e@test.com', password: 'password12' });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'todo-e2e@test.com', password: 'password12' });

    token = login.body.access_token;
    expect(token).toBeTruthy();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  it('creates, lists, updates, and deletes todos', async () => {
    const created = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'E2E task' })
      .expect(201);

    const id = created.body.id;
    expect(id).toBeTruthy();

    const list = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${token}`)
      .query({ filter: 'all', page: 1, limit: 20 })
      .expect(200);

    expect(list.body.items.some((t: { id: string }) => t.id === id)).toBe(true);

    await request(app.getHttpServer())
      .patch(`/todos/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ completed: true })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/todos/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
