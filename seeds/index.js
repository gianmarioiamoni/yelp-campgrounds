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
                    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
                    price,
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

