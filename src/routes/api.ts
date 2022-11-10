import { Router } from "express";
import { validate } from "../utils/validate";
import { getUrl, postUrl, getProtectedUrl } from "./url-routes";

const urlRouter = Router();
urlRouter.post("/", validate("postUrl"), postUrl);
urlRouter.get("/:url", getUrl);
urlRouter.post("/:url", getProtectedUrl);
// TODO: add validation

export { urlRouter };
