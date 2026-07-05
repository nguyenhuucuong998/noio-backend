import { StatusCodes } from "http-status-codes";

import { citiesService } from "~/services/citiesService";

const getAll = async (req, res, next) => {
  try {
    const getAll = await citiesService.getAll(); // có kết quả thì trả về cho client, không có kết quả thì trả về lỗi
   
    // có kết quả thì trả về cho client, không có kết quả thì trả về lỗi
    res.status(StatusCodes.OK).json(getAll);
  } catch (error) {
    next(error); // Gọi next với tham số error để chuyển lỗi sang middleware xử lý lỗi tập trung, không cần phải viết try catch ở tất cả controller nữa, chỉ cần viết ở service là đủ, còn controller thì cứ để mặc định như này là được.
  }
};



export const citiesController = {
  getAll,
};
