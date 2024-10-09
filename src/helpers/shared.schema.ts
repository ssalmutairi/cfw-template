import { z } from "@hono/zod-openapi";

// write schema for errors for all routes in the application
export const ErrorSchema = z
  .object({
    message: z.string(),
    code: z.number(),
  })
  .openapi("Error");

// write
export const sharedResponseSchema = {
  400: {
    content: { "application/json": { schema: ErrorSchema } },
    description: "Bad Request",
  },
  401: {
    content: { "application/json": { schema: ErrorSchema } },
    description: "Unauthorized",
  },
  403: {
    content: { "application/json": { schema: ErrorSchema } },
    description: "Forbidden",
  },
  404: {
    content: { "application/json": { schema: ErrorSchema } },
    description: "Not Found",
  },
  500: {
    content: { "application/json": { schema: ErrorSchema } },
    description: "Internal Server Error",
  },
};
