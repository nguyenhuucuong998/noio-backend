import express from "express";
import cors from "cors";
import exitHook from "async-exit-hook";
import { CONNECT_DB,  CLOSE_DB} from "~/config/mongodb";
import {corsOptions} from "~/config/cors";
import cookieParser from 'cookie-parser'
import { env } from "~/config/environment";
import  {APIs_V1} from '~/routes/v1/index'; 
import { errorHandlingMiddleware } from "~/middlewares/errorHandlingMiddleware";

const START_SERVER = () => {
  const app = express();

// app.use(cors({
//   origin: "*", // hoặc domain của bạn
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
//hiển thị file ảnh
  app.use("/uploads", express.static("uploads"));
 
  app.use(cors(corsOptions));
  
  // Middleware to parse JSON bodies
  app.use(express.json());
  app.use(cookieParser());

  app.use('/v1', APIs_V1);

  app.use(errorHandlingMiddleware);

  if(env.BUILD_MODE === 'production'){
   app.listen(process.env.PORT, () => {
    console.log(
      `3. production: Hello ${env.AUTHOR},  I am running at port ${process.env.PORT}`,
    );
  });
  }else{
    // localhost
     app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
    console.log(
      `3: localhost: Hello ${env.AUTHOR}, I am running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}`,
    );
  });
  }

 

 exitHook(() => {
	console.log(`4. Closing MongoDB connection...`);
  CLOSE_DB();
  console.log(`5. MongoDB connection closed successfully!`);
});
};

(async () => {
  try {
    console.log(`1. Connecting to MongoDB...`);
    await CONNECT_DB();
    console.log(`2. Connected to MongoDB successfully!`);

    START_SERVER();
  } catch (error) {
    
    console.error(error);
    process.exit(0);
  }

})();
