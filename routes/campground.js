const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const { isLoggedIn } = require("../middleware");


// middleware validation function
const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // get a single string error message
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

// new - route serving the new form
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// new - route for post request
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {

    // create a new Campground object 
    const campground = new Campground(req.body.campground);
    // add the author as the current logged user; the id is stored in req.user
    campground.author = req.user._id;

    await campground.save();

    req.flash("success", "Successfully made a new campground");

    res.redirect(`/campgrounds/${campground._id}`);
}));

// edit - route serving the edit form
router.get("/:id/edit", isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash("error", "Cannot find the campground");
        return res.redirect("/campgrounds");
    }

    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    
    res.render('campgrounds/edit', { campground });
}));


// edit - route for post request
router.put("/:id", isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }
    const camp = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });

    req.flash("success", "Successfully updated campground");

    res.redirect(`/campgrounds/${camp._id}`);

}));

// show
router.get("/:id", catchAsync(async (req, res) => {
    // find the campground to show and populate its reviews field
    const campground = await Campground.findById(req.params.id).populate("reviews").populate("author");
    if (!campground) {
        req.flash("error", "Cannot find the campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}));

// delete
router.delete("/:id", isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "You don't have permission to do that");
        return res.redirect(`/campgrounds/${id}`);
    }

    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
}));

module.exports = router;