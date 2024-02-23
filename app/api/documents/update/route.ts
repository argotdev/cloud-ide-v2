import { NextRequest } from "next/server";
const { MongoClient, ObjectId } = require("mongodb");

export async function POST(req: NextRequest) {
  const data = await req.json();
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

  console.log(data);

  try {
    const updateResult = await collection.updateOne(
      {
        _id: new ObjectId(data["id"]),
      },
      { $set: { text: data["code"] } }
    );

    console.log(updateResult);
    client.close();
    if (updateResult.modifiedCount == 1) {
      return Response.json(data["id"]);
    }
    return Response.json("Error");
  } catch (err) {
    console.error(
      `Something went wrong trying to insert the new documents: ${err}\n`
    );
  }
}
