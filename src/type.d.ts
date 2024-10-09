import { HttpBindings } from "@hono/node-server";
import { PrismaClient } from "@prisma/client";
import { JWTPayload } from "hono/utils/jwt/types";
import { D1Database } from "@cloudflare/workers-types/experimental";

type Bindings = HttpBindings & {
  // add custom bindings here
  JWT_SECRET: string;
  DB: D1Database;
};
export type authorizedUser = JWTPayload & {
  id: string;
};

type Variables = {
  // add custom variables here
  user: authorizedUser;
  ip: string;
  requestId: string;
  prisma: PrismaClient;
  language: string;
  t: (key: string, values?: Record<string, string>) => string;
  // add pino logger
  logger: {
    info: (...args: any[]) => void;
    error: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    fatal: (...args: any[]) => void;
  };
};

export type appContext = {
  Bindings: Bindings;
  Variables: Variables;
};
