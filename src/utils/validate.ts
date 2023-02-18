import { CustomError } from "@shared/errors";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";
const destinationUrlRegex =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
const getUrlScheme = z.object({
  url: z
    .string({
      required_error: "Url is required",
      invalid_type_error: "Url must be a string",
    })
    .max(8192),
});
const getProtectedUrlSchemeBody = z.object({
  password: z
    .string({ invalid_type_error: "Password must be a string. " })
    .min(6, "Password is too short. ")
    .max(128, "Password is too long. ")
    .trim(),
});
const getProtectedUrlSchemeParams = z.object({
  url: z
    .string({
      required_error: "Url is required",
      invalid_type_error: "Url must be a string",
    })
    .max(8192),
});

const postUrlScheme = z.object({
  destinationUrl: z
    .string({
      invalid_type_error: "Url must be a string. ",
    })
    .min(1, "Url can't be empty. ")
    .max(8192, "Url is too long. ")
    .regex(destinationUrlRegex, "Url is invalid. ")
    .trim(),
  customUrl: z
    .string({
      invalid_type_error: "CustomUrl must be a string. ",
    })
    .max(8192, "Custom Url is too long. ")
    .trim()
    .optional()
    .or(z.null().optional()),
  password: z
    .string({
      invalid_type_error: "Password must be a string. ",
    })
    .min(6, "Password is too short. ")
    .max(128, "Password is too long. ")
    .trim()
    .optional()
    .or(z.null()),
  deleteAfterRead: z
    .boolean({
      invalid_type_error: "deleteAfterRead must be a boolean. ",
    })
    .optional()
    .or(z.null({ invalid_type_error: "deleteAfterRead must be a boolean. " })),
  analitics: z
    .boolean({
      invalid_type_error: "analitics must be a boolean. ",
    })
    .optional()
    .or(z.null({ invalid_type_error: "analitics must be a boolean. " })),
  deleteTime: z
    .number({
      invalid_type_error: "Delete after time must be a boolean",
    })
    .min(Math.floor(new Date().getTime() / 1000), "You can't set past date")
    .optional()
    .or(z.null()),
});
type validationType = "postUrl" | "getUrl" | "getProtectedUrl";
export const validate = (type: validationType): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (type === "postUrl") {
      const validationOutput = await postUrlScheme.safeParseAsync(req.body);
      if (!validationOutput.success) {
        const validationErrors = validationOutput.error.errors
          .map((element) => {
            return element.message;
          })
          .join(" ");

        throw new CustomError(validationErrors, 400);
      }
    } else if (type === "getUrl") {
      const validationOutput = await getUrlScheme.safeParseAsync(req.params);
      if (!validationOutput.success) {
        const validationErrors = validationOutput.error.errors
          .map((element) => {
            return element.message;
          })
          .join(" ");

        throw new CustomError(validationErrors, 400);
      }
    } else if (type === "getProtectedUrl") {
      const validationOutput = [
        await getProtectedUrlSchemeBody.safeParseAsync(req.body),
        await getProtectedUrlSchemeParams.safeParseAsync(req.params),
      ];
      const validationErrors = validationOutput
        .map((element) => {
          if (!element.success) {
            const validationErrors = element.error.errors
              .map((error) => {
                return error.message;
              })
              .join(" ");
            return validationErrors;
          }
        })
        .join("");
      throw new CustomError(validationErrors, 400);
    }
    next();
  };
};
