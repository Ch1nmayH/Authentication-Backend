const express = require("express");
require("dotenv").config();

const app = express();

app.get("/", (req, res) => {
  res.send("RUNNING");
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
