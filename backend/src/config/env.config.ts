export const ENV_CONFIG = {
  // Application
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  CORS_ORIGIN: 'CORS_ORIGIN',

  // Database
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_USERNAME: 'DB_USERNAME',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_NAME: 'DB_NAME',

  // JWT
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  JWT_REFRESH_EXPIRES_IN: 'JWT_REFRESH_EXPIRES_IN',
} as const;

export const DEFAULT_VALUES = {
  PORT: 3001,
  CORS_ORIGIN: 'http://localhost:3000',
  JWT_SECRET: 'your-super-secret-jwt-key',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_SECRET: 'your-super-secret-refresh-key',
  JWT_REFRESH_EXPIRES_IN: '7d',
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'postgres',
  DB_NAME: 'mini_notion',
} as const;
