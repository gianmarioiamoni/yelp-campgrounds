const mongoose = require('mongoose');
const Campground = require("../models/campground");
const cities = require("./cities");
// const cities = require("./citiesITA");
const { places, descriptors } = require("./seedHelpers");
// const { places, descriptors } = require("./seedHelpersITA");
// const camps = require("./campITA");
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
            for (let i = 0; i < 200; i++) {
                // const random1000 = Math.floor(Math.random() * 1000);
                const random1000 = Math.floor(Math.random() * 126);
                const price = Math.floor(Math.random() * 20) + 10;

                const camp = new Campground({
                    author: '65b6fabdd3d893d389788c1e',
                    location: `${cities[random1000].city}, ${cities[random1000].state}`,
                    // title: `${sample(descriptors)} ${sample(places)}`,
                    title: `${sample(places)} ${sample(descriptors)}`,
                    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
                    price,
                    geometry: {
                        type: "Point",
                        coordinates: [
                            cities[random1000].longitude,
                            cities[random1000].latitude]
                    },
                    images: [
                        {
                            url: 'https://res.cloudinary.com/dzmynvqbz/image/upload/v1705606263/YelpCamp/fomr7wnhmjsg0za9fc0e.jpg',
                            filename: 'YelpCamp/fomr7wnhmjsg0za9fc0e'
                        },
                        {
                            url: 'https://res.cloudinary.com/dzmynvqbz/image/upload/v1705606274/YelpCamp/ven8af5iqvmmac0vno9e.jpg',
                            filename: 'YelpCamp/ven8af5iqvmmac0vno9e'
                        },
                        {
                            url: 'https://res.cloudinary.com/dzmynvqbz/image/upload/v1705606275/YelpCamp/t4ewttlxtugv8ekvlyvo.jpg',
                            filename: 'YelpCamp/t4ewttlxtugv8ekvlyvo'
                        }
                    ]
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

