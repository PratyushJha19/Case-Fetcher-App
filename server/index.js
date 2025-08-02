import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import caseRoutes from "./routes/caseRoute.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/case", caseRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Case Fetcher API");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
