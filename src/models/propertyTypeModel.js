import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";

const PROPERTY_TYPE_COLLECTION_NAME = "property_types";

const PROPERTY_TYPE_COLLECTION_SCHEMA = Joi.object({
 
});

const validateBeoreCreate = async (data) => {
  return await PROPERTY_TYPE_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const getAll = async () => {
  try {
    // check username tồn tại chưa
    const getAll = await GET_DB()
      .collection(PROPERTY_TYPE_COLLECTION_NAME)
      .find({}).toArray();
    return getAll;
  } catch (error) {
    throw new Error(error);
  }
};


export const propertyTypeModel = {
  PROPERTY_TYPE_COLLECTION_NAME,
  PROPERTY_TYPE_COLLECTION_SCHEMA,
  getAll,
};
