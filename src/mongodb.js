import { MongoClient, ServerApiVersion } from "mongodb";

import { MONGODB_URI } from "./constants.js";

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const getCollection = () => client.db("webhooks").collection("logs");

export const insertLog = async ({ date, log, type }) => {
  const collection = await getCollection();
  await collection.insertOne({ type, date, log });
};

export const getLogs = async () => {
  const collection = await getCollection();
  return collection.find({}).toArray();
};

export const getLatestDate = async () => {
  const collection = await getCollection();
  const log = await collection.find({}, { sort: { date: -1 } }).toArray();

  return log[0]?.date;
};
