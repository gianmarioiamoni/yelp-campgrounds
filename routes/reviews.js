const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview } = require("../middleware");


// REVIEWS

router.post("/", validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();

    req.flash("success", "Successfully added a new review");

    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:reviewId", catchAsync(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    const campground = await Campground.findById(req.params.id);
    const updatedReviews = campground.reviews.filter((rev) => rev._id !== review._id);
    await Campground.findByIdAndUpdate(campground._id, { reviews: [...updatedReviews] });

    req.flash("success", "Successfully deleted review");

    res.redirect(`/campgrounds/${campground._id}`);
}));


module.exports = router;
