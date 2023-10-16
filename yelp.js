if(process.env.NODE_ENV !== "production"){
   require("dotenv").config();
}
const {storage} =require("./cloudinary")
const express = require("express")
const yelp = express()
const path =require("path")
const mongoose = require("mongoose")
const methodOverride =require("method-override")
const ejsMate = require("ejs-mate");
const Campground = require("./models/campGround")
// const ErrorHandelers =require("./utilty/errorHandelers")
const tryCatch = require("./utilty/tryCatch");
const session = require("express-session");
const flash = require("connect-flash")
const Review = require("./models/review")
const campground = require("./controllers/restfulRoutes")
const User = require("./models/users")
// const joi = require("joi");
// const campGround =require("./routes/campgrounds")
const passport=require("passport")
const passportLocal=require("passport-local")
const multer = require("multer")
const upload = multer({storage})
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const MongoDBStore = require("connect-mongo")(session)
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'
const secret = process.env.SECRET || "my secret"
mongoose.connect(dbUrl,{
    // useNewUrlParser:true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
})
.then(()=>{
    console.log("welcome to mongo")
})
.catch((err)=>{
    console.log("ouch error from mongo",err)
})
yelp.use(helmet({contentSecurityPolicy:false}))
yelp.use(mongoSanitize())
//ejsMate middleware
yelp.engine("ejs", ejsMate)
//ejs middleware
yelp.set("views",path.join(__dirname,"views"));
yelp.set("view engine","ejs")
//req.body middleware
yelp.use(express.urlencoded({extended:true}))
//methodOverRide middleware
yelp.use(methodOverride("_method"))
//session middelware
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24*60*60
})
store.on("error",function(e){
    console.log(e)
})
const sessionSecret ={
    store,
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
yelp.use(session(sessionSecret))
yelp.use(flash());

yelp.use((err,req,res,next)=>{
    const {statusCode = 500 ,message = "Somthing Went Wrong"} = err
     res.status(statusCode).render("error.ejs",{err});
 })


//passport middelware
yelp.use(passport.initialize())
yelp.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());
yelp.use((req,res,next)=>{
    res.locals.currentUser = req.user
    res.locals.success =req.flash("success")
    res.locals.error =req.flash("error")
    next()
})
//restful routs
const isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash("success","You Must Signin")
        return res.redirect("/login");
    }
    next()
}
yelp.get("/register",campground.userRenderRegisterForm)

yelp.post("/register",tryCatch(campground.registerdUser))

yelp.get("/login",campground.renderLoginForm)

yelp.post("/login", passport.authenticate("local", {failureFlash:true, failureRedirect:"/login"}) ,campground.loggedinUser)

yelp.get("/logout",campground.logedOut)

yelp.get("/",(req,res)=>{
    res.render("home.ejs")
})
yelp.get("/campground", tryCatch(campground.index))

yelp.get("/campground/new", isLoggedin,campground.newForm)

yelp.post("/campground",upload.array("image"),tryCatch(campground.newCamp));

yelp.get("/campground/:id",isLoggedin ,tryCatch(campground.show))

yelp.get("/campground/:id/edit", isLoggedin, tryCatch(campground.renderEdit))

yelp.put("/campground/:id",upload.array("image"),tryCatch(campground.updateEdit))

yelp.delete("/campground/:id", isLoggedin, tryCatch(campground.deleteForm))

yelp.post("/campground/:id/reviews", isLoggedin,tryCatch(campground.updateReview))

yelp.delete("/campground/:id/reviews/:reviewId", isLoggedin,tryCatch(campground.deleteReview))


yelp.listen(3000,()=>{
    console.log("hello from yelp listening to port 3000")
})


yelp.post("findByIdAndDelete",async(doc)=>{
    if(doc){
        await Review.remove({
            _id:{$in:doc.reviews}
        })
    }
})
