import { CustomError } from "@shared/errors";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";
const destinationUrlRegex =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

const postUrlSchema = z.object({
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
});
type validationType = "postUrl";
export const validate = (type: validationType): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (type === "postUrl") {
      const validationOutput = await postUrlSchema.safeParseAsync(req.body);
      if (!validationOutput.success) {
        const validationErrors = validationOutput.error.errors
          .map((element) => {
            console.log(element);

            return element.message;
          })
          .join(" ");

        throw new CustomError(validationErrors, 400);
      }
    }
    next();
  };
};
