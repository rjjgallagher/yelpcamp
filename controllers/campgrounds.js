const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});  // Fetch all campgrounds from the database
    res.render('campgrounds/index', { campgrounds });  // Render the campgrounds index page with the fetched data
};

module.exports.renderNewForm = (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to create a new campground!');
        return res.redirect('/login');
    }
    res.render('campgrounds/new');  // Render the 'new campground' form page
}

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);  // Create a new Campground object with the request data
    // Passport.js adds the user property to req after successful authentication
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));  // Map the uploaded files to an array of objects
    campground.author = req.user._id;  // Set the author of the campground to the current user
    await campground.save();  // Save the campground to the database
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!');  
    res.redirect(`/campgrounds/${campground._id}`);  // Redirect to the newly created campground's show page
};

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');  // Find campground by ID and populate reviews

    if(!campground) {
        req.flash('error', 'Can\'t fnd that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });  // Render the show page for the campground
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);  // Find campground by ID
    if(!campground) {
        req.flash('error', 'Can\'t fnd that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });  // Render the edit form for the campground
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    // Find the campground by ID and update it with the new data from the request body
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));  // Map the uploaded files to an array of objects
    campground.images.push(...imgs);  // Push the new images to the campground's images array
    await campground.save();  // Save the updated campground to the database
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);  // Delete the images from Cloudinary
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
        console.log(campground);
    }
    req.flash('success', `Successfully updated ${ campground.title }!`) 
    res.redirect(`/campgrounds/${campground._id}`);  // Redirect to the updated campground's show page
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id); 
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');  // Redirect back to the campgrounds index page
};