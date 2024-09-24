const express = require('express');
// Importing the Campground model to interact with the MongoDB database
const Campground = require('../models/campground');
// Importing middleware to secure application routes
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
// Importing custom async error catcher (catchAsync)
const catchAsync = require('../utilities/catchAsync');
const campgroundController = require('../controllers/campgrounds');

// Initializing the Express router
const router = express.Router();


// GET route for displaying all campgrounds (Index Page)
router.get('/', catchAsync(campgroundController.index));

// GET route to render the form for creating a new campground
router.get('/new', isLoggedIn, campgroundController.renderNewForm);

// POST route for creating a new campground
router.post('/', isLoggedIn, validateCampground, catchAsync(campgroundController.createCampground));

// GET route to display details of a specific campground by ID (Show Page)
router.get('/:id', catchAsync(campgroundController.showCampground));

// GET route to render the edit form for a specific campground by ID
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.renderEditForm));

// PUT route to update a specific campground by ID
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundController.updateCampground));

// DELETE route to remove a specific campground by ID
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));

// Exporting the router to be used in the main application
module.exports = router;