//ใช้งาน mongoose 
const mongoose = require('mongoose')

//เชื่อม mongoDB
const dbUrl = 'mongodb://localhost:27017/productDB'
mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).catch(err=>console.log(err))

//ออกแบบ schema
let productSchema = mongoose.Schema({
    name:String,
    price:Number,
    image:String,
    description:String
})

//สร้าง model 
let Product = mongoose.model("products",productSchema)//สร้าง collection โดย model เป็นตัวแทนของ collection 


//ส่งออก model
module.exports = Product

//ออกแบบฟังก์ชันสำหรับบันทึกข้อมูล (data/document คือข้อมูลที่เก็บอยู่ใน collection)
module.exports.saveProduct = function(model,data){
    model.save(data)
}