const mongoose = require("mongoose")


// Se esta creando una instancia de la clase Schema
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

// Este método crea el modelo, que es el encargado de modificar la base de datos, y está sujeto a la estructura definida en el Schema
// Aquí no se pone new porque no se está creando una instancia, sino que se está registrando el modelo en la base de datos 
module.exports = mongoose.model("User",userSchema)