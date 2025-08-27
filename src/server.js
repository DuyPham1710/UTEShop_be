import express from "express";
import configViewEngine from "./config/viewEngine.js";
import bodyParser from "body-parser";
import initApiRoutes from "./routes/api.js";
import connectDB from "./config/database.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// config app
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

configViewEngine(app);
initApiRoutes(app);

connectDB(); // MongoDB connection

const port = process.env.PORT || 6969;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
