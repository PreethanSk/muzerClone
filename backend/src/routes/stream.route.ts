import express , {Router} from "express";
import jwt from "jsonwebtoken";
import {CreateStreamSchema} from "../utils/zod";
import {PrismaClient} from "../../generated/prisma";
import cors from "cors"
import {userMiddleware} from "../middlewares";


type StreamingType = "Youtube" | "Spotify"
const app = express();
const streamRouter = Router();
const client = new PrismaClient();
const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]+(\?[\w=&]*)?$/;
const SPOTIFY_URL_REGEX = /^(https?:\/\/)?(open\.spotify\.com\/(track|album|playlist|artist)\/|spotify:(track|album|playlist|artist):)[\w\-]+(\?.*)?$/;
app.use(express.json());
app.use(cors())


streamRouter.post("/createStream", userMiddleware, async (req, res) => {
    try {
        //@ts-ignore
        const userId = req.id;
        const { url, active } = req.body;


        const zodParse = CreateStreamSchema.safeParse(req.body);
        if (!zodParse.success) {
            res.status(403).json({ message: "Zod validation error" });
            return;
        }

        const isYt = YT_REGEX.test(url);
        const isSpotify = SPOTIFY_URL_REGEX.test(url);
        if (!isYt && !isSpotify) {
            res.status(403).json({ message: "This link is not valid" });
            return;
        }


        let streamType: StreamingType | null = null;
        let extractedId: string | null = null;

        if (isYt) {
            const ytMatch = url.match(/(?:v=|youtu\.be\/)([\w\-]+)/);
            extractedId = ytMatch ? ytMatch[1] : null;
            streamType = "Youtube";
        } else if (isSpotify) {
            const spotifyMatch = url.match(/(?:track|album|playlist|artist)[\/:]([\w\-]+)/);
            extractedId = spotifyMatch ? spotifyMatch[1] : null;
            streamType = "Spotify";
        }

        if (!extractedId || !streamType) {
            res.status(403).json({ message: "Unable to extract ID or determine stream type from the URL" });
            return;
        }


        await client.streams.create({
            data: {
                userId: userId,
                url: url,
                type: streamType,
                extractedId: extractedId,
                active,
            },
        });

        res.status(201).json({ message: "Stream created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server crash in createStream endpoint" });
    }
});

streamRouter.get("/getStreams/:userId", async(req,res) => {
    try{
        const userId = parseInt(req.params.userId)
        const streams = await client.streams.findMany({
            where:{
                userId
            }
        })
        res.json({stream: streams})
    }
    catch(error){
        res.status(500).json({message:"sever crash in getStream endpoint"});
        console.log(error)
    }
})


export default streamRouter