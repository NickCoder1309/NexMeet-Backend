import dotenv from "dotenv";
import userRoutes from "./routes/user";
import meetingRoutes from "./routes/meeting";
import express from "express";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT;

const origins = (process.env.ORIGIN ?? "")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);

app.use("/api/users", userRoutes);
app.use("/api/meetings", meetingRoutes);

app.listen(PORT, () => {
  console.log(`Server running`);
});
