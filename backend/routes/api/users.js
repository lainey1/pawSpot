// backend/routes/api/users.js
const express = require("express");
const bcrypt = require("bcryptjs");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models");

const router = express.Router();

//* import the check function from express-validator and the handleValidationError functions
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

//* Signup validation middleware
const validateSignup = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("username")
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters."),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a first name."),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a last name."),
  handleValidationErrors,
];

//* Sign up route updated
router.post("/", validateSignup, async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({
      email,
      username,
      hashedPassword,
      firstName, // added
      lastName, // added
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName, // added
      lastName: user.lastName, // added
    };

    await setTokenCookie(res, safeUser);

    return res.status(201).json({
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ***** EXPORTS *****/
module.exports = router;
