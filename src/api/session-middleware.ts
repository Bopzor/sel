import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    memberId?: string;
  }
}

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
  },
});
