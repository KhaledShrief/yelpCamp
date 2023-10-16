const express = require("express");
const router = express.Router();
const ErrorHandelers =require("../utilty/errorHandelers")
const tryCatch = require("../utilty/tryCatch");
const Campground = require("../models/campGround")
router.get("/home",(req,res)=>{
    res.render("home.ejs")
})
router.get("/", tryCatch(async (req,res)=>{
    const campgrounds = await Campground.find({})
    res.render(`index.ejs`,{campgrounds})
}))
router.get("/new",(req,res)=>{
    res.render("newCamps.ejs")
})
router.post("/",tryCatch(async(req,res,next)=>{
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
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campground/${campground._id}`)
   

}));
router.get("/:id",tryCatch(async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate("reviews")
    res.render("show.ejs",{campground})
}))
router.get("/:id/edit", tryCatch(async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render("edit.ejs",{campground})
}))
router.put("/:id",tryCatch(async(req,res)=>{
    
    const {id}= req.params
   const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
   res.redirect(`/campground/${campground._id}`)
}))
router.delete("/:id",tryCatch(async(req,res)=>{
    const {id}= req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campground")
}))
module.exports = router;