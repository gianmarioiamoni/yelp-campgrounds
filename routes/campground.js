const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

// Cloudinary storage
const { storage } = require("../cloudinary"); // index not needed, automatically looked for

// to parse multicode for images upload
const multer = require('multer');
const upload = multer({ storage });


router.route("/")
    // index route
    .get(catchAsync(campgrounds.index))
    // create a new campground route
    // upload middleware is for parsing multicode objects for image upload
    // "image" is the form name used to upload the image
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

// new - route serving the new form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    // new - route for post request
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    // show
    .get(catchAsync(campgrounds.showCampground))
    // delete
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// edit - route serving the edit form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;