import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";

const CITIES_COLLECTION_NAME = "cities";

const CITIES_COLLECTION_SCHEMA = Joi.object({
 
});

const validateBeoreCreate = async (data) => {
  return await CITIES_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const getAll = async () => {
  try {
    // check username tồn tại chưa
    const getAll = await GET_DB()
      .collection(CITIES_COLLECTION_NAME)
      .find({}).toArray();
    return getAll;
  } catch (error) {
    throw new Error(error);
  }
};


export const citiesModel = {
  CITIES_COLLECTION_NAME,
  CITIES_COLLECTION_SCHEMA,
  getAll,
};
