import express from "express";

import {  utilitieController } from "~/controllers/utilitieController";

const Router = express.Router();


Router.route("/").get(utilitieController.getAll);


export const  utilitieRoute = Router;
