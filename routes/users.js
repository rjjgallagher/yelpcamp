const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const { storeReturnTo } = require('../middleware');
const authController = require('../controllers/auth');
/**
 * @fileoverview Routes for user authentication and registration.
 * 
 * This file defines the routes for user registration, login, and logout.
 * It uses Passport.js for authentication and includes middleware to handle
 * asynchronous operations and session management.
 * 
 * @module routes/users
 */


/**
* GET /register
* Renders the registration form.
* @name /register
* @function
* @memberof module:routes/users
* @inner
*/
router.get('/register', authController.renderRegisterForm);

/**
* POST /register
* Registers a new user.
* @name /register
* @function
* @memberof module:routes/users
* @inner
* @param {function} catchAsync - Middleware to handle asynchronous operations.
*/
router.post('/register', catchAsync(authController.registerUser));

/**
* GET /login
* Renders the login form.
* @name /login
* @function
* @memberof module:routes/users
* @inner
*/
router.get('/login', authController.renderLoginForm);


/*
  By using the storeReturnTo middleware function, we can save the returnTo 
  value to res.locals before passport.authenticate() clears the session and 
  deletes req.session.returnTo. This enables us to access and use the returnTo
  value (via res.locals.returnTo) later in the middleware chain so that we can
  redirect users to the appropriate page after they have logged in.
*/
/**
* POST /login
* Logs in a user.
* Uses the storeReturnTo middleware to save the returnTo value from session to res.locals,
* then uses passport.authenticate to log the user in and clear req.session.
* Finally, redirects the user to the appropriate page after login.
* @name /login
* @function
* @memberof module:routes/users
* @inner
* @param {function} storeReturnTo - Middleware to save the returnTo value from session to res.locals.
* @param {object} passport.authenticate - Passport.js middleware for authentication.
*/
router.post('/login',
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    // Now we can use res.locals.returnTo to redirect the user after login
    authController.loginUser);

/**
* POST /logout
* Logs out a user.
* @name /logout
* @function
* @memberof module:routes/users
* @inner
*/
router.post('/logout', authController.logoutUser); 

module.exports = router;