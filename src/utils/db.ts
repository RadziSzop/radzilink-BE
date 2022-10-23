import { MongoClient } from "mongodb";
if (!process.env.DBPASS) {
  throw new Error("invalid .env setup.");
}
const client =
  new MongoClient(`mongodb+srv://Admin:${process.env.DBPASS}@radzilink.bxpdk54.mongodb.net/?retryWrites=true&w=majority
`);
client.connect();
const database = client.db("radzilink");
const linksDB = database.collection("links");
export { linksDB };
