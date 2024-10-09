import { OpenAPIHono } from "@hono/zod-openapi";
import { pinoLogger } from "hono-pino-logger";
import { cors } from "hono/cors";
import { verify } from "hono/jwt";
import { prettyJSON } from "hono/pretty-json";
import pino from "pino";
import { i18next } from "../plugins/i18next.plugin";
import { appContext, authorizedUser } from "../type";
import { requestId } from "hono/request-id";

import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

const logger = pino({ level: "info" });

export const initMiddleware = (app: OpenAPIHono<appContext>) => {
  // middleware will be executed in the order they are added
  app.use(prettyJSON());
  app.use(cors());
  app.use("*", requestId());
  app.use("*", pinoLogger(logger));

  // language i18next middleware
  app.use("*", async (c, next) => {
    await i18next.init({
      // debug: true,
      resources: {
        en: { translation: { ...require("../locales/en.json") } },
        ar: { translation: { ...require("../locales/ar.json") } },
      },
      lookupHeader: "accept-language",
      fallbackLng: "en",
      preload: ["en", "ar"],
      saveMissing: true,
      interpolation: { escapeValue: false },
    });
    c.set("t", i18next.t);
    i18next.changeLanguage(c.req.header("accept-language") || "en");
    await next();
  });

  // middleware to add custom variables to the context
  app.use(async (c, next) => {
    c.set("logger", logger);
    c.set("ip", c.req.header("x-forwarded-for") || "unknown"); // add client IP to the context
    await next();
  });

  // prism middleware
  app.use(async (c, next) => {
    const adapter = new PrismaD1(c.env.DB);
    const prisma = new PrismaClient({ adapter });
    c.set("prisma", prisma);
    await next();
  });

  // middleware to verify JWT token
  app.use("/api/*", async (c, next) => {
    const t = c.var.t;
    const token = c.req.header("authorization")?.split(" ")[1];
    if (!token) {
      return c.json({ message: t("auth.error.unauthorized") }, 401);
    }
    try {
      const user = await verify(token, c.env.JWT_SECRET || "default-secret-key");
      c.set("user", user as authorizedUser);
      await next();
    } catch (error) {
      return c.json({ message: t("auth.error.unauthorized") }, 401);
    }
  });

  return app;
};
