const mongoose = require('mongoose');
const Campground = require("../models/campground");
const cities = require("./cities");
// const axios = require("axios");
const { places, descriptors } = require("./seedHelpers");
const { url } = require('inspector');


main()
    .catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
        console.log("CONNECTION OPEN to port 27017");

        const sample = (array) => array[Math.floor(Math.random() * array.length)];

        const seedDB = async () => {
            await Campground.deleteMany({});
            for (let i = 0; i < 50; i++) {
                const random1000 = Math.floor(Math.random() * 1000);
                const price = Math.floor(Math.random() * 20) + 10;

                const camp = new Campground({
                    author: '65a170d04e30be43d3dbe968',
                    location: `${cities[random1000].city}, ${cities[random1000].state}`,
                    title: `${sample(descriptors)} ${sample(places)}`,
                    image: 'https://source.unsplash.com/collection/483251',
                    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
                    price
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

