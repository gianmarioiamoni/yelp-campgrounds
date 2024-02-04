const Campground = require("./models/campground");
const Review = require("./models/review");
const User = require("./models/user");
const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");

// CAMPGROUND MIDDLEWARE

// middleware to check if an user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
    // isAuthenticated() is an helper function coming from Passport
    if (!req.isAuthenticated()) {
        // store in the session the path we want to redirect the user to after login
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in first");
        return res.redirect("/login");
    }
    next();
}

// stores req.session.returnTo in res.locals.returnTo
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// middleware validation function for campground
module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // get a single string error message
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// middleware to check if the author of a campground is the current user
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};


// REVIEWS MIDDLEWARE

// middleware validation function for reviews
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    
    if (error) {
        // get a single string error message
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// middleware to check if the author of a review is the current user
module.exports.isReviewAuthor = async (req, res, next) => {
    // route is /campgrounds/:id/reviews/:reviewId 
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};


// USERS MIDDLEWARE

// middleware to check if the new user has unique email
// middleware to check if an user is authenticated
module.exports.isValidUser = async (req, res, next) => {
    const { email, username, password } = req.body;
    const userByEmail = await User.findOne({ email: email });
    const userByUsername = await User.findOne({ username: username });

    if (userByEmail) {
        req.flash("error", "Email already in use");
        return res.redirect("/register");
    }
    if (userByUsername) {
        req.flash("error", "Username already in use");
        return res.redirect("/register");
    }
    next();
}
