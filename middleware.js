// middleware to check if an user is authenticated

module.exports.isLoggedIn = (req, res, next) => {
    // isAuthenticated() is an helper function coming from Paaport
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