const express = require("express");
const connectToDatabase = require("./db");
const router = require("./routes/router");
const verifyEmail = require("./routes/verify");

require("dotenv").config();

const app = express();

//middlewares
app.use(express.json());

//routes
app.get("/", (req, res) => {
  res.send("Index page");
});

app.use("/api", router);
app.use("/api/verify", verifyEmail);

const start = async () => {
  try {
    await connectToDatabase(process.env.DBURI);

    console.log("Connected to the database");

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Listening to the port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
};

start();
