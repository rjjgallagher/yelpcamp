const path = require('path');
const mongoose = require('mongoose');
const express = require('express');
const methodOverride = require('method-override');
const ejsMateEngine = require('ejs-mate');

const ExpressError = require('./utilities/ExpressError');

const campgroundRoutes = require('./routes/campgrounds.js');
const reviewsRoutes = require('./routes/reviews.js');


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMateEngine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong.';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});