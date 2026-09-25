import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

let mongo: MongoMemoryServer | null = null

export const startTestDB = async () => {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  await mongoose.connect(uri, { dbName: "booksathi-test" })
}

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections
  for (const collection of Object.values(collections)) {
    await collection.deleteMany({})
  }
}

export const stopTestDB = async () => {
  await mongoose.disconnect()
  if (mongo) {
    await mongo.stop()
    mongo = null
  }
}
