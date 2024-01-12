const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
// const passport = require("passport-local");
const passport = require("passport");

// route to serve the registration form
router.get("/register", (req, res) => {
    res.render("users/register")
});

// route for the POST request
router.post("/register", catchAsync(async (req, res) => {
    const { email, username, password } = req.body;
    const user = new User({
        username,
        email
    });
    try {
        const registeredUser = await User.register(user, password);
    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("/register");
    }
    req.flash("success", "Welcome to YelpCamp");
    res.redirect("/campgrounds");
}));

// route to serve the login form
router.get("/login", (req, res) => {
    res.render("users/login")
});

// route for the POST request
// passport.authenticate() is a middleware provided by Passport
// It uses the "local" strategy and accepts some options"
router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), catchAsync(async (req, res) => {
    // we are successfully authenticated
    req.flash("success", "Welcome back!");
    res.redirect("/campgrounds");
}));

module.exports = router;
