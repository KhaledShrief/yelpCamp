const mongoose = require("mongoose")
const Campground = require("../models/campGround")
const cities = require("./cities")
const {descriptors,places} = require("./seedHelpers")
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    // useNewUrlParser:true,
    // useCreateIndex: true,
    // useUnifiedTopology: true,
})
.then(()=>{
    console.log("welcome to mongo")
})
.catch((err)=>{
    console.log("ouch error from mongo",err)
})
const sample = (array)=> array[Math.floor(Math.random()*array.length)];
const  SeedDb = async ()=>{ 
    await Campground.deleteMany({});
    for(let i = 0;i<300;i++){
       
        const random1000 = Math.floor(Math.random()*1000+1)
        const price = Math.floor(Math.random()*20+10);
       const camp =  new Campground({
        location:`${cities[random1000].city},${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        // image:"https://source.unsplash.com/collection/483251",
        author:"651cf672cdf1f4eee1b8f629",
        des:"ipsum dolor sit amet consectetur adipisicing elit. Soluta cupiditate laborum ipsa beatae alias cum, nisi, odio natus, eligendi fuga ipsam facilis cumque. Dolor doloremque sunt pariatur, beatae incidunt in.",
        price,
        geometry: { type: 'Point', coordinates: [ 
          cities[random1000].longitude,cities[random1000].latitude
        ] 
      },
        images:[
            {
              url: 'https://res.cloudinary.com/dfbspvgdo/image/upload/v1696671977/Yelp-camp/twntcqdeyz6jzoudnh9h.jpg',
              filename: 'Yelp-camp/twntcqdeyz6jzoudnh9h'
            },
            {
              url: 'https://res.cloudinary.com/dfbspvgdo/image/upload/v1696671977/Yelp-camp/rufbhi4l0jif7vjwajtl.jpg',
              filename: 'Yelp-camp/rufbhi4l0jif7vjwajtl'
            }
          ]

    }) 
       await camp.save();
    }
}
SeedDb();
