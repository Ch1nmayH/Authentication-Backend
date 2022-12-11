const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connectToDatabase = (url) => {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectToDatabase;
