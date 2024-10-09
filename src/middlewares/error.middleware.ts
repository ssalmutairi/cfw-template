import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { StatusCode } from "hono/utils/http-status";
import { appContext } from "../type";

export const errorMiddleware = (app: OpenAPIHono<appContext>) => {
  app.onError((error: any, c) => {
    c.var.logger.error(error);
    const t = c.get("t"); // get the i18next translation function
    let message = t("error.http.internalServerError");
    let code = 500 as StatusCode;

    if (error.name === "ZodError") {
      const errors = error.issues.map((issue: any) => {
        const field = issue.path.join("."); // Get the specific field causing the error
        let errorMessage = "";

        // Comprehensive mapping of Zod error codes
        switch (issue.code) {
          case "invalid_type":
            errorMessage = t("error.validation.invalidType", {
              field,
              expected: t(`error.inputTypes.${issue.expected}`),
            });
            break;

          case "invalid_literal":
            errorMessage = t("error.validation.invalidLiteral", {
              field,
              expected: issue.expected,
            });
            break;

          case "custom":
            errorMessage = t("error.validation.custom", { field, message: issue.message });
            break;

          case "invalid_union":
            errorMessage = t("error.validation.invalidUnion", { field });
            break;

          case "invalid_union_discriminator":
            errorMessage = t("error.validation.invalidUnionDiscriminator", { field });
            break;

          case "invalid_enum_value":
            errorMessage = t("error.validation.invalidEnumValue", {
              field,
              options: issue.options.join(", "),
            });
            break;

          case "invalid_date":
            errorMessage = t("error.validation.invalidDate", { field });
            break;

          case "invalid_string":
            if (issue.validation === "email") {
              errorMessage = t("error.validation.invalidEmail", { field });
            } else if (issue.validation === "url") {
              errorMessage = t("error.validation.invalidUrl", { field });
            } else {
              errorMessage = t("error.validation.invalidString", { field });
            }
            break;

          case "too_small":
            if (issue.type === "string") {
              errorMessage = t("error.validation.stringTooSmall", {
                field,
                min: issue.minimum,
              });
            } else if (issue.type === "number") {
              errorMessage = t("error.validation.numberTooSmall", {
                field,
                min: issue.minimum,
              });
            }
            break;

          case "too_big":
            if (issue.type === "string") {
              errorMessage = t("error.validation.stringTooBig", {
                field,
                max: issue.maximum,
              });
            } else if (issue.type === "number") {
              errorMessage = t("error.validation.numberTooBig", {
                field,
                max: issue.maximum,
              });
            }
            break;

          case "not_multiple_of":
            errorMessage = t("error.validation.notMultipleOf", {
              field,
              multiple: issue.multipleOf,
            });
            break;

          case "not_finite":
            errorMessage = t("error.validation.notFinite", { field });
            break;

          case "unrecognized_keys":
            errorMessage = t("error.validation.unrecognizedKeys", {
              field,
              keys: issue.keys.join(", "),
            });
            break;

          default:
            errorMessage = t("error.validation.unknown", { field });
        }

        return {
          field,
          message: errorMessage,
        };
      });

      message = errors.map((error: any) => error.message).join("\n ");
      code = 422; // Unprocessable entity
    } else if (error.name === "PrismaClientKnownRequestError") {
      // Handle Prisma client errors based on the error code
      switch (error.code) {
        case "P2002": // Unique constraint violation
          message = t("error.prisma.uniqueConstraint", {
            field: error.meta.target.join(", "),
          });
          code = 409; // Conflict
          break;

        case "P2003": // Foreign key constraint violation
          message = t("error.prisma.foreignKeyConstraint", {
            field: error.meta.field_name,
          });
          code = 400; // Bad request
          break;

        case "P2004": // Constraint violation
          message = t("error.prisma.constraintViolation", {
            field: error.meta.field_name,
          });
          code = 400;
          break;

        case "P2025": // Record not found
          message = t("error.prisma.recordNotFound");
          code = 404; // Not found
          break;

        case "P2000": // Value too long for column
          message = t("error.prisma.valueTooLong", {
            field: error.meta.column_name,
          });
          code = 400;
          break;

        case "P2016": // Query interpretation error
          message = t("error.prisma.queryInterpretation");
          code = 500;
          break;

        default:
          message = t("error.prisma.unknown");
          code = 500;
          break;
      }
    } else if (error instanceof HTTPException) {
      message = error.message;
      code = error.status;
    }

    c.var.logger.error(error, message);
    return c.json({ message, code }, code);
  });
};
