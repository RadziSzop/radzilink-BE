import { linksDB } from "../utils/db";
import { ObjectId } from "mongodb";
import { encode } from "base62";
import { CustomError } from "@shared/errors";
import { hashPassword } from "../utils/hash";
let currentDBIndex: number;
(async () => {
  const index = await linksDB
    .find({ isCustom: false })
    .sort({ index: -1 })
    .limit(1)
    .toArray();

  currentDBIndex = index.length > 0 ? index[0].index : 0;
  console.log({ currentDBIndex });
})();
interface IClass {
  _id?: ObjectId;
  encodedIndex?: string;
  destinationUrl: string;
  customUrl?: string | null;
  password?: string | null;
  deleteAfterRead?: boolean;
  analitics?: boolean;
}
export class UrlRecord implements IClass {
  _id?: ObjectId;
  encodedIndex: string;
  readonly destinationUrl: string;
  readonly customUrl?: string | null;
  readonly password?: string | null;
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
  }: IClass) {
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
  }

  async insert() {
    const insertIfDoesntExist = async () => {
      if (!Boolean(this.customUrl)) {
        this.encodedIndex = encode(++currentDBIndex);
      }

      const { upsertedId } = await linksDB.updateOne(
        {
          encodedIndex: this.encodedIndex,
        },
        {
          $setOnInsert: {
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

    while (true) {
      const upsertedId = await insertIfDoesntExist();
      if (upsertedId) {
        this._id = upsertedId;
        break;
      }
      if (!upsertedId && Boolean(this.customUrl)) {
        throw new CustomError("This url is already taken.", 409);
      }
    }
    // TODO:  from biggest index (non custom), add 1 until not found empty // when can't find empty index (3 tries)
    console.log(this.password);

    const returnData = {
      link: `${process.env.WEBURL}/${this.encodedIndex}`,
      destinationUrl: this.destinationUrl,
      analitics: this.analitics ?? false,
      deleteAfterRead: this.deleteAfterRead ?? false,
      isProtected: Boolean(this.password),
    };
    return returnData;
  }

  async delete() {
    if (!this._id) {
      throw new Error("Can't delete url without proper ID.");
    } else {
      await linksDB.deleteOne({
        _id: this._id,
      });
    }
  }
  static async find(encodedIndex: string) {
    const link = await linksDB.findOne({ encodedIndex: encodedIndex });
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
