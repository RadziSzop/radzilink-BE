import { linksDB } from "../utils/db";
import { ObjectId } from "mongodb";
import { encode } from "base62";
import { CustomError } from "@shared/errors";
// import { lastIndex } from "../utils/getIndex";
let currentDBIndex: number;
(async () => {
  const index = await linksDB
    .find({ isCustom: false })
    .sort({ index: -1 })
    .limit(1)
    .toArray();
  console.log(index);
  console.log(index.length > 0);

  currentDBIndex = index.length > 0 ? index[0].index : 0;
  console.log(currentDBIndex);
})();
interface IClassProps {
  _id?: ObjectId;
  destinationUrl: string;
  customUrl?: string | null;
  password?: string | null;
  deleteAfterRead?: boolean;
  analitics?: boolean;
}
export class UrlRecord {
  destinationUrl: string;
  encodedIndex: string;
  constructor(private props: IClassProps) {
    this.destinationUrl =
      props.destinationUrl.includes("https://") ||
      props.destinationUrl.includes("http://")
        ? props.destinationUrl
        : `https://${props.destinationUrl}`;
    this.encodedIndex = this.props.customUrl
      ? this.props.customUrl
      : encode(currentDBIndex);
  }
  async insert() {
    console.log("index", currentDBIndex);

    const insertIfDoesntExist = async () => {
      if (!Boolean(this.props.customUrl)) {
        this.encodedIndex = encode(++currentDBIndex);
      }
      console.log("encoded", this.encodedIndex);

      console.log(Boolean(this.props.customUrl));

      const { upsertedId } = await linksDB.updateOne(
        {
          encodedIndex: this.encodedIndex,
        },
        {
          $setOnInsert: {
            destinationUrl: this.destinationUrl,
            // HASH password
            password: this.props.password ? this.props.password : null,
            deleteAfterRead: this.props.deleteAfterRead
              ? this.props.deleteAfterRead
              : false,
            analitics: this.props.analitics ? this.props.analitics : false,
            encodedIndex: this.encodedIndex,
            createdAt: new Date(),
            isCustom: Boolean(this.props.customUrl),
            index: Boolean(this.props.customUrl) ? null : currentDBIndex,
          },
        },
        { upsert: true }
      );
      return upsertedId;
    };

    while (true) {
      const upsertedId = await insertIfDoesntExist();
      if (upsertedId) {
        this.props._id = upsertedId;
        break;
      }
      if (!upsertedId && Boolean(this.props.customUrl)) {
        throw new CustomError("This url is already taken.", 409);
      }
    }
    // from biggest index (non custom), add 1 until not found empty
    const returnData: any = { ...this.props };
    delete returnData._id;
    delete returnData.password;
    returnData.destinationUrl = this.destinationUrl;
    returnData.encodedIndex = `${process.env.URL}/${this.encodedIndex}`;
    console.log(returnData);

    return returnData;
  }

  async delete() {
    if (!this.props._id) {
      throw new Error("Can't delete url without proper ID.");
    } else {
      await linksDB.deleteOne({
        _id: this.props._id,
      });
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

  //   static async findAll() {
  //     return (await (await linksDB.find()).toArray()).map(
  //       (obj) => new TodoRecord(obj)
  //     );
  //   }

  //   static async findAllWithCursor() {
  //     return /*await*/ linksDB.find();
  //   }

  //   static async find(id) {
  //     const item = await linksDB.findOne({ _id: ObjectId(String(id)) });
  //     return item === null ? null : new TodoRecord(item);
  //   }
}
