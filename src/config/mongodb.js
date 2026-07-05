import {MongoClient, ServerApiVersion} from "mongodb";
import { env } from "./environment";    


let trelloDatabaseInstabce = null;

const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

export const CONNECT_DB = async () => {
    await mongoClientInstance.connect();

    trelloDatabaseInstabce = mongoClientInstance.db(env.DATABASE_NAME);
}

export const GET_DB = () => {
   
    if (!trelloDatabaseInstabce) throw new Error("Database not connected yet. Please call CONNECT_DB first.");

    return trelloDatabaseInstabce;
}


export const CLOSE_DB = async () => {
    await mongoClientInstance.close();
}