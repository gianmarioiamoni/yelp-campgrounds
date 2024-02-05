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
    res.render("users/login");
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

module.exports.renderChangePassword = (req, res) => {
    res.render("users/changePassword");
}

module.exports.changePassword = async (req, res) => {

    if (typeof req.user === 'undefined') {
        return res.redirect('/login');
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    try {
        if (newPassword !== confirmPassword) {
            throw new Error("New Password and Confirm Password don't match");
        }

        const user = await User.findOne({ username: req.user.username });
        console.log("user = ", user);

        // await user.setPassword(req.body.password);
        // const updatedUser = await user.save();
        // req.login(updatedUser);
        await user.changePassword(oldPassword, newPassword);
        
        req.flash('success', 'Password Changed Successfully');
        res.redirect('/campgrounds')

        console.log(oldPassword, " ", newPassword, " ", confirmPassword);
    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("/changePassword");
    }

}

// if (typeof req.user === 'undefined') {
//     res.redirect('/login')
// } else {
//     User.findOne({ _id: req.user._id }, function (err, user) {
//         if (!err) {
//             user.changePassword(req.body.oldPassword, req.body.newPassword, function (err) {
//                 if (!err) {
//                     res.redirect('/login')
//                 } else {
//                     console.log(err);
//                 }
//             })
//         } else {
//             console.log(err);
//         }
//     })
// }
