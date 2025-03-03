const mongoose=require("mongoose")
require("dotenv").config(); // Load environment variables

const mongoURI = process.env.MONGO_URI; // Get MongoDB URI from .env file

mongoose.connect(mongoURI,)
.then(()=>{
    console.log("mongodb connected");
})
.catch(()=>{
    console.log("failed to connect");
})

const LoginSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const collection=new mongoose.model("Collection1",LoginSchema)

module.exports=collection