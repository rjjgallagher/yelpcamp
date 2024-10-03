const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


const ImageSchema = new Schema ({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    // This refers to the image object
    return this.url.replace('/upload', '/upload/w_200');
});
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// Middleware to run after a 'findOneAndDelete' operation on a campground
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // If the deleted campground has associated reviews
    if(doc) {
        // Remove all reviews whose _id is found in the campground's reviews array
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);