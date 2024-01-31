const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

// Mapbox SDK for geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });



// function successLocation(position) {
//     var { latitude, longitude } = position.coords;
//     // map.setCenter([longitude, latitude]); // Update map center
//     // new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map); // Add marker at current location
    
//     console.log("in index: latitude = ", latitude, "longitude = ", longitude);
// }

// function errorLocation() {
//     alert('Unable to retrieve your location');
// }

module.exports.index = async (req, res) => {
    let dbQuery = {};
    let searchQuery = {};
    let distanceQuery = {};
    // latitude =  45.7409757 longitude =  8.523871
    const ltd = 45.7409757;
    const lgd = 8.523871;

    let { search, distance } = req.query;

    distance = Number(distance);
    console.log("distance = ", distance);
    console.log("type of distance = ", typeof distance);

    // // Get current location
    // Object.navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    //     enableHighAccuracy: true
    // });
    
    // console.log("req = ", req);
    if (search) {
        // we have a not null search query
        console.log("req.query = ", req.query);
        // dbQuery = {
        searchQuery = {
            $or: [
                { title: { $regex: search } },
                { location: { $regex: search } },
                { description: { $regex: search } }]
        } 
    }

    if (distance !== "0") {
        // we have a distance query
        distanceQuery = {
            geometry: {
                $near: {
                    $maxDistance: distance*1000,
                    $geometry: {
                        type: "Point",
                        coordinates: [-89.0939952, 42.2711311]
                        // coordinates: [42.2711311, -89.0939952]
                    },
                },
            },
        }
    }

    dbQuery = {
        $and: [
            searchQuery,
            distanceQuery
        ]

    };

    console.log("dbQuery = ", JSON.stringify(dbQuery));

    // const campgrounds = await Campground.find({});
    const campgrounds = await Campground.find(dbQuery);
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
    const query = req.body.campground.location;
    const mapboxAPIEndpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapBoxToken}`;

    try {
        const response = await fetch(mapboxAPIEndpoint);

        if (!response.ok) {
            throw new Error(`Mapbox API request failed with status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);

        const campground = new Campground(req.body.campground);
        // body.features[0].geometry.coordinates is an array [longitude, latitude]
        // (opposite of the expected order!)
        campground.geometry = data.features[0].geometry;
        campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
        campground.author = req.user._id;
        await campground.save();
        req.flash('success', 'Successfully created a new campground');
        res.redirect(`/campgrounds/${campground._id}`)
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
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





