import express, {Router} from "express";
import {PrismaClient} from "../../generated/prisma";
import cors from "cors"
import {userMiddleware} from "../middlewares";
import {UpvoteSchema} from "../utils/zod";

const client = new PrismaClient();
const voteRouter = Router()
const app = express()


app.use(express.json());
app.use(cors())

voteRouter.post("/upvote", userMiddleware, async(req,res) => {
    try{
        //@ts-ignore
        const userId = req.id;
        const streamId = req.body.streamId;
        const zodParse = UpvoteSchema.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"});
            return
        }
        await client.upvotes.upsert({
            where: {
                userId_streamId: { userId, streamId },
            },
            update: {},
            create: { userId, streamId },
        });

        res.json({messagE:"upvoted successfuly"})
    }
    catch(error){
        res.status(403).json({message:"server crash in upvote endpoint"});
        console.log(error)
    }
})

voteRouter.post("/downvote", userMiddleware, async(req,res) => {
    try{
        //@ts-ignore
        const userId = req.id;
        const streamId = req.body.streamId;
        const zodParse = UpvoteSchema.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"});
            return
        }
        await client.upvotes.delete({
            where: {
                userId_streamId: {
                    userId, streamId,
                },
            },
        });
        res.json({messagE:"downvoted successfuly"})
    }
    catch(error){
        res.status(403).json({message:"server crash in downvote endpoint"});
        console.log(error)
    }
})

export default voteRouter;
