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
router.post("/", validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //     throw new ExpressError("invalid Campground Data", 400);


    // create a new Campground object and save It to MongoDB
    const campground = new Campground(req.body.campground);
    await campground.save();

    req.flash("success", "Successfully made a new campground");

    res.redirect(`/campgrounds/${campground._id}`);
}));

// edit - route serving the edit form
router.get("/:id/edit", isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        req.flash("error", "Cannot find the campground");
        return res.redirect("/campgrounds");
    }

    res.render('campgrounds/edit', { campground });
}));


// edit - route for post request
router.put("/:id", isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });

    req.flash("success", "Successfully updated campground");

    res.redirect(`/campgrounds/${campground._id}`);

}));

// show
router.get("/:id", catchAsync(async (req, res) => {
    // find the campground to show and populate its reviews field
    const campground = await Campground.findById(req.params.id).populate("reviews");
    if (!campground) {
        req.flash("error", "Cannot find the campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}));

// delete
router.delete("/:id", isLoggedIn, catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
}));

module.exports = router;