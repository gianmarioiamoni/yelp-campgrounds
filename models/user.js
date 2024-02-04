const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate')

const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
    email: {
        type: String,
        required: false,
        unique: false
    },
    username: String,
    googleId: String,
    facebookId: String
});

// add unique username and password to the schema
UserSchema.plugin(passportLocalMongoose);
// add findOrCreate() method to the schema
UserSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", UserSchema);





