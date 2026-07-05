import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { propertyTypeModel } from "~/models/propertyTypeModel";

const getAll = async () => {
  try {

    // check username tồn tại chưa
    const getAll = await propertyTypeModel.getAll(); //tra kết dữ liệu với database, nếu có lỗi thì sẽ bị catch ở đây và throw error ra để controller bắt được lỗi và trả về cho client, nếu không có lỗi thì sẽ trả về kết quả cho controller để controller trả về cho client

    return getAll;
  } catch (error) {
    throw error;
  }
};




export const propertyTypeService = {
  getAll,
};
