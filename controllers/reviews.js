const Campground = require('../models/campground');
const Review = require('../models/review');


module.exports.createReview = async (req, res) => {
    /**
     * Finds a campground by its ID from the request parameters.
     * 
     * @param {Object} req - The request object.
     * @param {Object} req.params - The parameters from the request.
     * @param {string} req.params.id - The ID of the campground to find.
     * @returns {Promise<Campground>} The found campground.
     */
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // Passport.js adds the user property to req after successful authentication
    review.author = req.user._id; // Set the author of the review to the current user 
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a review!'); 
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/campgrounds/${id}`);
};