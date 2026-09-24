import mongoose from "mongoose";
import env from "./env.config.js";

export const connection = mongoose.connection

const connectDB = async () => {
   try {

      connection.on("connected", () => console.log("Server connected to database"))
      connection.on("disconnected", () => console.log("Server disconnected to database"))
      connection.on("error", (err) => console.error("Database error: ", err))
      connection.on("reconnected", () => console.log("server reconnected to db again"))

      await mongoose.connect(env.URI, {
         dbName: env.NAME,
         serverSelectionTimeoutMS: 5000,
         connectTimeoutMS: 10000,
         socketTimeoutMS: 45000,
         maxIdleTimeMS: 30000,
         waitQueueTimeoutMS: 5000,

         maxPoolSize: 10,
         minPoolSize: 2,

         retryWrites: true,
         retryReads: true,
         family: 4,
      })

   } catch (error) {
      throw new Error("DB connect failed", {
         cause: error
      });
   }
}

export default connectDB