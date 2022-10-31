import { linksDB } from "../utils/db";
import { ObjectId } from "mongodb";
import { encode } from "base62";
import { CustomError } from "@shared/errors";
import { hashPassword } from "../utils/hash";
import {
  UrlConstructorInterface,
  UrlDatabaseFind,
  UrlRecordInterface,
} from "src/types/urlRecordTypes";
let currentDBIndex: number;
(async () => {
  const index = await linksDB
    .find({ isCustom: false })
    .sort({ index: -1 })
    .limit(1)
    .toArray();

  if (index.length !== 0) {
    if (typeof index[0].index !== "number") {
      throw new Error("Couldn't get current DB index.");
    }
  }
  currentDBIndex = index.length > 0 ? index[0].index : 0;
  console.log({ currentDBIndex });
})();
const WEBURL = process.env.WEBURL ? process.env.WEBURL : "localhost:5173";
// TODO: create config file for geting env variables
export class UrlRecord implements UrlRecordInterface {
  _id?: ObjectId;
  encodedIndex: string;
  readonly destinationUrl: string;
  readonly customUrl?: string | null;
  readonly password?: string | null;
  readonly deleteTime?: number | null;
  readonly deleteAfterRead?: boolean;
  readonly analitics?: boolean;
  constructor({
    destinationUrl,
    encodedIndex,
    _id,
    analitics,
    customUrl,
    deleteAfterRead,
    password,
    deleteTime,
  }: UrlConstructorInterface) {
    console.log({ encodedIndex, customUrl });

    this.destinationUrl =
      destinationUrl.includes("https://") || destinationUrl.includes("http://")
        ? destinationUrl
        : `https://${destinationUrl}`;
    if (encodedIndex) {
      this.encodedIndex = encodedIndex;
    } else {
      this.encodedIndex = customUrl ? customUrl : encode(currentDBIndex);
    }
    this._id = _id;
    this.analitics = analitics;
    this.customUrl = customUrl;
    this.deleteAfterRead = deleteAfterRead;
    this.password = password;
    this.deleteTime = deleteTime;
  }

  async insert() {
    const insertIfDoesntExist = async () => {
      if (!Boolean(this.customUrl)) {
        this.encodedIndex = encode(++currentDBIndex);
      }
      console.log("aaaa", this.deleteTime);
      const { upsertedId } = await linksDB.updateOne(
        {
          encodedIndex: this.encodedIndex,
        },
        {
          $setOnInsert: {
            deleteTime: this.deleteTime ? this.deleteTime : false,
            destinationUrl: this.destinationUrl,
            password: this.password ? await hashPassword(this.password) : null,
            deleteAfterRead: this.deleteAfterRead
              ? this.deleteAfterRead
              : false,
            analitics: this.analitics ? this.analitics : false,
            encodedIndex: this.encodedIndex,
            createdAt: new Date(),
            isCustom: Boolean(this.customUrl),
            index: currentDBIndex,
          },
        },
        { upsert: true }
      );
      return upsertedId;
    };
    let upsertedId: false | ObjectId = false;
    while (!upsertedId) {
      upsertedId = await insertIfDoesntExist();
      if (upsertedId) {
        this._id = upsertedId;
        break;
      }
      if (!upsertedId && Boolean(this.customUrl)) {
        throw new CustomError("This url is already taken.", 409);
      }
    }
    // TODO:  from biggest index (non custom), add 1 until not found empty // when can't find empty index (3 tries)
    console.log("password", this.password);

    const returnData = {
      link: `${WEBURL}/${this.encodedIndex}`,
      destinationUrl: this.destinationUrl,
      analitics: this.analitics ?? false,
      deleteAfterRead: this.deleteAfterRead ?? false,
      deleteTime: this.deleteTime ?? false,
      isProtected: Boolean(this.password),
    };
    return returnData;
  }

  async delete() {
    if (!this._id) {
      throw new Error("Can't delete url without proper ID.");
    } else {
      const deleted = await linksDB.deleteOne({
        _id: this._id,
      });
      return deleted;
    }
  }

  // find: (encodedIndex: string) => Promise<UrlDatabaseFind>;
  static async find(encodedIndex: string) {
    const link = (await linksDB.findOne({
      encodedIndex: encodedIndex,
    })) as UrlDatabaseFind;

    if (link) {
      return link;
    } else {
      throw new CustomError("This url doesn't exist", 404);
    }
  }
  //   async update() {
  //     await linksDB.replaceOne(
  //       {
  //         _id: this._id,
  //       },
  //       {
  //         title: String(this.title),
  //       }
  //     );
  //   }
}
