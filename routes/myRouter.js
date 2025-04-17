//จัดการ routing จัดการการรับส่งข้อมูล
const express = require('express')
const router = express.Router() //รับผิดชอบเรื่องการรับส่งข้อมูลโดยให้ express ทำงานฝั่ง web server และเรียกใช้ class router อีกที 
const Product = require('../models/products')//เรียกใช้งาน model 

//อัพโหลดไฟล์ 
const multer = require('multer')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, './public/images/products') //กำหนดตำแหน่งไฟล์ที่จะถูกอัพโหลด
    },
    filename:function(req,file,cb){
        cb(null, Date.now()+".jpg") //เปลี่ยนชื่อไฟล์ ป้องกันชื่อซ้ำกัน
    }
})

//เริ่มต้น upload
const upload = multer({
    storage:storage
})




//การส่งข้อมูลแบบตัวเดียว
/*router.get('/', (req,res)=>{
    const name = "Nut Rattanamongkol"
    const age = 17
    const address = "<h3>ใต้ฟ้าบนดิน</h3>"
    res.render('index.ejs',{name:name, age:age, address:address})// ส่งข้อมูลไปแสดงด้วย นั่นคือ property name ที่เก็บตัวแปร name ไว้
})*/

//การส่งข้อมูลแบบ array
//ใช้คำสั่ง .find ในการหาข้อมูลจากโมเดล Product จากทุก docในcollection มาแสดงที่หน้า index
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().exec(); // Use await to handle asynchronous operation
        res.render('index', { products }); // Send products to the template
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/add-product', (req,res)=>{
    if(req.session.login){
        res.render('form.ejs')// เช็คว่า cookie login มีสถานนะเป็น true => ไปหน้าบันทึกสินค้า
    }else{
        res.render('admin.ejs')// false => ไปหน้าเข้าสู่ระบบ
    }
})

router.get('/manage', async (req,res)=>{
    if(req.session.login){
        try {
            const products = await Product.find().exec(); // Use await to handle asynchronous operation
            res.render('manage.ejs', { products }); // Send products to the template
        } catch (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Internal Server Error');
        }
    }else{
        res.render('admin.ejs')
    }

    //แสดงข้อมูล session 
    //console.log("รหัส session = ", req.sessionID)
    //console.log("ข้อมูลใน session = ", req.session)
    // try {
    //         const products = await Product.find().exec(); // Use await to handle asynchronous operation
    //         res.render('manage.ejs', { products }); // Send products to the template
    //     } catch (err) {
    //         console.error('Error fetching products:', err);
    //         res.status(500).send('Internal Server Error');
    //     }
})

router.get('/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id, { useFindAndModify: false }).exec();
        res.redirect('/manage');
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).send("Error deleting product");
    }
});



//get method จะมองเห็นข้อมูลที่ส่งผ่าน url ถ้าต้องการซ่อนข้อมูลต้องใช้แบบ post
router.post('/insert', upload.single("image"), (req,res)=>{ //upload.single("image") ใช่้ชื่อเดียวกับ name ใน html
    //console.log(req.file)
    let data = new Product({
        name:req.body.name,
        price:req.body.price,
        image:req.file.filename,
        description:req.body.description
    })
    const saveProduct = async (data) => {
        try {
            const product = new Product(data);
            await product.save(); // Use await instead of callback
            console.log('Product saved successfully');
        } catch (err) {
            console.error('Error saving product:', err);
        }
    };
    
    // Call the function
    saveProduct(data);
    res.redirect('/');
})

router.get('/logout', (req, res)=>{
    req.session.destroy((err)=>{
        res.redirect('/manage')
    })
})

router.get('/:id', async (req, res) => {
    try {
        const product_id = req.params.id;
        //console.log("Product ID: ", product_id);

        const product = await Product.findOne({ _id: product_id }).exec();
        
        if (!product) {
            return res.status(404).send("Product not found");
        }

        res.render('product.ejs', { product });
    } catch (err) {
        console.error("Error finding product:", err);
        res.status(500).send("Error finding product");
    }
});


router.post('/edit', async (req,res)=>{ 
    try{
        const edit_id = req.body.edit_id
        console.log(edit_id)

        const product = await Product.findOne({ _id: edit_id }).exec();
        
        if (!product) {
            return res.status(404).send("Product not found");
        }

        //console.log(product) แสดง document ข้อมูลของสินค้าเมื่อกดแก้ไข
        // นำข้อมูลเดิมที่ต้องการแก้ไขไปแสดงที่ form
        res.render('edit.ejs', { product });
    }
    catch (err) {
        console.error("Error finding product:", err);
        res.status(500).send("Error finding product");
    }
    
})

