const express = require("express")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const path = require("path");
const multer = require("multer")

const User = require("./User.js")
const Post = require("./Post.js")

const mongoose = require('mongoose')




const app = express();
mongoose.connect("mongodb://0.0.0.0:27017/base")
const storage = multer.diskStorage({
    destination: (req, file, callback)=>{
        callback(null,"./images")
    },
    filename: (req, file, callback) => {
        console.log(file)
        callback(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

const run = async () => {

    //const user = new User({name: "Lorenzo", age: 22})
    //const user2 = new User({name: "Carlos", age: 21, friends : [user._id]})
    //await user.save()
    //await user2.save()
    //console.log(await user2.populate("friends"))
    //console.log(((await User.find()).length))

}
run()

app.use(express.static("public"));
app.use(express.json())
app.use(cookieParser())


// Aceptamos cookies, y que el origen de todas las peticiones sea nuestro frontend, localizado en 127.0.0.1
app.use(cors({
    origin:["http://127.0.0.1:5500","http://localhost:3000"],
    credentials:true
}))



// Devuelve todos los usuarios de la página
app.get("/users",async (req,res)=>{
    res.json(User.find())
})







// Endpoint para probar que funciona el middleware de autenticacion con cookies 
app.get("/homepage",autenticado,(req,res)=>{
    res.sendFile(path.join(__dirname, "public", "homepage.html"));
})




app.post("/signup", async (req,res)=>{
    try{
        //Generacion de contraseña
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password,salt)

        // Creacion de usuario
        const user = new User({username: req.body.username, password: hashedPassword})
        await user.save()        
        //Respuesta si todo ha ido bien
        res.status(201).send("Exito crenado al usuario")
    }
    catch(e){

        // Error del servidor
        console.log(e.message)
        res.status(500).send("Error")
    }

})


app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});


// Login del usuario
app.post("/login",async (req,res)=> {

    //Encontramos el usuario por su name 
    const user = (await User.find({username: req.body.username}))[0]
    //Si el usuario no existe mandamos un bad request del usaurio (400) 
    if (user == null){
        return res.status(400).send("Dicho usuario no existe")
    }
    
    //Si existe le asignamos un sessionID, siempre que su contraseña coincida
    const session = crypto.randomUUID()
    try{    
        // Comparamos la contraseña
        if(await bcrypt.compare(req.body.password ,user.password)){
            res.cookie("sessionID", session, {
                httpOnly:true,
                maxAge:1000000,
                sameSite: "none",
                secure:true
            })
            // Le añadimos la sesion que tendremos que quitarle cuando haga logout o cuando queramos revocar acceso a dicha sesion
            user.session = session
            // Guardamos al usuario
            await user.save()
            
            console.log(`Hemos hecho login y esta es nuestra cookie ${session}`)
            res.status(200).send("Ha hecho login correctamente")
        }
        else{
            // No autenticado
            res.status(400).send("La contraseña es incorrecta")
        }
    }
    
    //El usuario ha sido logeado correctamente ahora habrá que asignarle un id de sesión
    catch(e){
        console.log(e.message)
        res.status(500).send("Fallo del servidor")
    }
})


//Midleware
async function autenticado (req,res,next){
    if (!!req.cookies.sessionID){  // Convertimos (casting) a false o true el valor, que puede ser undefined, podría hacerse con el ?
        const user = await User.find({session: req.cookies.session})
        // Si usuario existe entonces mandale de vuelta al endpoint
        user !=null ? next() : res.status(401).send("No estas autorizado")
    }
    else{
        res.send("Error")
    }
}

app.listen(3000)