import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<
    Pick<UsersService, 'findByEmail' | 'create'>
  >;
  let jwt: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(async () => {
    users = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    jwt = { sign: jest.fn().mockReturnValue('jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('registers a new user', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      password: 'hash',
      createdAt: new Date(),
    } as never);

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as never);

    const out = await service.register({
      email: 'A@B.com',
      password: 'password12',
    });

    expect(out.access_token).toBe('jwt-token');
    expect(out.user.email).toBe('a@b.com');
    expect(users.create).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'a@b.com',
    });
  });

  it('throws on duplicate register', async () => {
    users.findByEmail.mockResolvedValue({ id: 'x' } as never);
    await expect(
      service.register({ email: 'a@b.com', password: 'password12' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with valid password', async () => {
    users.findByEmail.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      password: 'hash',
    } as never);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const out = await service.login({
      email: 'a@b.com',
      password: 'password12',
    });

    expect(out.access_token).toBe('jwt-token');
  });

  it('rejects invalid login', async () => {
    users.findByEmail.mockResolvedValue(null);
    await expect(
      service.login({ email: 'a@b.com', password: 'x' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
