import { Request, Response } from "express";
import { Router } from "express";
import { comparePassword } from "src/utils/hash";
import { validate } from "src/utils/validate";
import { getUrl, postUrl, getProtectedUrl } from "./url-routes";

const urlRouter = Router();
urlRouter.post("/", validate("postUrl"), postUrl);
urlRouter.get("/:url", getUrl);
urlRouter.post("/:url", getProtectedUrl);
// TODO: add validation

export { urlRouter };
