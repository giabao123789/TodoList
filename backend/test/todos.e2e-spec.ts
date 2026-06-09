import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TodosController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let token: string;
  let userId: string;
  let todoId: string;

  const TEST_EMAIL = 'todo-e2e@test.com';
  const TEST_PASSWORD = 'password12';

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

    // Register a user and capture token + user id for all subsequent tests
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(201);

    token = registerRes.body.access_token;
    userId = registerRes.body.user.id;
    expect(token).toBeTruthy();
    expect(userId).toBeTruthy();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongod) await mongod.stop();
  });

  // ── Auth flow ──────────────────────────────────────────────────────

  describe('Auth', () => {
    const secondUser = { email: 'second@test.com', password: 'password12' };

    it('POST /auth/register — creates account, returns access_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(secondUser)
        .expect(201);

      expect(res.body.access_token).toBeDefined();
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(secondUser.email);
      expect(res.body.user.id).toBeDefined();
    });

    it('POST /auth/register duplicate email — returns 409', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(secondUser)
        .expect(409);

      expect(res.body.message).toBe('Email already registered');
    });

    it('POST /auth/login — valid credentials return access_token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
        .expect(201);

      expect(res.body.access_token).toBeDefined();
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.user.email).toBe(TEST_EMAIL);
    });

    it('POST /auth/login wrong password — returns 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: TEST_EMAIL, password: 'wrongPas1' })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
    });

    it('GET /auth/me with valid token — returns user object', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.id).toBe(userId);
      expect(res.body.email).toBe(TEST_EMAIL);
    });

    it('GET /auth/me without token — returns 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);

      expect(res.body.message).toBeDefined();
    });
  });

  // ── Todos flow ─────────────────────────────────────────────────────

  describe('Todos', () => {
    const TODO_TITLE = 'My E2E test task';

    it('POST /todos without token — returns 401', async () => {
      await request(app.getHttpServer())
        .post('/todos')
        .send({ title: 'should fail' })
        .expect(401);
    });

    it('POST /todos — creates todo, returns todo object with id', async () => {
      const res = await request(app.getHttpServer())
        .post('/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: TODO_TITLE })
        .expect(201);

      todoId = res.body.id;
      expect(todoId).toBeDefined();
      expect(res.body.title).toBe(TODO_TITLE);
      expect(res.body.completed).toBe(false);
      expect(res.body.priority).toBe('medium');
      expect(typeof res.body.order).toBe('number');
    });

    it('GET /todos — returns array containing created todo', async () => {
      const res = await request(app.getHttpServer())
        .get('/todos')
        .set('Authorization', `Bearer ${token}`)
        .query({ filter: 'all', page: 1, limit: 20 })
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
      expect(res.body.items.some((t: { id: string }) => t.id === todoId)).toBe(true);
    });

    it('GET /todos without token — returns 401', async () => {
      await request(app.getHttpServer())
        .get('/todos')
        .expect(401);
    });

    it('PATCH /todos/:id — updates title and completed', async () => {
      const updatedTitle = 'Updated E2E task';
      const res = await request(app.getHttpServer())
        .patch(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: updatedTitle, completed: true })
        .expect(200);

      expect(res.body.title).toBe(updatedTitle);
      expect(res.body.completed).toBe(true);
      expect(res.body.id).toBe(todoId);
    });

    it('PATCH /todos/reorder — accepts array of ordered IDs, returns 200', async () => {
      const res = await request(app.getHttpServer())
        .patch('/todos/reorder')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderedIds: [todoId] })
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('DELETE /todos/:id — returns 200', async () => {
      await request(app.getHttpServer())
        .delete(`/todos/${todoId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('GET /todos after delete — todo no longer in array', async () => {
      const res = await request(app.getHttpServer())
        .get('/todos')
        .set('Authorization', `Bearer ${token}`)
        .query({ filter: 'all', page: 1, limit: 20 })
        .expect(200);

      expect(res.body.items.some((t: { id: string }) => t.id === todoId)).toBe(false);
    });
  });
});