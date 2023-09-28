const mongoose = require("mongoose")

const postSchema = mongoose.Schema({
    caption: {
        type: String
    },
    createdAt: {
        type: Date,
        default: ()=> {return Date.now()},
        inmutable: true,
    },
    uri: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    numberOfLikes: {
        type: Number,
        required: true,
        default: 0,
    },
    comments:[String]
})

module.exports = mongoose.model("Post",postSchema)