import express from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;
const api_key = process.env.API_KEY;

const config = {
  headers: {
    "Content-Type": "application/json",
    "x-access-token": api_key,
  },
  timeout: 5000,
};

app.use(express.static("public"));
app.set("view engine", "ejs");

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
    res
      .status(500)
      .render("error", { error: "An error occurred while fetching UV data" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
