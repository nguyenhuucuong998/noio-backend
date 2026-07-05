import Joi from "joi";
import { ObjectId } from "mongodb";
import { GET_DB } from "~/config/mongodb";

const USER_COLLECTION_NAME = "users";

const USER_COLLECTION_SCHEMA = Joi.object({
  account: Joi.string().required(),
  name: Joi.string().required().trim().strict(),
  phone: Joi.string().required().trim().strict(),
  email: Joi.string().email().required().trim().strict(),
  password: Joi.string().required().trim().strict(),
  is_verified: Joi.string().trim().strict(),
  province: Joi.string().default("local"),
  reset_token: Joi.string().default(null),
  reset_token_expire: Joi.boolean().default(false),
  createdAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const validateBeoreCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const findUser = async (data) => {
  try {
    // check username tồn tại chưa
    const Email = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ email: data.email });
    return Email;
  } catch (error) {
    throw new Error(error);
  }
};

const findEmail = async (data) => {
  try {
    const email = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ email: data.email });

    return email;
  } catch (error) {
    throw new Error(error);
  }
};
const createNew = async (userData) => {
  const validatedData = await validateBeoreCreate(userData);

  try {
    const createdUser = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(validatedData);

    return createdUser;
  } catch (error) {
    throw new Error(error);
  }
};

const findId = async (id) => {
  try {
    const user = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: id });

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const getUser = async (id) => {
  try {
    const userResults = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id), // Lọc đúng user theo id
          },
        },
        {
          $lookup: {
            from: "rental_rooms", // Tên collection chứa bài viết
            localField: "_id", // Trường _id của bảng User (bảng hiện tại)
            foreignField: "userId", // Trường userId của bảng Post (bảng cần join)
            as: "posts", // Đặt tên mảng kết quả trả về là "posts"
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();
    // Vì aggregate trả về mảng, lấy phần tử đầu tiên để ra Object User
    const getData = userResults.length > 0 ? userResults[0] : null;
    return getData;
  } catch (error) {
    throw new Error(error);
  }
};

const verifyApprove = async (otp) => {
  const result = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .updateOne(
      { email: otp.email },
      {
        $set: {
          is_verified: false,
          updatedAt: Date.now(),
        },
      },
    );
  return result;
};

const userLogin = async (data) => {
  try {
    const login = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ email: data.email, is_verified: false, _destroy: false });

    return login;
  } catch (error) {
    throw new Error(error);
  }
};

const forgotpassword = async (email) => {
  try {
    const findEmail = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ email: email });

    return findEmail;
  } catch (error) {
    throw new Error(error);
  }
};

const VerifyLinkForgotPassword = async (email, token) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .updateOne(
        {
          email: email,
        },
        {
          $set: {
            reset_token: token,
            reset_token_expire: Date.now() + 10 * 60 * 1000,
            reset_token_used_count: 0,
            updatedAt: Date.now(),
          },
        },
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const changePassword = async (email, pass) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .updateOne(
        {
          email: email,
        },
        {
          $set: {
            password: pass,
            reset_token: null,
            reset_token_expire: Date.now(),
            is_verified: false,
            updatedAt: Date.now(),
          },
        },
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const verifyTokenForgotpassword = async (token) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ reset_token: token });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const resertToken = async (data) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .updateOne(
        {
          reset_token: data.token,
        },
        {
          $set: {
            reset_token_used_count: data.count,
            reset_token: data.count >= 2 ? Date.now() : data.token,
          },
        },
      );

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  findUser,
  findId,
  findEmail,
  createNew,
  userLogin,
  verifyApprove,
  forgotpassword,
  VerifyLinkForgotPassword,
  changePassword,
  verifyTokenForgotpassword,
  resertToken,
  getUser,
};
