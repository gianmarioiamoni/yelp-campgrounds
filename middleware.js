// middleware to check if an user is authenticated

module.exports.isLoggedIn = (req, res, next) => {
    // isAuthenticated() is an helper function coming from Paaport
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be signed in first");
        return res.redirect("/login");
    }
    next();
}