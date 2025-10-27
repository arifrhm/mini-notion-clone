import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ENV_CONFIG, DEFAULT_VALUES } from '../config/env.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private generateAccessToken(userId: number, email: string): string {
    const payload = { email, sub: userId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ENV_CONFIG.JWT_SECRET, DEFAULT_VALUES.JWT_SECRET),
      expiresIn: this.configService.get(ENV_CONFIG.JWT_EXPIRES_IN, DEFAULT_VALUES.JWT_EXPIRES_IN),
    });
  }

  private generateRefreshToken(userId: number, email: string): string {
    const payload = { email, sub: userId };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ENV_CONFIG.JWT_REFRESH_SECRET, DEFAULT_VALUES.JWT_REFRESH_SECRET),
      expiresIn: this.configService.get(ENV_CONFIG.JWT_REFRESH_EXPIRES_IN, DEFAULT_VALUES.JWT_REFRESH_EXPIRES_IN),
    });
  }

  private generateTokens(userId: number, email: string) {
    return {
      access_token: this.generateAccessToken(userId, email),
      refresh_token: this.generateRefreshToken(userId, email),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return this.generateTokens(user.id, user.email);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>(ENV_CONFIG.JWT_REFRESH_SECRET, DEFAULT_VALUES.JWT_REFRESH_SECRET),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, user.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
