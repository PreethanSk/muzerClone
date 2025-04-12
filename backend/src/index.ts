import express from "express"
import streamRouter from "./routes/stream.route";
import userRouter from "./routes/user.route";
import voteRouter from "./routes/vote.route";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(cors());

app.use("/user",userRouter);
app.use("/stream", streamRouter);
app.use("/vote", voteRouter);

app.listen(3000);
