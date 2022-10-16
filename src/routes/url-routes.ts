import { Request, Response } from "express";
import { UrlRecord } from "src/records/url.record";
import { comparePassword } from "src/utils/hash";

export const postUrl = async (req: Request, res: Response) => {
  const urlRec = new UrlRecord({
    destinationUrl: req.body.destinationUrl,
    analitics: req.body.analitics,
    customUrl: req.body.customUrl,
    deleteAfterRead: req.body.deleteAfterRead,
    password: req.body.password,
  });
  const returnData = await urlRec.insert();
  return res.json(returnData);
};

export const getUrl = async (req: Request, res: Response) => {
  const url = await UrlRecord.find(req.params.url);
  const urlRec = new UrlRecord({
    _id: url._id,
    destinationUrl: url.destinationUrl,
    analitics: url.analitics,
    customUrl: url.isCustom ? url.customUrl : null,
    deleteAfterRead: url.deleteAfterRead,
    password: url.password,
    encodedIndex: req.params.url,
  });
  const returnData = url.password
    ? {
        isProtected: true,
      }
    : {
        isProtected: false,
        data: {
          link: `${process.env.WEBURL}/${req.params.url}`,
          destinationUrl: url.destinationUrl,
          analitics: url.analitics,
          deleteAfterRead: url.deleteAfterRead,
        },
      };
  if (url.deleteAfterRead && !url.password) {
    urlRec.delete();
  }
  return res.json(returnData);
};
export const getProtectedUrl = async (req: Request, res: Response) => {
  const url = await UrlRecord.find(req.params.url);
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
  if (url.password && req.body.password) {
    if (await comparePassword(req.body.password, url.password)) {
      returnData = {
        success: true,
        data: {
          link: `${process.env.WEBURL}/${req.params.url}`,
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
            link: `${process.env.WEBURL}/${req.params.url}`,
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
