import { Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ENV_CONFIG } from '../config/env.config';
import { ResponseUtil } from '../common/utils/response.util';
import { ErrorResponseDto } from '../common/dto/api-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(registerDto);
    
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env[ENV_CONFIG.NODE_ENV] === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env[ENV_CONFIG.NODE_ENV] === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ResponseUtil.created(
      {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      },
      'User registered successfully',
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env[ENV_CONFIG.NODE_ENV] === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env[ENV_CONFIG.NODE_ENV] === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ResponseUtil.success(
      {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      },
      'Login successful',
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'New tokens generated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token', type: ErrorResponseDto })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.refreshToken(refreshTokenDto.refresh_token);
    
    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env[ENV_CONFIG.NODE_ENV] === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env[ENV_CONFIG.NODE_ENV] === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ResponseUtil.success(
      {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      },
      'Token refreshed successfully',
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return ResponseUtil.success(null, 'Logged out successfully');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  getProfile(@CurrentUser() user: any) {
    return ResponseUtil.success({ user }, 'Profile retrieved successfully');
  }
}
