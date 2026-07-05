import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";

const UTILITIE_COLLECTION_NAME = "utilities";

const UTILITIE_COLLECTION_SCHEMA = Joi.object({
 
});

const validateBeoreCreate = async (data) => {
  return await UTILITIE_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const getAll = async () => {
  try {
    // check username tồn tại chưa
    const getAll = await GET_DB()
      .collection(UTILITIE_COLLECTION_NAME)
      .find({}).toArray();
    return getAll;
  } catch (error) {
    throw new Error(error);
  }
};


export const utilitieModel = {
  UTILITIE_COLLECTION_NAME,
  UTILITIE_COLLECTION_SCHEMA,
  getAll,
};
