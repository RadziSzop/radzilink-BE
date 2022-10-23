import { ObjectId, WithId } from "mongodb";
export interface GetUrlInsertInterface {
  link: string;
  destinationUrl: string;
  analitics: boolean;
  deleteAfterRead: boolean;
  isProtected: boolean;
}
export interface GetUrlDeleteInterface {
  acknowledged: boolean;
  deletedCount: number;
}
export interface UrlDatabaseFind extends WithId<Document> {
  _id: ObjectId;
  encodedIndex: string;
  analitics: boolean;
  createdAt: Date;
  deleteAfterRead: boolean;
  destinationUrl: string;
  index: number;
  isCustom: boolean;
  password: string;
  customUrl?: string;
}

export interface UrlConstructorInterface {
  _id?: ObjectId;
  encodedIndex?: string;
  destinationUrl: string;
  customUrl?: string | null;
  password?: string | null;
  deleteAfterRead?: boolean;
  analitics?: boolean;
}

export interface UrlRecordInterface extends UrlConstructorInterface {
  insert: () => Promise<GetUrlInsertInterface>;
  delete: () => Promise<GetUrlDeleteInterface>;
  //   find: () => Promise<UrlDatabaseFind>;
  //   find: (encodedIndex: string) => Promise<UrlDatabaseFind>;
}
