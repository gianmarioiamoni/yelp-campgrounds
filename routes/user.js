const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");

// controller
const users = require("../controllers/user");

// middleware function to retrieve the stored returnTo path
const { storeReturnTo } = require('../middleware');

// route to serve the registration form
router.get("/register", users.renderRegister);

// route for the POST request
router.post("/register", catchAsync(users.register));

// route to serve the login form
router.get("/login", users.renderLogin);

// route for the POST request
// storeReturnTo stores the returnTo path from session
// passport.authenticate() is a middleware provided by Passport
// It uses the "local" strategy and accepts some options"
router.post("/login",
    storeReturnTo,
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
    catchAsync(users.login)
);

// logout
router.get("/logout", users.logout); 


module.exports = router;
