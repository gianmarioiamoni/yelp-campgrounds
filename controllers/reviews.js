const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // add the current user as author of the review
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash("success", "Successfully added a new review");

    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    const campground = await Campground.findById(req.params.id);
    const updatedReviews = campground.reviews.filter((rev) => rev._id !== review._id);
    await Campground.findByIdAndUpdate(campground._id, { reviews: [...updatedReviews] });

    req.flash("success", "Successfully deleted review");

    res.redirect(`/campgrounds/${campground._id}`);
}


