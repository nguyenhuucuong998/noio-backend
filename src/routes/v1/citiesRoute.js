import express from "express";

import {  citiesController } from "~/controllers/citiesController";

const Router = express.Router();


Router.route("/").get(citiesController.getAll);


export const  citiesRoute = Router;
