import jwt from "jsonwebtoken";
import { env } from "~/config/environment";

const getJsonWebToken = (id, email) => {
  const payload = {
    id,
    email,
  };

  const token = jwt.sign(payload, env.SECRET_KEY, {
    expiresIn: "7d",
  });

  return token;
};

function ranDom(length) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function makeid(length) {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}



export const getToken = {
  getJsonWebToken,
  makeid,
  ranDom
};
