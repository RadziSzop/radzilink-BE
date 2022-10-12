import { Request, Response } from "express";
import { Router } from "express";
import { postUrl } from "./url-routes";

const urlRouter = Router();
urlRouter.post("/", postUrl);
export { urlRouter };
