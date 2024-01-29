const { Category } = require("../models/category");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  const productList = await Product.find().populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

// To get a particular set of data in the list
router.get(`/filter`, async (req, res) => {
  const productList = await Product.find().select("name image -_id");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

// filter per categories
router.get(`/categories`, async (req, res) => {

    let filter = {}
    if(req.query.categories)
    {
        filter ={category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate("category");
  
    if (!productList) {
      res.status(500).json({ success: false });
    }
    res.send(productList);
  });
  
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params["id"]);

  if (!product) {
    res
      .status(500)
      .json({ message: "The category with the given ID was not found" });
  }
  res.status(200).send(product);
});

//router.post(`/`, (req, res) => {
router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
  });

  const productResult = await product.save();

  if (!productResult)
    return res.status(500).send("The product cannot be created");

  res.send(productResult);
  ///Former way
  // product
  //     .save()
  //     .then((createdProduct) => {
  //         res.status(201).json(createdProduct);
  //     })
  //     .catch((err) => {
  //         res.status(500).json({
  //             error: err,
  //             success: false,
  //         });
  //     });
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }
  //   if (Product.findById(req.params.id)) {
  //     res.status(400).send("Product Id Not found");
  //   }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
    },
    { new: true }
  );

  if (!product) return res.status(400).send("the category cannot be created!");

  res.send(product);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: "the product is successfully deleted",
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    count: productCount,
  });
});

router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const product = await Product.find({ isFeatured: true }).limit(+count);

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

module.exports = router;
