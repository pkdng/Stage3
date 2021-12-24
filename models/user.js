const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    address: {
      type: String,
      required: false,
      default: null,
    },
    phoneNumber: {
      type: Number,
      required: false,
      default: null,
    },
    picture: {
      type: String,
      required: false,
      default: null,
    },
    cloudinary_id: {
      type: String,
    },
    role: {
      type: String,
      required: false,
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("remove", { document: false, query: true }, function (next) {
  this.model("Discussion").remove().exec();
  next();
});

module.exports = mongoose.model("User", userSchema);
