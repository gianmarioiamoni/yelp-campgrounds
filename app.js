if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo'); // use MongoDB to store sessions
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

// Google authentication strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const FacebookStrategy = require('passport-facebook');

const findOrCreate = require('mongoose-findorcreate')


// solve mongo injection security issue
const mongoSanitize = require('express-mongo-sanitize');

const helmet = require("helmet");
const { helmetSecurityPolicy } = require("./public/javascripts/helmetConfig");

const User = require("./models/user");

const secret = process.env.SECRET;
// DEVELOPMENT
const localDbUrl = "mongodb://localhost:27017/yelp-camp"
const localCbUrl = "http://localhost:3000/auth/google/callback"

const dbUrl = process.env.NODE_ENV === 'production' ? process.env.DB_URL : localDbUrl;
const cbUrl = process.env.NODE_ENV === 'production' ? process.env.CB_URL : localCbUrl;

// Mongo store to memorize sessions
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET
    }
});

store.on("error", function (err) {
    console.log("SESSION STORE ERROR", err)
});

// session config
const sessionConfig = {
    store: store, // It uses Mongo to store session information
    name: "session", // override default session name, for security reasons
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // security
        httpOnly: true,
        // secure: true to be added in deployment only 
        secure: (process.env.NODE_ENV === 'production'),
        // setup expiring date in a week for coockie
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};


app.use(session(sessionConfig));

app.use(helmet.contentSecurityPolicy(helmetSecurityPolicy));

app.use(flash());

// Passport initialization; session should be initialized before
app.use(passport.initialize());
app.use(passport.session());
// specify the authentication strategies - defined in User model, added automatically
passport.use(new LocalStrategy(User.authenticate()));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: cbUrl,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, done) {
        User.findOrCreate(
            { googleId: profile.id },
            {
                username: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id
            },
            function (err, user) {
                return done(err, user);
            }
        );
    }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate(
            { facebookId: profile.id },
            {
                username: profile.displayName,
                email: profile.email,
                facebookId: profile.id
            },
            function (err, user) {
                return cb(err, user);
            }
        );
    }
));

// specify how we store a user in the session and how we remove It from the session
// methods added by password-local-mongoose
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });
// passport.deserializeUser(function (id, done) {
//     User.findById(id, function (err, user) {
//         done(err, user);
//     });
// });

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            _id: user._id,
            username: user.username
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

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
});

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query
app.use(mongoSanitize());

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

// Google Auth consense screen route
app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    ));

// Google Callback route
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login',
        failureFlash: true,
        session: true,
    }),
    function (req, res) {
        // Successful authentication, redirect secrets
        res.redirect('/campgrounds')

    }
);


// Facebook Auth consense screen route
app.get('/auth/facebook',
    passport.authenticate('facebook'));

// Facebook Callback route
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login',
        failureFlash: true,
        session: true,
    }),
    function (req, res) {
        res.redirect('/campgrounds')

    }
);


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
        await mongoose.connect(dbUrl);
        console.log("CONNECTION OPEN to port 27017");
    } catch (err) {
        console.log("CONNECTION ERROR: " + err);
    }
}
