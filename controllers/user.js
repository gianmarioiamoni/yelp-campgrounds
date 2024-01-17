const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
    res.render("users/register")
}

module.exports.register = async (req, res, next) => {
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

}

module.exports.renderLogin = (req, res) => {
    res.render("users/login")
}

module.exports.login = async (req, res) => {
    // we are successfully authenticated (due to middleware in route)
    req.flash("success", "Welcome back!");

    // Now we can use res.locals.returnTo to redirect the user after login
    // thanks to the storeReturnTo middleware function
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });

}
