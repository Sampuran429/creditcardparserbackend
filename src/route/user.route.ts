import { Router } from "express";
import userController from "../controller/user.controller";
import authMiddleware from "../middleware/auth.middleware";
const userRouter=Router();

userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.login);
userRouter.get("/:id", authMiddleware, userController.getUserById);
userRouter.get("/email/:email", authMiddleware, userController.getUserByEmail);
userRouter.put("/:id", authMiddleware, userController.updateUser);
userRouter.delete("/:id", authMiddleware, userController.deleteUser);

export default userRouter;
