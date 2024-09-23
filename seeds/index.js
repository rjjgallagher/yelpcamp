const mongoose = require('mongoose');
const cities = require('./cities.js');
const {places, descriptors} = require('./seedHelpers.js');
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 25) + 10;
        const camp = new Campground({
            author: '66f1a8f802c9f0f3c76a52fb',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`, 
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eaque et numquam ducimus tempore recusandae qui architecto perferendis nobis dolor tempora molestiae harum, adipisci modi minus aperiam. Accusantium voluptates eius aspernatur voluptate voluptatem harum, soluta amet. Fuga aspernatur corrupti voluptatum magni praesentium. Enim dolorem sunt, omnis atque neque repellendus. Reiciendis, et!',
            price,
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});