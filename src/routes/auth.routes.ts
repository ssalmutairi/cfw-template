import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { sharedResponseSchema } from "../helpers/shared.schema";
import { appContext } from "../type";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { comparePassword, hashPassword } from "../helpers/common";
import { userModel } from "../../prisma/zod";
import { userSchema } from "./user.routes";

// Registration schema
export const registerSchema = userModel.omit({ id: true, createdAt: true, updatedAt: true });

// Login schema
export const loginSchema = userModel.pick({ username: true, password: true });

// Auth routes
export const authRoutes = new OpenAPIHono<appContext>({
  defaultHook: (result) => {
    if (!result.success) {
      throw result.error;
    }
  },
});

// endpoint: user registration
authRoutes.openapi(
  createRoute({
    method: "post",
    path: "/register",
    tags: ["auth"],
    request: {
      body: {
        content: { "application/json": { schema: registerSchema } },
        description: "register a new user",
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: userSchema } },
        description: "User registered successfully",
      },
      ...sharedResponseSchema,
    },
  }),
  async (c) => {
    const t = c.get("t"); // i18n translation function
    const prisma = c.get("prisma");
    const userData = registerSchema.parse(await c.req.json());

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existingUser) {
      throw new HTTPException(400, { message: t("auth.error.userExists") });
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(userData.password);
    const newUser = await prisma.user.create({
      data: { ...userData, password: hashedPassword },
    });

    const user = userSchema.parse(newUser);
    return c.json(user, 200);
  },
);

// endpoint: user login
authRoutes.openapi(
  createRoute({
    method: "post",
    path: "/login",
    tags: ["auth"],
    request: {
      body: {
        content: { "application/json": { schema: loginSchema } },
      },
    },
    responses: {
      200: {
        description: "Login successful, returns JWT token",
        content: {
          "application/json": {
            schema: z.object({ token: z.string() }),
          },
        },
      },
      ...sharedResponseSchema,
    },
  }),
  async (c) => {
    const t = c.get("t"); // i18n translation function
    const prisma = c.get("prisma");

    const loginData = loginSchema.parse(await c.req.json());

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { username: loginData.username },
    });

    if (!user) {
      throw new HTTPException(401, { message: t("auth.error.invalidCredentials") });
    }

    // Verify the password
    const passwordMatch = await comparePassword(loginData.password, user.password);
    if (!passwordMatch) {
      throw new HTTPException(401, { message: t("auth.error.invalidCredentials") });
    }

    // Generate a JWT token
    const token = await sign(
      { id: user.id, name: user.name, email: user.email },
      c.env.JWT_SECRET || "default-secret-key",
    );

    return c.json({ token }, 200);
  },
);
