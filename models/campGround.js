const { ref } = require("joi");
const mongoose =require("mongoose");
const Schema = mongoose.Schema;
const ImagesSchema = new Schema({
        url:String,
        filename:String
})
ImagesSchema.virtual("thumbnail").get(function(){
    return this.url.replace("/upload","/upload/w_200")
});
const opts={toJSON:{virtuals:true}}
const CampgroundSchema = new Schema({
    title:String,
    images:[ImagesSchema],
    geometry:{
        type:{
            type:String,
            enum:["Point"],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    price: Number,
    des: String,
    location:String,
    author:
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
},opts)
CampgroundSchema.virtual("properties.popUpMarkup").get(function(){
    return `<strong><a href="/campground/${this._id}">${this.title}</a><strong>
    <p>${this.des}</p>`
});
module.exports= mongoose.model("Campground",CampgroundSchema)  