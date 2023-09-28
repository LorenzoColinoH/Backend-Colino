const mongoose = require("mongoose")

const commentSchema = mongoose.Schema({
    comment: {
        type: String,
        required: true,
        default: ""
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: ()=> {return Date.now()},
        inmutable: true
    }
})

module.exports = mongoose.model("Comment",commentSchema)