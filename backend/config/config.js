import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 8000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || 'a0fbd5988244a88e97ed3152455a94df43d6c161',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
