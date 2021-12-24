const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.get("/protected", auth, (req, res) => {
  res.send("hello User !!");
});

router.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(422)
      .json({ error: "please entry all field an available" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "User already exist with that email" });
      }
      bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
            name,
          });

          user
            .save()
            .then((user) => {
              res.json({ message: "saved successfully" });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          return res.status(404).json({ message: err });
        });
    })

    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

router.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "please add email and password" });
  }
  User.findOne({ email: email })
    .select("+password")
    .then((savedUser) => {
      bcrypt
        .compare(password, savedUser.password)
        .then((doMatch) => {
          if (doMatch) {
            // res.json({message: 'signin successfully'})
            const token = jwt.sign(
              { _id: savedUser._id },
              process.env.JWT_SECRET
            );
            const { _id, name, email, role } = savedUser;
            res.json({
              token,
              user: {
                _id,
                name,
                role,
                email,
              },
            });
          } else {
            return res.status(422).json({ error: "Wrong Password" });
          }
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    })
    .catch((err) => {
      return res.status(422).json({ error: err });
    });
});
module.exports = router;
