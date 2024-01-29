const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate')

const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: false,
            // unique: false
        },
        googleId: String
    }
);
// add unique username and password to the schema
UserSchema.plugin(passportLocalMongoose);

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", UserSchema);




