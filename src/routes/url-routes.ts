import { CustomError } from "@shared/errors";
import { Request, Response } from "express";
import { UrlRecord } from "src/records/url.record";
import { getProtectedUrlBody, postUrlBody } from "src/types/urlRoutesTypes";
import { comparePassword } from "src/utils/hash";
const WEBURL = process.env.WEBURL ? process.env.WEBURL : "localhost:5173";

export const postUrl = async (req: Request, res: Response) => {
  const body = req.body as postUrlBody;
  console.log("aaaaaaaaaaaaaaa", { body });

  const urlRec = new UrlRecord({
    destinationUrl: body.destinationUrl,
    analitics: body.analitics,
    customUrl: body.customUrl,
    deleteAfterRead: body.deleteAfterRead,
    password: body.password,
    deleteTime: body.deleteTime,
  });
  const returnData = await urlRec.insert();
  return res.json(returnData);
};

export const getUrl = async (req: Request, res: Response) => {
  console.log("b", req.body, req.params);
  const url = await UrlRecord.find(req.params.url);
  console.log("c", url);

  const urlRec = new UrlRecord({
    _id: url._id,
    destinationUrl: url.destinationUrl,
    analitics: url.analitics,
    customUrl: url.isCustom ? url.customUrl : null,
    deleteAfterRead: url.deleteAfterRead,
    deleteTime: url.deleteTime,
    password: url.password,
    encodedIndex: req.params.url,
  });
  console.log("d", { urlRec });

  const returnData = url.password
    ? {
        isProtected: true,
      }
    : {
        isProtected: false,
        data: {
          link: `${WEBURL}/${req.params.url}`,
          destinationUrl: url.destinationUrl,
          analitics: url.analitics,
          deleteAfterRead: url.deleteAfterRead,
        },
      };
  console.log("e", { returnData });
  if (url.deleteTime) {
    if (url.deleteTime < Math.floor(new Date().getTime() / 1000)) {
      urlRec.delete();
      throw new CustomError("This url doesn't exist", 404);
    }
  } else if (url.deleteAfterRead && !url.password) {
    urlRec.delete();
  }
  return res.json(returnData);
};
export const getProtectedUrl = async (req: Request, res: Response) => {
  const url = await UrlRecord.find(req.params.url);
  const body = req.body as getProtectedUrlBody;
  const urlRec = new UrlRecord({
    _id: url._id,
    destinationUrl: url.destinationUrl,
    analitics: url.analitics,
    customUrl: url.isCustom ? url.customUrl : null,
    deleteAfterRead: url.deleteAfterRead,
    password: url.password,
    encodedIndex: req.params.url,
  });
  let returnData;
  if (url.password && body.password) {
    if (await comparePassword(body.password, url.password)) {
      returnData = {
        success: true,
        data: {
          link: `${WEBURL}/${req.params.url}`,
          destinationUrl: url.destinationUrl,
          analitics: url.analitics,
          deleteAfterRead: url.deleteAfterRead,
        },
      };
      if (url.deleteAfterRead) {
        urlRec.delete();
      }
    } else {
      returnData = {
        success: false,
      };
    }
  } else {
    returnData = url.password
      ? {
          isProtected: true,
        }
      : {
          isProtected: false,
          data: {
            link: `${WEBURL}/${req.params.url}`,
            destinationUrl: url.destinationUrl,
            analitics: url.analitics,
            deleteAfterRead: url.deleteAfterRead,
          },
        };
    if (!url.password && url.deleteAfterRead) {
      urlRec.delete();
    }
  }

  return res.json(returnData);
};
