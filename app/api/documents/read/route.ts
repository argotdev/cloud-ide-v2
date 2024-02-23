import { NextRequest } from "next/server";
const { MongoClient } = require("mongodb");

export async function POST(req: NextRequest) {
  const data = await req.json();
  console.log(data["userID"]);
  console.log(process.env.MONGODB_URI);

  const client = new MongoClient(process.env.MONGODB_URI);

  // The connect() method does not attempt a connection; instead it instructs
  // the driver to connect using the settings provided when a connection
  // is required.
  await client.connect();

  // Provide the name of the database and collection you want to use.
  // If the database and/or collection do not exist, the driver and Atlas
  // will create them automatically when you first write data.
  const dbName = "myDatabase";
  const collectionName = "files";

  // Create references to the database and collection in order to run
  // operations on them.
  const database = client.db(dbName);
  const collection = database.collection(collectionName);

  try {
    // Find all documents where userID = 1
    const documentsCursor = collection.find({ userId: data["userId"] });
    const documents = await documentsCursor.toArray();

    console.log("Loaded documents:", documents);
    client.close();
    return Response.json(documents);
  } catch (err) {
    console.error(
      `Something went wrong trying to insert the new documents: ${err}\n`
    );
  }
}
