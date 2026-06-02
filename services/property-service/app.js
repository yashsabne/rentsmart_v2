import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";

import propertyRoutes from "./src/routes/propertyRoutes.js";
import savedRoutes from "./src/routes/savedRoutes.js";
import shareRoutes from "./src/routes/shareRoutes.js";
import promoteRoutes from "./src/routes/promoteRoutes.js" 


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();

app.get('/test',async (req,res) => {
    res.send("property services are running");
} )

app.use("/api/property", propertyRoutes);

app.use("/api/saved", savedRoutes);

app.use("/api/promote",promoteRoutes)

app.use("/api/share", shareRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`property schema running on port: ${PORT} `);
} )
