import { Request, Response } from "express";
import { SessionData } from "express-session";
import { Session } from "inspector";
import { Redis } from "ioredis";
import { createUpdootLoader } from "./util/createUpdootLoader";
import { createUserLoader } from "./util/createUserLoader";

export type MyContext = {
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: number };
  };
  // req: Request & { session: Express.Session }; // <-- Ben's
  redis: Redis;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
