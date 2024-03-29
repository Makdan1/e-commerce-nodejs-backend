const { User } = require("../models/user");
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-password");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

// Get user profile
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params["id"]).select("-password");

  if (!user) {
    res
      .status(500)
      .json({ message: "The category with the given ID was not found" });
  }
  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  console.log(req.body);
  if (req.body.name != null) {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });

    userResult = await user.save();

    if (!userResult) return res.status(404).send("the user cannot be created!");

    res.send(userResult);
  } else {
    return res.status(400).send({
      success: false,
      message: "Cannot be empty",
    });
  }
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send("The user not found");
  }
  console.log(user.id);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin
      },
      secret,
      { expiresIn: "1d" }
    );
    return res.status(200).send({ user: user.name, token: token });
  } else {
    res.status(400).send(
      {
        message:  "password is wrong",
        success: false
      }
    );
  }
});

router.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments((count) => count);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send(
    {
      userCount: userCount
    }
    );
});

// api/vi/
router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (user) {
        return res
          .status(200)
          .json({
            success: true,
            message: "the user is successfully deleted",
          });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});
module.exports = router;
