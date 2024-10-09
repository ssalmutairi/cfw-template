import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { User } from "@prisma/client";
import { userModel } from "../../prisma/zod";
import { sharedResponseSchema } from "../helpers/shared.schema";
import { appContext } from "../type";
import { HTTPException } from "hono/http-exception";
import { hashPassword } from "../helpers/common";

export const userSchema = userModel.omit({ password: true }).extend({
  extra: z.boolean().optional(),
});
export const userCreateSchema = userModel.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const userUpdateSchema = userModel.partial().omit({
  id: true,
});

// User routes
export const userRoutes = new OpenAPIHono<appContext>({
  defaultHook: (result) => {
    if (!result.success) {
      throw result.error;
    }
  },
});

// endpoint: get all users
userRoutes.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["users"],
    request: {
      query: z.object({
        page: z.string().optional(), // Add page as a query parameter
        pageSize: z.string().optional(), // Add pageSize as a query parameter
      }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: z.array(userSchema) } },
        description: "get paginated users",
      },
      ...sharedResponseSchema,
    },
    security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const page = parseInt(c.req.query("page") || "1");
    const pageSize = parseInt(c.req.query("pageSize") || "10");
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const users = await c.get("prisma").user.findMany({ skip, take });
    return c.json(users, 200);
  },
);

// endpoint: create a new user
userRoutes.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["users"],
    request: {
      body: {
        content: { "application/json": { schema: userCreateSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: userSchema } },
        description: "create a new user",
      },
      ...sharedResponseSchema,
    },
    security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const t = c.get("t"); // get the i18next translation function
    const userData = userCreateSchema.parse(await c.req.json());

    // Check if the user already exists
    const existingUser = await c.get("prisma").user.findUnique({ where: { email: userData.email } });
    if (existingUser) {
      throw new HTTPException(400, { message: t("auth.error.userExists") });
    }

    // Hash the password before saving
    const hashedPassword = await hashPassword(userData.password);
    const newUser = await c.get("prisma").user.create({
      data: { ...userData, password: hashedPassword },
    });

    const user = userSchema.parse(newUser);
    return c.json(user, 200);
  },
);

// endpoint: get user by id
userRoutes.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["users"],
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: userSchema } },
        description: "get user by id",
      },
      ...sharedResponseSchema,
    },
    security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const t = c.get("t");
    const id = parseInt(c.req.param("id"));
    const user = await c.get("prisma").user.findUnique({ where: { id } });
    if (!user) {
      throw new HTTPException(404, { message: t("user.error.notFound") });
    }
    return c.json(user, 200);
  },
);

// endpoint: update user by id
userRoutes.openapi(
  createRoute({
    method: "put",
    path: "/{id}",
    tags: ["users"],
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: { "application/json": { schema: userUpdateSchema } },
        required: true,
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: userSchema } },
        description: "update user",
      },
      ...sharedResponseSchema,
    },
    security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const t = c.get("t"); // get the i18next translation function
    const id = parseInt(c.req.param("id"));
    const updatedData = userModel.parse(await c.req.json());
    const updatedUser = await c.get("prisma").user.update({ where: { id }, data: updatedData });

    if (!updatedUser) {
      throw new HTTPException(404, { message: t("user.error.notFound") });
    }

    return c.json(updatedUser, 200);
  },
);

// endpoint: delete user by id
userRoutes.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["users"],
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      204: {
        description: "user deleted",
      },
      ...sharedResponseSchema,
    },
    security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"));
    await c.get("prisma").user.delete({ where: { id } });
    return c.json(null, 204);
  },
);
