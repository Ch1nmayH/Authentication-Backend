const express = require("express");
const connectToDatabase = require("./db");
const startNodeMailer = require("./controllers/nodemailerConnect");
const router = require("./routes/router");
const verifyEmail = require("./routes/verify");

require("dotenv").config();

const app = express();

//middlewares
app.use(express.json());
app.use("/api", router);

app.use("/api/verify", verifyEmail);

app.get("/", (req, res) => {
  res.send("Index page");
});

const start = async () => {
  try {
    await connectToDatabase(process.env.DBURI);
    startNodeMailer;

    console.log("Connected to the database");

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Listening to the port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
};

start();
