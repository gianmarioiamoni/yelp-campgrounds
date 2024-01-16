const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");

const campgroundRoute = require("./routes/campground");
const reviewRoute = require("./routes/reviews");
const userRoute = require("./routes/user")

// authentication with Passport
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user");


// session config
const sessionConfig = {
    secret: "thisshouldbeabettersecret!",
    resave: false,
    saveUninitialized: true,
    cookie: {
        // security
        httpOnly: true,
        // setup expiring date in a week for coockie
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

// Passport initialization; session should be initialized before
app.use(passport.initialize());
app.use(passport.session());
// specify the authentication method - defined in User model, added authomatically
passport.use(new LocalStrategy(User.authenticate()));
// specify how we store a user in the session and how we remove It from the session
// methods added by password-local-mongoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for flashes and for user information
app.use((req, res, next) => {
    // req.user is provided by Passport and contains information about the current user:
    // id, username, email or undefined if the user is not logged in
    // Now in all templates I have access to currentUser
    // used in NavBar to disable login/register or logout buttons
    res.locals.currentUser = req.user;

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);

app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/reviews", reviewRoute);
app.use("/", userRoute);

app.get("/", (req, res) => {
    res.render("home");
});


app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404));
})

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;

    if (!err.message)
        err.message = "Something went wrong";

    res.status(statusCode).render("error", { err });
})


app.listen(3000, () => {
    console.log("SERVING ON PORT 3000");
});

main()
    .catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
        console.log("CONNECTION OPEN to port 27017");
    } catch (err) {
        console.log("CONNECTION ERROR: " + err);
    }



}
