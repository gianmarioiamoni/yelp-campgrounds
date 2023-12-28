const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const Campground = require("./models/campground");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("home");
})

app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
})

app.listen(3000, () => {
    console.log("SERVING ON PORT 3000");
})

main()
    .catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
        console.log("CONNECTION OPEN to port 27017");
    } catch (err) {
        console.log("CONNECTION ERROR: " + err);
    }



}
