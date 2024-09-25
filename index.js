import express from "express";
import axios from "axios";
import path from "path";
import { createServer } from "http";
import { Server } from "ws";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new Server({ server });
const port = process.env.PORT || 3000;
const api_key = process.env.API_KEY;

const config = {
  headers: {
    "Content-Type": "application/json",
    "x-access-token": api_key,
  },
};

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

async function fetchUVData() {
  try {
    const response = await axios.get(
      `https://api.openuv.io/api/v1/uv?lat=14.61&lng=121.00&alt=100&dt=${new Date().toISOString()}`,
      config
    );

    const uvIndex = response.data.result.uv;
    let uvClass;
    if (uvIndex <= 3) uvClass = "low";
    else if (uvIndex <= 6) uvClass = "moderate";
    else if (uvIndex <= 8) uvClass = "high";
    else if (uvIndex <= 11) uvClass = "very-high";
    else uvClass = "extreme";

    return { id: uvIndex, uvClass };
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

app.get("/", async (req, res) => {
  const uvData = await fetchUVData();
  if (uvData) {
    res.render("index.ejs", uvData);
  } else {
    res.status(500).send("Error fetching UV data");
  }
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  const sendUpdate = async () => {
    const uvData = await fetchUVData();
    if (uvData) {
      ws.send(JSON.stringify(uvData));
    }
  };

  const intervalId = setInterval(sendUpdate, 60000); // Update every minute

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(intervalId);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
