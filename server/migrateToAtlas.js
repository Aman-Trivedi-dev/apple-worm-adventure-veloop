import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const LOCAL_URI = process.env.MONGODB_URI;
const ATLAS_URI = process.env.ATLAS_URI;

const collections = [
  "users",
  "adrewards",
  "levelcompletions",
  "wallettransactions",
];

const migrateData = async () => {
  let localConnection;
  let atlasConnection;

  try {
    if (!LOCAL_URI || !ATLAS_URI) {
      throw new Error("Missing MONGODB_URI or ATLAS_URI in .env");
    }

    console.log("Connecting to local MongoDB...");

    localConnection = await mongoose
      .createConnection(LOCAL_URI)
      .asPromise();

    console.log("Connecting to MongoDB Atlas...");

    atlasConnection = await mongoose
      .createConnection(ATLAS_URI)
      .asPromise();

    for (const collectionName of collections) {
      console.log(`Migrating ${collectionName}...`);

      const localCollection =
        localConnection.collection(collectionName);

      const atlasCollection =
        atlasConnection.collection(collectionName);

      const documents = await localCollection.find({}).toArray();

      if (documents.length === 0) {
        console.log(`${collectionName}: no documents found`);
        continue;
      }

      // Avoid accidentally inserting duplicate _id values.
      const existingIds = await atlasCollection
        .find(
          { _id: { $in: documents.map((doc) => doc._id) } },
          { projection: { _id: 1 } }
        )
        .toArray();

      const existingIdSet = new Set(
        existingIds.map((doc) => doc._id.toString())
      );

      const newDocuments = documents.filter(
        (doc) => !existingIdSet.has(doc._id.toString())
      );

      if (newDocuments.length > 0) {
        await atlasCollection.insertMany(newDocuments, {
          ordered: true,
        });
      }

      console.log(
        `${collectionName}: ${newDocuments.length} inserted, ` +
        `${existingIds.length} already existed`
      );
    }

    console.log("Migration completed!");
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    if (localConnection) await localConnection.close();
    if (atlasConnection) await atlasConnection.close();
  }
};

migrateData();