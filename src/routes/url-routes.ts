import { Request, Response } from "express";
export const postUrl = async (req: Request, res: Response) => {
  return res.send("test");
};
