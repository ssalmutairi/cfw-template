import { OpenAPIHono } from "@hono/zod-openapi";
import { errorMiddleware } from "./middlewares/error.middleware";
import { initMiddleware } from "./middlewares/init.middleware";
import { swaggerMiddleware } from "./middlewares/swagger.middleware";
import { appContext } from "./type";

// routes imports
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import { templateRoutes } from "./routes/template.routes";

const app = new OpenAPIHono<appContext>({
  defaultHook: (result) => {
    if (!result.success) {
      throw result.error;
    }
  },
});

// middlewares
initMiddleware(app);
swaggerMiddleware(app);
errorMiddleware(app);

// public routes
app.get("/", (c) => c.text("API is running"));

// protected routes
app.route("/auth", authRoutes);
app.route("/template", templateRoutes);
app.route("/api/users", userRoutes);

// undefined routes
app.notFound((c) => c.text("Not Implemented", 501));

export default app;
