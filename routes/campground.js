const express = require("express");
const router = express.Router();
// controllers
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

// Cloudinary storage
const { storage } = require("../cloudinary"); // index not needed, automatically looked for

// to parse multicode for images upload
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage });


router.route("/")
    // index route
    .get(catchAsync(campgrounds.index))
    // create a new campground route
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    
    // upload middleware is for parsing multicode objects for image upload
    // "image" is the form name used to upload the image
    .post(upload.array("image"), (req, res) => {
        console.log(req.body, req.files);
        res.send("IT WORKED!!");
    })

// new - route serving the new form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    // new - route for post request
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    // show
    .get(catchAsync(campgrounds.showCampground))
    // delete
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// edit - route serving the edit form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;