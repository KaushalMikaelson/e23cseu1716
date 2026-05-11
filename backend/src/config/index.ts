import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  evaluationApiToken: process.env.EVALUATION_API_TOKEN || '',
  evaluationBaseUrl: 'http://4.224.186.213/evaluation-service',
};

export default config;
