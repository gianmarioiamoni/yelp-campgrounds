const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;




const CampgroundSchema = new Schema({
    title: String,
    image: String,
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
