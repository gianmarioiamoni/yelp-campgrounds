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

        // // call unsplash and return small image
        // async function seedImg() {
        //     try {
        //         const resp = await axios.get('https://api.unsplash.com/photos/random', {
        //             params: {
        //                 client_id: '5dq7c5WrFdd9SB6CLZKMGr3uob2UaVjdWUSeiiB9Wp8',
        //                 collections: 1114848,
        //             },
        //         })
        //         return resp.data.urls.small
        //     } catch (err) {
        //         console.error(err)
        //     }
        // }

        // // empty db
        // const seedDB = async () => {
        //     await Campground.deleteMany({});

        //     for (let i = 0; i < 30; i++) {
        //         const unsplashObj = await seedImg();
        //         const random1000 = Math.floor(Math.random() * 1000);
        //         const camp = new Campground({
        //             image: unsplashObj.url.regular,
        //             // location: `${cities[random1000].city}, ${cities[random1000].state}`,
        //             location: `${unsplashObj.location.city}, ${unsplashObj.location.country}`,
        //             title: `${sample(descriptors)} ${sample(places)}`,
        //             description: unsplashObj.description
        //         })
        //         await camp.save();

        //     }

        // }

        const seedDB = async () => {
            await Campground.deleteMany({});
            for (let i = 0; i < 50; i++) {
                const random1000 = Math.floor(Math.random() * 1000);
                const price = Math.floor(Math.random() * 20) + 10;
                const camp = new Campground({
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

