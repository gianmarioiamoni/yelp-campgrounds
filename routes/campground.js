const express = require("express");
const router = express.Router();
// controllers
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");


router.get("/", catchAsync(campgrounds.index));

// new - route serving the new form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// new - route for post request
router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// edit - route serving the edit form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


// edit - route for post request
router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// show
router.get("/:id", catchAsync(campgrounds.showCampground));

// delete
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;