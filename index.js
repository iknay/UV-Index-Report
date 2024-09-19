import express from "express";
import axios from "axios";

const app = express();
const port = 3000;
const api_key = "openuv-27zrm14pwqg5-io";

const api_url =
  "https://api.openuv.io/api/v1/uv?lat=14.61&lng=121.00&alt=100&dt=2024-09-18T16:00:00.000Z";

const config = {
  headers: {
    "Content-Type": "application/json",
    "x-access-token": api_key,
  },
};

app.use(express.static("public"));

app.get("/", async (req, res) => {
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

    console.log(uvIndex);
    console.log(uvClass);
    res.render("index.ejs", {
      id: response.data.result.uv,
      uvClass: uvClass,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
