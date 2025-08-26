import express from "express"
import { RegisterUser } from "../controllers/userConteoller.js";

const userRouter = express.Router();

userRouter.post("/register", RegisterUser);

export default userRouter;