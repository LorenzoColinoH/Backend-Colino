const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true
    },
    session: String,
    createdAt: {
        type: Date,
        default: ()=> Date.now(),
        inmutable: true

    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: "Post"}],
    likedPosts: [{type: mongoose.Schema.Types.ObjectId, ref: "Post"}]

})

module.exports = mongoose.model("User",userSchema)