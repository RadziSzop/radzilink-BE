import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import StatusCodes from "http-status-codes";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import logger from "jet-logger";
import envVars from "@shared/env-vars";
import { CustomError } from "@shared/errors";
import { NodeEnvs } from "@shared/enums";
import { urlRouter } from "@routes/api";
import cors from "cors";
import { limiter } from "@shared/limiter";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);
if (envVars.nodeEnv === NodeEnvs.Dev) {
  app.use(morgan("dev"));
}

if (envVars.nodeEnv === NodeEnvs.Production) {
  app.use(helmet());
}

app.use("/url", urlRouter);
app.use(
  (
    err: Error | CustomError,
    _: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) => {
    logger.err(err, true);

    const status =
      err instanceof CustomError ? err.HttpStatus : StatusCodes.BAD_REQUEST;
    return res.status(status).json({
      error: err.message,
    });
  }
);
export default app;
