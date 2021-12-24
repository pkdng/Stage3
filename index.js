const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 4000;
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("mongoose connected yeahh");
});
mongoose.connection.on("err mongoose", (err) => {
  console.log("mongoose", err);
});

require("./models/user");
require("./models/product");

app.use(cors());
app.use(express.json());
app.use(require("./routes/auth"));
app.use(require("./routes/user"));
app.use(require("./routes/product"));

app.listen(port, () => {
  console.log("Server is Running:", port);
});
