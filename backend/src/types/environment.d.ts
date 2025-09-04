declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;
      EMAIL_USERNAME: string;
      EMAIL_PASSWORD: string;
    }
  }
}

export {};
