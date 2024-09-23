// Importing the campground validation schema from schemas.js
const { campgroundSchema } = require('../schemas.js');
// Importing the Campground model to interact with the MongoDB database
const Campground = require('../models/campground');
// Importing middleware to secure application routes
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
// Importing custom async error catcher (catchAsync)
const catchAsync = require('../utilities/catchAsync');

// Initializing the Express router
const express = require('express');
const router = express.Router();


// GET route for displaying all campgrounds (Index Page)
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});  // Fetch all campgrounds from the database
    res.render('campgrounds/index', { campgrounds });  // Render the campgrounds index page with the fetched data
}));

// GET route to render the form for creating a new campground
router.get('/new', isLoggedIn, (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to create a new campground!');
        return res.redirect('/login');
    }
    res.render('campgrounds/new');  // Render the 'new campground' form page
});

// POST route for creating a new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);  // Create a new Campground object with the request data
    campground.author = req.user._id;  // Set the author of the campground to the current user
    await campground.save();  // Save the campground to the database
    req.flash('success', 'Successfully made a new campground!');  
    res.redirect(`/campgrounds/${campground._id}`);  // Redirect to the newly created campground's show page
}));

// GET route to display details of a specific campground by ID (Show Page)
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');  // Find campground by ID and populate reviews
    console.log(campground);
    if(!campground) {
        req.flash('error', 'Can\'t fnd that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });  // Render the show page for the campground
}));

// GET route to render the edit form for a specific campground by ID
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);  // Find campground by ID
    if(!campground) {
        req.flash('error', 'Can\'t fnd that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });  // Render the edit form for the campground
}));

// PUT route to update a specific campground by ID
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    // Find the campground by ID and update it with the new data from the request body
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    req.flash('success', `Successfully updated ${ campground.title }!`) 
    res.redirect(`/campgrounds/${campground._id}`);  // Redirect to the updated campground's show page
}));

// DELETE route to remove a specific campground by ID
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id); 
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');  // Redirect back to the campgrounds index page
}));

// Exporting the router to be used in the main application
module.exports = router;