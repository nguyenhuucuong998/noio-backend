import express from "express";

import {  propertyTypeController } from "~/controllers/propertyTypeController";

const Router = express.Router();


Router.route("/").get(propertyTypeController.getAll);


export const  propertyTypeRoute = Router;
