const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

// Mapbox SDK for geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
    // forwarding geocoding provided by Mapbox
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    // create a new Campground object 
    const campground = new Campground(req.body.campground);
    
    // body.features[0].geometry.coordinates is an array [longitude, latitude]
    // (opposite of the expected order!)
    campground.geometry = geoData.body.features[0].geometry.coordinates; 
    // req.files it's an array containing information about loaded files provided by Multer
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // add the author as the current logged user; the id is stored in req.user, provided by Passport
    campground.author = req.user._id;

    await campground.save();
    console.log(campground);

    req.flash("success", "Successfully made a new campground");

    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    // find the campground to show and populate its reviews field
    const campground = await Campground.findById(req.params.id)
        // populate each campground with its reviews and each review with its author 
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("author");
    if (!campground) {
        req.flash("error", "Cannot find the campground");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash("error", "Cannot find the campground");
        return res.redirect("/campgrounds");
    }

    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // req.files it's an array containing information about loaded files provided by Multer
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    // Delete images
    // We have access to deleteImages[], containing the images to be deleted
    if (req.body.deleteImages) {
        // if there are images to be deleted
        
        // delete images from MongoDB
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });

        // delete images from Cloudinary
        for (let image of req.body.deleteImages) {
            // destroy() is a method provided by Cloudinary
            await cloudinary.uploader.destroy(image);
        }

    }

    await campground.save();

    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;

    await Campground.findByIdAndDelete(id);

    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
}




