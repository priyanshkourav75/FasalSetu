
const express = require("express");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");

const router = express.Router();

// Public product catalogue for farmers
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("retailer", "name shopName shopAddress pincode")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch products." });
  }
});

// Verify retailer login
const retailerAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please login first." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "retailer") {
      return res.status(403).json({
        message: "Only retailers can manage products."
      });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired login." });
  }
};

// Add product
router.post("/", retailerAuth, async (req, res) => {
  try {
    const { name, company, category, description, price, stock, imageUrl } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        message: "Name, category and price are required."
      });
    }

    const product = await Product.create({
      retailer: req.userId,
      name,
      company,
      category,
      description,
      price,
      stock,
      imageUrl
    });

    res.status(201).json({
      message: "Product added successfully.",
      product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get retailer's products
router.get("/my", retailerAuth, async (req, res) => {
  try {
    const products = await Product.find({
      retailer: req.userId
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch products." });
  }
});

// Update product
router.put("/:id", retailerAuth, async (req, res) => {
  try {
    const allowedFields = [
      "name", "company", "category",
      "description", "price", "stock",
      "imageUrl", "isActive"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, retailer: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product updated.", product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete("/:id", retailerAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      retailer: req.userId
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete product." });
  }
});

module.exports = router;
