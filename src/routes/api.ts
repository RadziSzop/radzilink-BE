import { Request, Response } from "express";
import { Router } from "express";
import { validate } from "src/utils/validate";
import { postUrl } from "./url-routes";

const urlRouter = Router();
urlRouter.post("/", validate("postUrl"), postUrl);
export { urlRouter };
