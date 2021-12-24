const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const Product = mongoose.model("Product");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
// find all

router.get("/api/product", auth, (req, res) => {
  Product.find()
    .populate("user_id", "_id name phoneNumber")
    .then((product) => {
      res.status(200).json({ error: false, message: "success", product });
    })
    .catch((err) => {
      res.status(404).json({ error: true, message: err });
    });
});

// create
router.post("/api/product", [upload.single("picture"), auth], (req, res) => {
  cloudinary.uploader
    .upload(req.file.path)
    .then((result) => {
      const { name, price, description, category, address } = req.body;
      const user_id = req.user._id;
      const product = new Product({
        user_id,
        name,
        price,
        description,
        category,
        address,
        picture: result?.secure_url,
        cloudinary_id: result?.public_id,
      });
      product
        .save()
        .then((products) => {
          res.status(201).json({ message: "product berhasil disimpan" });
        })
        .catch((err) => {
          res.status(404).json({ message: err });
        });
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

// find one detail
router.get("/api/product/:id", auth, (req, res) => {
  Product.findOne({ _id: req.params.id }).exec((err, product) => {
    if (err || !product) {
      res.status(404).json({ message: err, error: true });
    }
    res.status(200).json({ error: false, message: "success", product });
  });
});

//update
router.put("/api/product/:id", [upload.single("picture"), auth], (req, res) => {
  Product.findById(req.params.id)
    .then((product) => {
      //jika ada request file
      if (req.file) {
        cloudinary.uploader.destroy(product.cloudinary_id);
        cloudinary.uploader
          .upload(req.file.path)
          .then((result) => {
            const data = {
              category: req.body.name || product.name,
              price: req.body.email || product.email,
              name: req.body.name || product.name,
              description: req.body.description || product.description,
              address: req.body.address || product.address,
              picture: result?.secure_url,
              cloudinary_id: result?.public_id,
            };

            Product.findByIdAndUpdate(req.params.id, data, { new: true })
              .then((result) => {
                res.json({ message: "Berhasil update", result });
              })
              .catch((err) => {
                res.json({ message: err });
              });
          })
          .catch((err) => {
            res.json({ message: err });
          });
        // jika tidak ada request file
      } else {
        const oldData = {
          name: req.body.name || product.name,
          price: req.body.price || product.price,
          address: req.body.address || product.address,
          category: req.body.category || product.category,
          description: req.body.description || product.description,
          picture: product.picture,
          cloudinary_id: product.cloudinary_id,
        };
        Product.findByIdAndUpdate(req.params.id, oldData, { new: true })
          .then((result) => {
            res.json({ message: "Berhasil update", result });
          })
          .catch((err) => {
            res.json({ message: err });
          });
      }
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

//delete
router.delete("/api/product/:id", auth, (req, res) => {
  Product.findByIdAndRemove({ _id: req.params.id }).exec((err, product) => {
    if (product) {
      cloudinary.uploader.destroy(product.cloudinary_id);
      return res.status(200).json({ message: "Berhasil dihapus" });
    }
    res.send(404).json({ error: "Product tidak ditemukan" });
  });
});
module.exports = router;
