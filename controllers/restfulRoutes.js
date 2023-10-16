const User = require("../models/users")
const Review = require("../models/review")
const Campground = require("../models/campGround")
const multer = require("multer")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken:mapboxToken})
const { array } = require("joi")
const upload = multer({dest:"uploads/"})
const {cloudinary} = require("../cloudinary/index")
module.exports.index =async (req,res)=>{

    const campgrounds = await Campground.find({})
    res.render(`index.ejs`,{campgrounds})
}

module.exports.newForm =(req,res)=>{
    res.render("newCamps.ejs")
}

module.exports.newCamp =async(req,res,next)=>{
    // const campgroundSchema = joi.object({
    //     campground: joi.object({
    //         title: joi.string().required(),
    //         price: joi.number().required().min(0),
    //         image: joi.string().required(),
    //         des: joi.string().required(),
    //         location: joi.string().required()
    //     }).required()
    // })
    // const {error} =campgroundSchema.validate(req.body)
    // if(error){
    //     const msg = error.details.map(el=> el.message).join(",")
    //     throw new ErrorHandelers(msg,400) 
    // }
     const geoData =await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    
    Campground.author = req.user._id
    const campground = new Campground(req.body.campground)
    campground.geometry =geoData.body.features[0].geometry;
    campground.images =req.files.map(f=>({url:f.path,filename:f.filename}))
    await campground.save()
    console.log(campground)
    req.flash("success","Thanks for adding A new campground!")
    res.redirect(`/campground/${campground._id}`)
   

}

module.exports.show =async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate("reviews").populate("author")
    res.render("show.ejs",{campground})
}

module.exports.renderEdit=async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render("edit.ejs",{campground})
}

module.exports.updateEdit =async(req,res)=>{
    const {id}= req.params
   const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
   const imgs =req.files.map(f=>({url:f.path,filename:f.filename}))
   campground.images.push(...imgs)
   await campground.save()
   if(req.body.deleteImages){
    // for(let filename of req.body.deleteImages){
    // await cloudinary.uploader.destroy(filename)
    // }
    await campground.updateOne({$pull:{images:{filename: { $in:req.body.deleteImages}}}})
   console.log(campground)   
}
   req.flash("success","Updated successfully")
   res.redirect(`/campground/${campground._id}`)
}

module.exports.deleteForm =async(req,res)=>{
    const {id}= req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campground")
};

//reviews

module.exports.updateReview =async(req,res)=>{

    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash("success","submited")
    res.redirect(`/campground/${campground._id}`)
}

module.exports.deleteReview =async(req,res)=>{
    const {id,reviewId}= req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash("success","Deleted successfully")
    res.redirect(`/campground/${id}`)
};
//users
module.exports.userRenderRegisterForm=(req,res)=>{
    res.render("register.ejs")
}

module.exports.registerdUser =async(req,res)=>{
    try{
    const {username,email,password}= req.body
    const user = new User({email,username})
    const newUser = await User.register(user,password)
    req.login(newUser,err=>{
        if(err) return next(err)
        req.flash("success","welcome to yelpCamp!")
        res.redirect("/campground")
    })

    }catch(e){
        req.flash("error",e.massage)
        res.redirect("/register")
    }
  
}
module.exports.renderLoginForm =(req,res)=>{
    res.render("login.ejs")
}
module.exports.loggedinUser = (req,res)=>{
    req.flash("success","Welcome back")
    const returnUrl =req.session.returnTo || "/campground";
    delete req.session.returnTo
    res.redirect(returnUrl)
}

module.exports.logedOut =(req,res)=>{
    req.logout()
    req.flash("success","Goodbye!")
    res.redirect("/campground")
}