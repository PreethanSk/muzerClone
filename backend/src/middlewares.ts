import express, {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import {JWT_KEY} from "./utils/config";


const app = express();
const JWT_SECRET = JWT_KEY || "default-key";

export async function userMiddleware(req: Request, res: Response, next: NextFunction){
    try{
        const token = req.headers["authorization"];
        if(!token){
            res.status(403).json({message:"no token entered"});
            return
        }
        const verify = jwt.verify(token, JWT_SECRET);
        if(!verify){
            res.status(403).json({message:"invalid token"});
            return
        }
        //@ts-ignore
        req.id = verify.id;
        next()
    }
    catch(error){
        console.log(error);
        res.status(403).json({message:"server crashed in user middleware"})
    }
}