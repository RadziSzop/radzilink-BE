import { Request, Response } from "express";
import { linksDB } from "src/utils/db";
import { UrlRecord } from "src/records/url.record";

export const postUrl = async (req: Request, res: Response) => {
  const newUrl = new UrlRecord({
    destinationUrl: req.body.destinationUrl,
    analitics: req.body.analitics,
    customUrl: req.body.customUrl,
    deleteAfterRead: req.body.deleteAfterRead,
    password: req.body.password,
  });
  await newUrl.insert();
  // console.log(await newUrl.insert());

  return res.send("test");
};
