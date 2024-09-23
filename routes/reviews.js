const express = require('express');
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utilities/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const router = express.Router({ mergeParams: true });


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // Passport.js adds the user property to req after successful authentication
    review.author = req.user._id; // Set the author of the review to the current user 
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a review!'); 
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;