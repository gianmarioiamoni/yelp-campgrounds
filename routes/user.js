const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");

// controller
const users = require("../controllers/user");

// middleware function to retrieve the stored returnTo path
const { storeReturnTo, isValidUser, isLocalUser } = require('../middleware');

router.route("/register")
    // route to serve the registration form
    .get(users.renderRegister)
    // route for the POST request
    .post(isValidUser, catchAsync(users.register));

router.route("/login")
    // route to serve the login form
    .get(users.renderLogin)
    // route for the POST request
    // storeReturnTo stores the returnTo path from session
    // passport.authenticate() is a middleware provided by Passport
    // It uses the "local" strategy and accepts some options"
    .post(storeReturnTo,
        passport.authenticate("local",
            {
                failureFlash: true,
                failureRedirect: "/login",
                session: true,
            }),
        catchAsync(users.login)
    );

// logout
router.get("/logout", users.logout); 

// change password
router.route("/changePassword")
    // route to serve the change password form
    .get(isLocalUser, users.renderChangePassword)
    // route for POST request
    // changePassword() is provided by password-local-mongoose
    .post(isValidUser, isLocalUser, catchAsync(users.changePassword));
    


module.exports = router;
