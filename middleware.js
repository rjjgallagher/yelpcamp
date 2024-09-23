const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

/*
    Middleware functions are functions that have access to the request object (req), 
    the response object (res), and the next middleware function in the application’s 
    request-response cycle. The next middleware function is commonly denoted by a variable named next.

    If we have enough middleware functions, we can create a separate file to store them. 
    Example, review.js, campgrounds.js, auth.js, etc under a middleware folder. This is
    okay for the moment. 
 */


// Middleware to check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    /*
        isAuthenticated() is a method provided by Passport.js on the request object. 
        It returns true if the user is authenticated, otherwise false.
    */
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to create a new campground!');
        return res.redirect('/login');
    }
    next();
}

// Middleware to store the returnTo path from the session
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// Middleware to validate the campground request body before passing to route handlers
module.exports.validateCampground = (req, res, next) => {
    // Validating the request body using the campground schema
    const { error } = campgroundSchema.validate(req.body);
    
    // If validation fails, create an error message from the details of the error
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);  // Throw an error with the generated message and a 400 status code
    } else {
        next();  // If validation passes, proceed to the next middleware/route handler
    }
};

// Middleware to check if the current user is the author of a campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);  
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Middleware to check if the current user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);  
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Middleware to validate the review request body before passing to route handlers
module.exports.validateReview = (req, res, next) => {
    // Validating the request body using the review schema
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}