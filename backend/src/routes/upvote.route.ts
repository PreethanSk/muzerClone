import express, {Router} from "express";
import {PrismaClient} from "../../generated/prisma";
import cors from "cors"

const client = new PrismaClient();
const upvoteRouter = Router()
const app = express()


app.use(express.json());
app.use(cors())



export default upvoteRouter;
