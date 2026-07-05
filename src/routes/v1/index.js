import express from "express";
import {StatusCodes} from 'http-status-codes'
import { userRoute } from "~/routes/v1/userRoute";
import { propertyTypeRoute } from "~/routes/v1/propertyTypeRoute";
import { citiesRoute } from "~/routes/v1/citiesRoute";
import { utilitieRoute } from "~/routes/v1/utilitieRoute";
import { rentalRoomRoute } from "~/routes/v1/rentalRoomRoute";


const Router = express.Router();


Router.get('/status', (req, res) => {
    res.status(StatusCodes.OK).json({status: 'API v1 are ready!'});
})

Router.use('/user', userRoute); 
Router.use('/property-type', propertyTypeRoute); 
Router.use('/cities', citiesRoute); 
Router.use('/utilitie', utilitieRoute); 
Router.use('/rental-room', rentalRoomRoute); 
 
export const APIs_V1 = Router;