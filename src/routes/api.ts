import { Request, Response } from "express";
import { Router } from "express";
import { validate } from "src/utils/validate";
import { getUrl, postUrl } from "./url-routes";

const urlRouter = Router();
urlRouter.post("/", validate("postUrl"), postUrl);
urlRouter.get("/:url", getUrl);
// TODO: add validation
export { urlRouter };
