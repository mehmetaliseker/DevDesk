export default () => ({
  port: Number.parseInt(process.env.PORT ?? '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'devdesk-local-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d'
  },
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/devdesk'
});
