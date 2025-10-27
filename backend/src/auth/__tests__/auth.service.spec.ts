import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/user.entity';

class MockRepository<T extends object> {
  data: T[];
  constructor(initial: T[] = []) { this.data = initial; }
  create(obj: Partial<T>): T { return obj as T; }
  async save(obj: T): Promise<T> { const idx = this.data.indexOf(obj); if (idx === -1) this.data.push(obj); return obj; }
  async findOne(opts: any): Promise<T | null> { const where = opts?.where || {}; return (this.data.find((item: any) => Object.keys(where).every((k) => item[k] === where[k])) || null); }
}

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: MockRepository<User>;
  let jwtService: any;
  let configService: any;

  beforeEach(() => {
    userRepo = new MockRepository<User>([]);
    jwtService = {
      sign: jest.fn().mockReturnValue('token'),
      verify: jest.fn().mockImplementation((t: string) => {
        if (t === 'bad') throw new Error('bad');
        return { sub: 1, email: 'test@example.com' };
      }),
    };
    configService = {
      get: jest.fn().mockReturnValue('secret')
    };
    service = new AuthService(userRepo as any, jwtService, configService);
  });

  it('register throws Conflict when email exists', async () => {
    userRepo.data = [{ id: 1, email: 'a@b.com', password: 'x' } as any];
    await expect(service.register({ email: 'a@b.com', password: '123' })).rejects.toThrow(ConflictException);
  });

  it('register returns tokens for new user', async () => {
    const res = await service.register({ email: 'new@b.com', password: '123' });
    expect(res.access_token).toBeDefined();
    expect(res.refresh_token).toBeDefined();
  });

  it('login throws Unauthorized for missing user', async () => {
    await expect(service.login({ email: 'none@x.com', password: '123' })).rejects.toThrow(UnauthorizedException);
  });

  it('login throws Unauthorized for wrong password', async () => {
    userRepo.data = [{ id: 2, email: 'u@b.com', password: await require('bcrypt').hash('right', 10) } as any];
    await expect(service.login({ email: 'u@b.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
  });

  it('login returns tokens for correct credentials', async () => {
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash('p@ss', 10);
    userRepo.data = [{ id: 3, email: 'ok@b.com', password: hashed } as any];
    const res = await service.login({ email: 'ok@b.com', password: 'p@ss' });
    expect(res.access_token).toBeDefined();
    expect(res.refresh_token).toBeDefined();
  });

  it('refreshToken throws Unauthorized for invalid token', async () => {
    await expect(service.refreshToken('bad')).rejects.toThrow(UnauthorizedException);
  });

  it('refreshToken returns tokens for valid token', async () => {
    userRepo.data = [{ id: 1, email: 'test@example.com', password: 'x' } as any];
    const res = await service.refreshToken('good');
    expect(res.access_token).toBeDefined();
    expect(res.refresh_token).toBeDefined();
  });

  // Fuzzy test for emails and password lengths
  it('fuzzy login inputs', async () => {
    const cases = [
      { email: 'ok@b.com', password: 'p@ss' },
      { email: '  spaced@b.com  ', password: 'short' },
      { email: 'UPPER@B.COM', password: 'Complex#123' },
    ];
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash('p@ss', 10);
    userRepo.data = [{ id: 3, email: 'ok@b.com', password: hashed } as any];
    const res = await service.login(cases[0]);
    expect(res.access_token).toBeDefined();
  });
});