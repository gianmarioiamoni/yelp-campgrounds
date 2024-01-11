const express = require("express");
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");
const {reviewSchema} = require("../schemas")

// middleware validation function
const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // get a single string error message
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// REVIEWS

router.post("/", validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:reviewId", catchAsync(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    const campground = await Campground.findById(req.params.id);
    const updatedReviews = campground.reviews.filter((rev) => rev._id !== review._id);
    await Campground.findByIdAndUpdate(campground._id, { reviews: [...updatedReviews] });

    res.redirect(`/campgrounds/${campground._id}`);
}));


module.exports = router;
