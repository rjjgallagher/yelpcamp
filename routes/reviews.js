const express = require('express');
const catchAsync = require('../utilities/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviewController = require('../controllers/reviews');

// Initialize a new Express router with the mergeParams option set to true.
// This allows the router to access parameters from its parent router, which is useful
// for handling nested routes, such as accessing the campgroundId in routes like
// /campgrounds/:campgroundId/reviews.
const router = express.Router({ mergeParams: true });

/**
 * Route handler for creating a new review for a campground.
 * 
 * This route is protected by authentication and validation middleware.
 * It handles the creation of a new review, associates it with the current user,
 * and links it to the specified campground. After saving the review and the campground,
 * it flashes a success message and redirects the user to the campground's detail page.
 * 
 * Middleware:
 * - isLoggedIn: Ensures the user is authenticated.
 * - validateReview: Validates the review data in the request body.
 * - catchAsync: Catches and handles any errors that occur during the asynchronous operations.
 */
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview));

/**
 * Route handler for deleting a specific review.
 * 
 * This route is protected by authentication and authorization middleware.
 * It handles the deletion of a review identified by the reviewId parameter.
 * The user must be logged in and must be the author of the review to delete it.
 * 
 * Middleware:
 * - isLoggedIn: Ensures the user is authenticated.
 * - isReviewAuthor: Ensures the user is the author of the review.
 * - catchAsync: Catches and handles any errors that occur during the asynchronous operations.
 * 
 * Controller:
 * - reviewController.deleteReview: Handles the actual deletion logic.
 */
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

module.exports = router;