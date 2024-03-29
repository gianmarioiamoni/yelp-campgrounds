const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

// virtual for thumbnails
// It shows the information as It would be stored in the DB
ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: { // GeoJSON format
        type: {
            type: String, 
            index: true,
            enum: ['Point'], // 'type' must be 'Point'
            required: false
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, opts);

CampgroundSchema.virtual("properties.popupMarkup").get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 30)}...</p>
    `;
});


// Mongoose middleware for deleting a campground
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    // if a document was deleted
    if (doc) {
        // delete all reviews in the deleted document
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema);
