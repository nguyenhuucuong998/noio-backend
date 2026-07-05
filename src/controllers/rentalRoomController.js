import { StatusCodes } from "http-status-codes";

import { rentalRoomService } from "~/services/rentalRoomService";

const createNew = async (req, res, next) => {
  const decoded = req.cookies.token;

  try {
    const create = await rentalRoomService.createNew(decoded, req.body, req.files);
    res.status(StatusCodes.OK).json(create);
  } catch (error) {
    next(error); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
};

const getAll = async (req, res, next) => {
  try {
    const get = await rentalRoomService.getAll();
    res.status(StatusCodes.OK).json(get);
  } catch (error) {
    next(error); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
};

const edit =  async (req, res, next) => {

 try {
  const edit = await rentalRoomService.edit(req.params.id)
    res.status(StatusCodes.OK).json(edit);
  } catch (error) {
    next(error); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
}

const update = async (req, res, next) => {

  try {
    await rentalRoomService.update( req.body, req.files);

    res.status(StatusCodes.OK).json({message: "Đã chỉnh sửa hoàn tất!"});
  } catch (error) {
    next(error); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
};

const deleteRentalRoom = async (req, res, next) => {
  const id = req.params.id;
  try {
     await rentalRoomService.deleteRentalRoom(id);

    res.status(StatusCodes.OK).json({message: "Đã xóa thành công!"});
  } catch (error) {
    next(error); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
};

export const rentalRoomController = {
  createNew,
  getAll,
  edit,
  update,
  deleteRentalRoom,
};
