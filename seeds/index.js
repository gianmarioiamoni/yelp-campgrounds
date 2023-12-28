const mongoose = require('mongoose');
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");


main()
    .catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
        console.log("CONNECTION OPEN to port 27017");

        const sample = (array) => array[Math.floor(Math.random() * array.length)];

        // empty db
        const seedDB = async () => {
            await Campground.deleteMany({});

            for (let i = 0; i < 50; i++) {
                const random1000 = Math.floor(Math.random() * 1000);
                const camp = new Campground({
                    location: `${cities[random1000].city}, ${cities[random1000].state}`,
                    title: `${sample(descriptors)} ${sample(places)}`
                })
                await camp.save();

            }

        }

        seedDB()
            .then(() => mongoose.connection.close())
            .catch(err => console.log(err))


    } catch (err) {
        console.log("CONNECTION ERROR: " + err);
    }

}

