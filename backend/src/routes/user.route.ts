import express, {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {UserSchema, SigninSchema} from "../utils/zod";
import cors from 'cors'
import {PrismaClient} from "../../generated/prisma"
import {JWT_KEY} from "../utils/config";

const app = express();
const userRouter = Router()
const client = new PrismaClient();
const JWT_SECRET = JWT_KEY || "default-key"

app.use(express());
app.use(cors());

userRouter.post("/signup",async(req,res) => {
    try{
        const {username, password, name , email} = req.body;
        const zodParse = UserSchema.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"});
            return
        }
        const userCheck = await client.user.findFirst({where: {OR: [{username: username}, {email: email}]}});
        if(userCheck){
            res.status(403).json({messagE:"user already exists"});
            return
        }
        const passwordHash = await bcrypt.hash(password, 5);
        await client.user.create({
            data: {
                username,
                password: passwordHash,
                name,
                email
            }
        })
        res.json({message: "user created successfully"})

    }
    catch(error){
        res.status(500).json({message:"server crash in signup endpoint"})
    }
});

userRouter.post("/signin",async(req,res) => {
    try{
        const {username, password} = req.body;
        const zodParse = SigninSchema.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"});
            return
        }
        const user = await client.user.findUnique({where: {username: username}})
        if(!user){
            res.status(403).json({message:"user does not exist"});
            return
        }
        const decryptedPassword = await bcrypt.compare(password, user.password);
        if(!decryptedPassword){
            res.status(403).json({message:"invalid password"});
            return
        }
        const token = jwt.sign({id: user.id}, JWT_SECRET);
        res.json({token: token})
    }
    catch(error){
        res.status(500).json({message:"server crash in signin endpoint"})
    }

})

export default userRouter