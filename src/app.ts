import dotenv from "dotenv";
import userRoutes from "./routes/user";
import express from "express";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTED_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
