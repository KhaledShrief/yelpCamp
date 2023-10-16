const express = require("express");
const router = express.Router();
const tryCatch = require("../utilty/tryCatch");
const Review = require("../models/review");
const Campground = require("../models/campGround");

router.post("/",tryCatch(async(req,res)=>{
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    res.redirect(`/campground/${campground._id}`)
}))

router.delete("/:reviewId",tryCatch(async(req,res)=>{
    const {id,reviewId}= req.params
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campground/${id}`)
}))

module.exports =router