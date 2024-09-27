const express = require('express');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const catchAsync = require('../utilities/catchAsync');
const campgroundController = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Initializing the Express router
const router = express.Router();

router.route('/')
    // GET route for displaying all campgrounds (Index Page)
    .get(catchAsync(campgroundController.index))
    // POST route for creating a new campground
    //.post(isLoggedIn, validateCampground, catchAsync(campgroundController.createCampground));
    .post(upload.array('image'), (req, res) => {
        console.log(req.body, req.files);
        res.send('It worked!');
    })

// GET route to render the form for creating a new campground
router.get('/new', isLoggedIn, campgroundController.renderNewForm);

router.route('/:id')
    // GET route to display details of a specific campground by ID (Show Page)
    .get(catchAsync(campgroundController.showCampground))
    // PUT route to update a specific campground by ID
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundController.updateCampground))
    // DELETE route to remove a specific campground by ID
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));

// GET route to render the edit form for a specific campground by ID
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.renderEditForm));

// Exporting the router to be used in the main application
module.exports = router;