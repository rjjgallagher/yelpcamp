if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const ejsMateEngine = require('ejs-mate');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSantitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const User = require('./models/user');

const ExpressError = require('./utilities/ExpressError');

const userRoutes = require('./routes/users.js');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewsRoutes = require('./routes/reviews.js');

const MongoStore = require('connect-mongo');

const db_Url = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
    mongoUrl: db_Url,
    touchAfter: 24 * 60 * 60,
    crypto: { secret }
});

store.on('error', function(e) {
    console.log('Session store error', e);
});

mongoose.connect(db_Url);

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
app.use(mongoSantitize());

const sessionConfig = {
    store,
    name: 'blah',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwyxuciwl/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
/**
 * Middleware to initialize Passport and manage user sessions.
 * This sets up Passport to use the local strategy for authentication,
 * using the `authenticate` method provided by the User model.
 */
passport.use(new LocalStrategy(User.authenticate()));

// These methods are provided by the passport-local-mongoose plugin
passport.serializeUser(User.serializeUser()); // How to store a user in the session
passport.deserializeUser(User.deserializeUser()); // How to get a user out of the session

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
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