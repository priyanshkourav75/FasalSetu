
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      role,
      shopName,
      shopAddress,
      pincode
    } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        message: "Name, email, mobile and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters."
      });
    }

    if (!["farmer", "retailer"].includes(role)) {
      return res.status(400).json({
        message: "Please select a valid account type."
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { mobile }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or mobile number is already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      role,
      shopName: role === "retailer" ? shopName : undefined,
      shopAddress: role === "retailer" ? shopAddress : undefined,
      pincode
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        shopName: user.shopName
      }
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Signup failed." });
  }
});

// LOGIN - Email OR Mobile
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, mobile, password, role } = req.body;

    const loginId = identifier || email || mobile;

    if (!loginId || !password || !role) {
      return res.status(400).json({
        message: "Email/mobile, password and account type are required."
      });
    }

    if (!["farmer", "retailer"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account type."
      });
    }

    const user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase() },
        { mobile: loginId }
      ]
    });

    if (!user) {
      return res.status(401).json({
        message: "Account not found. Please check your details."
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: `This account belongs to ${user.role}. Please select the correct account type.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password."
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        shopName: user.shopName
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed." });
  }
});

module.exports = router;
