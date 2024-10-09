import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { appContext } from "../type";

export const swaggerMiddleware = (app: OpenAPIHono<appContext>) => {
  // serve the swagger UI and documentation
  app.get("/ui", swaggerUI({ url: "/documentation" }));
  // serve the swagger documentation
  app.openAPIRegistry.registerComponent("securitySchemes", "ApiKey", {
    type: "http",
    scheme: "bearer",
  });
  app.doc("/documentation", {
    info: {
      title: "Hono API",
      description: "API documentation for the Hono API",
      version: "1.0.0",
    },
    openapi: "3.0.0",
  });
};
