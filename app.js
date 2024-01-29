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
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const FacebookStrategy = require('passport-facebook');

const findOrCreate = require('mongoose-findorcreate')


// solve mongo injection security issue
const mongoSanitize = require('express-mongo-sanitize');

const helmet = require("helmet");

const User = require("./models/user");

const secret = process.env.SECRET;

// development
const dbUrl = "mongodb://localhost:27017/yelp-camp"
const cbUrl = "http://localhost:3000/auth/google/callback"
//// production
// const dbUrl = process.env.DB_URL;
// const cbUrl = "https://yelpcampground-6p9b.onrender.com/auth/google/callback/auth/google/callback"

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
        // secure: true, // to be added in deployment 
        // setup expiring date in a week for coockie
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));

// HELMET
// defines non-self sources to allow
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://kit-free.fontawesome.com/",
    "https://ka-f.fontawesome.com",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://kit-free.fontawesome.com/",
    "https://ka-f.fontawesome.com",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
// Use Helmet: enables all 11 middlewares helmet comes with
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dzmynvqbz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(flash());

// Passport initialization; session should be initialized before
app.use(passport.initialize());
app.use(passport.session());
// specify the authentication strategies - defined in User model, added automatically
passport.use(new LocalStrategy(User.authenticate()));

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: cbUrl,
//     passReqToCallback: true
// },
//     function (request, accessToken, refreshToken, profile, done) {
//         return done(null, profile);
//     }
// ));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: cbUrl,
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
//     done(null, user);
// });

// passport.deserializeUser(function (user, done) {
//     done(null, user);
// });

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            _id: user._id,
            username: user.username
        });
    });
});

// ## Serialize User
// passport.serializeUser((user, done) => {

//     let sessionUser = {

//         _id: user._id,

//         username: user.username,

//     };

//     done(null, sessionUser);
// });

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

// // ## Deserialize User
// passport.deserializeUser((sessionUser, done) => {

//     // The sessionUser object is different from the user mongoose
//     // collection

//     // It is actually req.session.passport.user and comes from the
//     // session collection
//     done(null, sessionUser);
// });

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
    }),
    function (req, res) {
        res.redirect('/campgrounds')

    }
);


// Facebook Auth consense screen route
app.get('/auth/facebook',
    passport.authenticate('facebook'));
        // , {
    //     scope:
    //         ['email', 'profile']
    // }
    // ));

// Facebook Callback route
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login',
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
