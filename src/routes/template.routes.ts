import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { sharedResponseSchema } from "../helpers/shared.schema";
import { appContext } from "../type";
import { HTTPException } from "hono/http-exception";

// schema definition

// template routes
const templateSchema = z.object({});
const templateCreateSchema = templateSchema.omit({});
const templateUpdateSchema = templateSchema.omit({});

export const templateRoutes = new OpenAPIHono<appContext>({
  defaultHook: (result) => {
    if (!result.success) {
      throw result.error;
    }
  },
});

// endpoint: get all templates
templateRoutes.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["templates"],
    request: {
      query: z.object({
        page: z.string().optional(),
        pageSize: z.string().optional(),
      }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: z.array(templateSchema) } },
        description: "get all templates paginated",
      },
      ...sharedResponseSchema,
    },
    // security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const page = parseInt(c.req.query("page") || "1");
    const pageSize = parseInt(c.req.query("pageSize") || "10");
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // const templates = await c.get("prisma").template.findMany({ skip, take });
    // return c.json(templates, 200);
    return c.json([], 200);
  },
);

// endpoint: create a new template
templateRoutes.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["templates"],
    request: {
      body: {
        content: { "application/json": { schema: templateCreateSchema } },
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: templateSchema } },
        description: "create a new template",
      },
      ...sharedResponseSchema,
    },
    // security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const t = c.get("t"); // get the i18next translation function
    const templateData = templateCreateSchema.parse(await c.req.json());
    // TODO: logic to create a new template

    const template = templateSchema.parse(templateData);
    return c.json(template, 200);
  },
);

// endpoint: get template by id
templateRoutes.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["templates"],
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: templateSchema } },
        description: "get template by id",
      },
      ...sharedResponseSchema,
    },
    // security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const t = c.get("t");
    const id = parseInt(c.req.param("id"));
    // TODO: logic to get template by id

    return c.json({}, 200);
  },
);

// endpoint: update user by id
templateRoutes.openapi(
  createRoute({
    method: "put",
    path: "/{id}",
    tags: ["templates"],
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: { "application/json": { schema: templateUpdateSchema } },
        required: true,
      },
    },
    responses: {
      200: {
        content: { "application/json": { schema: templateSchema } },
        description: "update user",
      },
      ...sharedResponseSchema,
    },
    // security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const t = c.get("t"); // get the i18next translation function
    const id = parseInt(c.req.param("id"));
    // TODO: logic to update template by id

    return c.json({}, 200);
  },
);

// endpoint: delete user by id
templateRoutes.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["templates"],
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      204: {
        description: "delete template by id",
      },
      ...sharedResponseSchema,
    },
    // security: [{ ApiKey: [] }],
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"));
    // TODO: logic to delete template by id

    return c.json(null, 204);
  },
);
