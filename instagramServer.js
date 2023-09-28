//echo "# Backend-Colino" >> README.md
//git init
//git add README.md
//git commit -m "first commit"
//git branch -M main
//git remote add origin https://github.com/LorenzoColinoH/Backend-Colino.git
//git push -u origin main

const express = require("express")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const path = require("path");
const multer = require("multer")

// Modelos
const Comment = require("./Comment")
const User = require("./User.js")
const Post = require("./Post.js")

const mongoose = require('mongoose')
const spawn = require("child_process").spawn

const app = express();  // Devuelve el objeto app ,que tendrá sus métodos
//const uri = "mongodb+srv://lorenzocolinoh:<password>@clusterinstagram.jdupwhr.mongodb.net/"
//mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//mongoose.connect("mongodb://0.0.0.0:27017/base")
//UINwwdfUVo97wijv
mongoose.connect("mongodb+srv://lorenzocolinoh:UINwwdfUVo97wijv@clusterinstagram.jdupwhr.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
const storage = multer.diskStorage({
    destination: (req, file, callback)=>{
        callback(null,"./images")
    },
    filename: (req, file, callback) => {
        console.log(file)
        callback(null, Date.now() + path.extname(file.originalname))
    }
})


setInterval(()=>{
    // Lo que pongas aqui se ejecutará periódicamente cada 3 mins 
}, 3 * 1000 * 60)


const upload = multer({storage: storage})

const run = async () => {
    await Post.deleteMany()
    await User.deleteMany()
    

    const salt = await bcrypt.genSalt()
    const user = new User({username: "Lorenzo", password: await bcrypt.hash("123",salt)})
    
    const post = new Post({uri: "https://img.freepik.com/foto-gratis/amigos-divirtiendose-su-reunion_23-2149215801.jpg?w=2000", caption: "Mi primera foto (programática)",user:user._id})
    await post.save()
    user.posts.push(post._id)
    await user.save()
    console.log(post._id)
    const user2 = new User({username: "Eva", password: await bcrypt.hash("123",salt)})
    const post2 = new Post({uri: "https://img.freepik.com/foto-gratis/grupo-amigos-chocando-manos_23-2147643721.jpg?w=2000", caption: "Soy eva",user:user2._id})
    await post2.save()
    user2.posts.push(post2._id)
    await user2.save()

    const userFriends = new User({username: "Carlos",password: await bcrypt.hash("123",salt) ,friends : [user._id,user2._id]})
    await userFriends.save()
    //console.log(((await userFriends.populate("friends")).friends.map(friend => friend.posts)).flat(Infinity))
    //console.log((await Post.find({_id: "64cbfda247f291c1c3833060"}).populate("user")))
    //console.log(((await User.find()).length))

}
run()

app.use(express.static("public"));
app.use(express.json())
app.use(cookieParser())


// Aceptamos cookies, y que el origen de todas las peticiones sea nuestro frontend, localizado en 127.0.0.1
app.use(cors({
    origin:["http://127.0.0.1:5500","http://localhost:3000","http://192.168.8.101:19000"],
    credentials:true
}))



// Devuelve todos los usuarios de la página
app.get("/users",autenticadoRN,async (req,res)=>{
    res.json({Hello: "world"})
})


app.get("/testEndpoint", (req, res)=>{
    res.status(200).send("Se ha establecido la conexión correctamente")
})



// Endpoint para probar que funciona el middleware de autenticacion con cookies 
app.get("/homepage",autenticadoRN,(req,res)=>{
    res.sendFile(path.join(__dirname, "public", "homepage.html"));
})



app.get("/feed",autenticadoRN, async (req,res)=>{
    // Tenemos el username del usuario que hace la peticion a feed
    const user = req.user
    //console.log(user)
    // Mappearemos el array de friends, y despues el de posts de cada uno de eso friends, para después flatearlos con flat
    // Después haremos sort por createdAt y finalmente limitaremos la búsqueda a 20 posts 
    const userFriends = await User.find({ _id: { $in: user.friends } })
    console.log(userFriends)
    const userFriendsPosts = await Post.find({ _id: { $in: userFriends.map((friend)=> friend.posts).flat(Infinity)}}).populate("user")
    res.json(userFriendsPosts)
})



app.get("/profile/:username",autenticadoRN,async (req,res)=>{
    try {
        const user = (await User.find({username: req.params.username}))[0]
    }    
    catch (e){
        // json({user}) o json(user)
        res.status(200).json({user})
    }
})

app.post("/giveLike", autenticadoRN ,async (req,res) => {
    const { user } = req;
    const postID = req.body.postID; // Aqui metemos el ObjectId del post
    const post = await Post.findById(postID)
    if (!!post){
        if (!user.likedPosts.includes(postID)){
            user.likedPosts.push(postID)
            post.numberOfLikes += 1;
            await post.save()
            await user.save()
            res.status(200).send("Like")
        }
        else{
            user.likedPosts =  user.likedPosts.filter((post)=> !postID === post._id)
            post.numberOfLikes -= 1;
            await user.save()
            await post.save()
            res.status(200).send("Like removed")
        }   
    }
    else res.status(400).send("Ha habido un problema")
        
})  

app.post("/setComment", autenticadoRN, async (req,res)=> {
    const postID = req.body.postID;
    const post = await Post.find({_id:postID})
    post.comments.push(req.body.comment);
    await posts.save()
})
// sHOz2nvVW2JkXrA9
app.post("/signup", async (req,res)=>{
    try{
        //Generacion de contraseña
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password,salt)

        // Creacion de usuario
        const user = new User({username: req.body.username, password: hashedPassword})
        await user.save()        
        //Respuesta si todo ha ido bien
        res.status(201).send("Exito creando al usuario")
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


app.get("/myProfile", autenticadoRN, async (req,res)=>{
    const { user } = req;
    res.status(200).json({user})
})


app.get("/userPhotos",autenticadoRN,async (req,res)=>{
    // El usuario ya esta autenticado, queda encontrar al usuario y devolver las fotos en formato json
    const photos = await Post.find({ _id: { $in: req.user.posts } })
    console.log(photos)
    res.status(200).json(photos)
})

// Login del usuario
app.post("/login",async (req,res)=> {
    //Encontramos el usuario por su username 
    const user = (await User.find({username: req.body.username}))[0]
    console.log(user)
    //Si el usuario no existe mandamos un bad request del usaurio (400) 
    if (user === null) return res.status(400).send("Dicho usuario no existe")
    
    //Si existe le asignamos un sessionID, siempre que su contraseña coincida
    try{    
        // Comparamos la contraseña
        if(await bcrypt.compare(req.body.password ,user.password)){
            const session = crypto.randomUUID()
            
            // El código de abajo es para navegadores, es decir, con cookies 
            
            //res.cookie("sessionID", session, {
            //    httpOnly:true,
            //    maxAge:1000000,
            //    sameSite: "none",
            //    secure:true
            //})

            // Le añadimos la sesion que tendremos que quitarle cuando haga logout o cuando queramos revocar acceso a dicha sesion
            
            user.session = session
            // Guardamos al usuario
            await user.save()
            

            console.log(`Hemos hecho login y esta es nuestra cookie ${session}`)
            res.status(200).json({sessionID: session})
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
        //console.log(req.cookies.sessionID)
        const user = await User.findOne({session: req.cookies.sessionID}) // Para que no nos devuelva una lista
        req.user = user
        //console.log("Hola")
        //console.log(user)
        //console.log("Adios")
        // Si usuario existe entonces mandale de vuelta al endpoint
        user !=null ? next() : res.status(401).send("No estas autorizado")
    }
    else{
        res.send("Error")
    }
}
// Esta es la autenticacion con React NAtive, es decir a traves de sesiones
async function autenticadoRN (req,res,next){
    // Ponemos !! ya que si es undefined haremos un casting a boolean con !!
    if (!!req.headers.authorization){
        let sessionID = req.headers.authorization?.split(' ')[1]
        const user = await User.findOne({session: sessionID})
        // Lo metemos en la request, porque es middleware, y por lo general los endpoint que requieran de autenticación luego
        // necesitarán del usuario, por ejemplo, la feed, necesita enseñar los posts de los amigos de ESE USARIO 
        req.user = user
        !!user ? next() : res.status(401).send("No estas autorizado")  
    }
    else{
        res.status(403).send("No estas autorizado")
    }
}

app.listen(3000)