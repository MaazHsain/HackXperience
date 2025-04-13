import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js'
import userRouter from "./routes/userRoutes.js";
import groupRouter from "./routes/groupRoutes.js";
import itemRouter from "./routes/itemRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();

const allowedOrigins = ['http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}))

// API Endpoints
app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/group', groupRouter);
app.use('/api/item', itemRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/ai', aiRouter);

app.listen(port, ()=> console.log(`Server started on PORT:${port}`));