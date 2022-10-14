import { MongoClient } from "mongodb";
const client =
  new MongoClient(`mongodb+srv://Admin:${process.env.DBPASS}@radzilink.bxpdk54.mongodb.net/?retryWrites=true&w=majority
`);
client.connect();
const database = client.db("radzilink");
const linksDB = database.collection("links");
export { linksDB };
