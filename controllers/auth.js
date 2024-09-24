const User = require('../models/user');


module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/register');
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

/**
 * Handles user login and redirects the user to the appropriate page.
 * 
 * This function is called after Passport.js has successfully authenticated the user.
 * Passport.js handles the actual login process, including verifying the user's credentials
 * and establishing a session. Once the user is authenticated, this function sets a flash
 * message to welcome the user back and redirects them to the URL they were trying to access
 * before logging in, or to the campgrounds page if no such URL is set.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // If returnTo is not set, redirect to /campgrounds
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};