router.post('/update', async (req,res)=>{ 
    try{
        //ข้อมูลตัวใหม่ที่ทำการอัพเดต
        const update_id = req.body.update_id //มาจาก <input type="text" value="<%= product._id %>" name="update_id">
        let data = {
            name:req.body.name,
            price:req.body.price,
            description:req.body.description
        }
        //console.log("ข้อมูลใหม่ที่ถูกส่งมาจากแบบฟอร์ม", data)
        //console.log("รหัสอัพเดต", update_id)

        //อัพเดตข้อมูล
        const updated_product = await Product.findByIdAndUpdate(update_id, data, { new: true });

        if (!updated_product) {
            return res.status(404).send("Product don't update");
        }

        res.redirect('/manage')
        
    } catch (err) {
        console.error("Error finding product:", err);
        res.status(500).send("Error finding product");
        }
})

//for cookie
// router.post('/login',(req, res)=>{
//     //รับค่า username กับ password ที่ถูกใส่เข้ามาเก็บไว้ในตัวแปรเพื่อนำไปเช็ค
//     const username = req.body.username 
//     const password = req.body.password
//     const timeExpire = 30000 //เก็บข้อมูล cookie 30วิ

//     if(username == "admin" && password == "123"){
//         //สร้าง cookie
//         res.cookie('username', username, {maxAge:timeExpire})//res.cookie('ชื่อ', ค่าที่อยู่ด้านใน)
//         res.cookie('password', password, {maxAge:timeExpire})
//         res.cookie('login', true, {maxAge:timeExpire})//ถ้าเป็น true แสดงว่า admin เป็นคน login เป็น false แสดงว่าไม่มี cookie อยู่หรือออกจากระบบแล้ว
//         res.redirect('/manage')
//     } else {
//         res.render('404.ejs')
//     }
// })


//for session
router.post('/login',(req, res)=>{
    //รับค่า username กับ password ที่ถูกใส่เข้ามาเก็บไว้ในตัวแปรเพื่อนำไปเช็ค
    const username = req.body.username 
    const password = req.body.password
    const timeExpire = 100000 

    if(username == "admin" && password == "123"){
        //สร้าง session
        req.session.username = username
        req.session.password = password
        req.session.login = true
        req.session.cookie.maxAge = timeExpire
        res.redirect('/manage')
    } else {
        res.render('404.ejs')
    }
})
    



//const path = require('path')


//อ้างอิงตำแหน่งไฟล์ 
/*
const indexPage = path.join(__dirname,"../templates/index.html")// "../" คือ การถอยออกจาก folder routes เพื่อไปเรียกใช้ folder template เนื่องจาก folder template ไม่ได้อยู่ใน folder routes
const product1 = path.join(__dirname,"../templates/product1.html")
const product2 = path.join(__dirname,"../templates/product2.html")
const product3 = path.join(__dirname,"../templates/product3.html")

//ต้องเขียน app.use() ก่อน app.listen เพื่อตอบกลับบน browser เมื่อรัน server เป็นการใช้งาน path เริ่มต้นซึ่งจำกัดการใช้แค่ 1-2 paths 
//กรณีที่มีหลาย path จะเปลี่ยนไปใช้ get แทน
router.get("/",(req,res)=>{
    res.status(200)
    res.type('text/html')
    res.sendFile(indexPage)
})

router.get("/product/:id",(req,res)=>{ //มีการส่ง parameter id จาก /:id
    //res.sendFile(product1)
    const productID = req.params.id //เก็บค่าที่ส่งมาพร้อมกับ path product ก็คืิอ id .id คือชื่อ parameter 
    //const myhtml = `<h1>Product ${productID}</h1>`
    //res.send(myhtml)
    if(productID === "1"){
        res.sendFile(product1)
    }
    else if(productID === "2"){
        res.sendFile(product2)
    }
    else if(productID === "3"){
        res.sendFile(product3)
    }
    else{
        res.redirect('/') //กรณีผู้ใช้งานใส่ path ผิดจะทำการ redireact กลับมาที่หน้าแรก
    }
})*/

module.exports = router