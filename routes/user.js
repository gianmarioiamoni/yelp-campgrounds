const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");

// middleware function to retrieve the stored returnTo path
const { storeReturnTo } = require('../middleware');

// route to serve the registration form
router.get("/register", (req, res) => {
    res.render("users/register")
});

// route for the POST request
router.post("/register", catchAsync(async (req, res, next) => {
    const { email, username, password } = req.body;
    const user = new User({
        username,
        email
    });
    try {
        const registeredUser = await User.register(user, password);
        // call login() method by Passport to start a login session
        // you don't have to login after register
        req.login(registeredUser, (err) => {
            if (err)
                return next(err);
            
            req.flash("success", "Welcome to YelpCamp");
            res.redirect("/campgrounds");

        })
    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("/register");
    }
    
}));

// route to serve the login form
router.get("/login", (req, res) => {
    res.render("users/login")
});

// route for the POST request
// storeReturnTo stores the returnTo path from session
// passport.authenticate() is a middleware provided by Passport
// It uses the "local" strategy and accepts some options"
router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login"}), catchAsync(async (req, res) => {
    // we are successfully authenticated
    req.flash("success", "Welcome back!");

    // Now we can use res.locals.returnTo to redirect the user after login
    // thanks to the storeReturnTo middleware function
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
}));

// logout
router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
    
}); 


module.exports = router;
