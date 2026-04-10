import { Users } from "./db.js";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import AppError from "./error.js";

config();

const Signup = async (username, email, password) => {
    const userExist = await Users.findOne({ email });

    if (userExist) {
      throw new AppError("Invalid registration details", 400);
    }

    const hashedPassword = await hash(password, 10);
    
    const user = await Users.create({
      username,
      email,
      password: hashedPassword
    });

    return {
      id: user._id,
      username: user.username,
      email: user.email
    };

};

const Login = async (email, password) => {
    const user = await Users.findOne({ email });

    if (!user) throw new AppError("Invalid credentials", 400);

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials", 400);

    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName || user.username
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

    return { success: true, token };
};


export { Signup, Login };