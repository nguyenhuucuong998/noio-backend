import {StatusCodes} from 'http-status-codes'
import {env} from "~/config/environment"
import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized"
    });
  }

   

  try {
    const decoded = jwt.verify(token, env.SECRET_KEY);
  
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid token"
    });
  }
};