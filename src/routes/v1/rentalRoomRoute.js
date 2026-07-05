import express from "express";

import {  rentalRoomValidation } from "~/validations/rentalRoomValidation";
import { rentalRoomController  } from "~/controllers/rentalRoomController";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const Router = express.Router();



Router.route("/create").post(upload.array("images", 5),rentalRoomValidation.createNew, rentalRoomController.createNew);

Router.route("/get").get(rentalRoomController.getAll);
Router.route("/edit/:id").get(rentalRoomController.edit);

Router.route("/update").put(upload.array("images", 5), rentalRoomValidation.update, rentalRoomController.update)
Router.route("/delete/:id").delete(rentalRoomController.deleteRentalRoom)


export const  rentalRoomRoute = Router;
