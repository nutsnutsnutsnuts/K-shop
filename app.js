//Run web-server


//ใช้ node js 


/*
//ถ้าเปล่ียนแปลงอะไรใน html แล้วต้องมา save ในไฟล์นี้ซ้ำด้วย!!!
const http = require('http')
const fs = require('fs')//ใช้การอ่านไฟล์จาก module fs ในการแสดง index.html
const url = require('url')


const indexPage = fs.readFileSync(`${__dirname}/templates/index.html`, 'utf-8')//อ้างอิงโฟล์เดอร์หลักคือ NodejsBasic โดยใช้ __dirname
const productPage1 = fs.readFileSync(`${__dirname}/templates/product1.html`, 'utf-8')
const productPage2 = fs.readFileSync(`${__dirname}/templates/product2.html`, 'utf-8')
const productPage3 = fs.readFileSync(`${__dirname}/templates/product3.html`, 'utf-8')
//เขียนแบบเป็นใช้ function call back
//const server = http.createServer(function(req,res){
  //  res.write("Hello Nut Rattanamongkol eieieieieiiei")
   // res.end()
//})

//เขียนแบบใช้ arrow function 
const server = http.createServer((req,res)=>{

   //console.log(url.parse(req.url, true))//การแสดงรายละเอียด url ตาม req ที่ส่งมา
    const {pathname,query} = url.parse(req.url, true) // เป็นการดึงแค่สิ่งที่ต้องการมาใช้ ได้แก่ query และ pathname จากบรรทัดบน

    //routing ไปหน้าต่างๆ 

    //console.log("url = ", pathName)
    if(pathname == "/" || pathname == "/home"){
        res.end(indexPage) // response indexPange (หน้าแรก) เมื่อ ใช้ url / or /home
    }
    else if(pathname == "/product"){
        //console.log(query.id) แสดง query id 

        //ข้อมูลสินค้าชิ้นที่ 1
        if(query.id === "1"){
            res.end(productPage1)
        }
        else if(query.id === "2"){
            res.end(productPage2)
        }
        else if(query.id === "3"){
            res.end(productPage3)
        }
        else{
            res.writeHead(404)
            res.end("<h1>Not Found!</h1>")
        }
            
    }
    else{
        //แจ้งว่าหาข้อมูลไม่เจอโดยใช้ Http status
        res.writeHead(404)
        res.end("<h1>Not Found!</h1>")
    }

    //const myhtml = `
    //<h1>Hello wimmy</h1>
    //<p style="background:gray">good luck have fun!</p>
    //`

    //res.write("<h1>Hello Nut Rattanamongkol</h1>")
    //res.write(myhtml)
    //res.end()
})

server.listen(3000,'localhost',()=>{
    console.log("Start Sever at Port 3000!")
})*/


//ใช้ express js จัดการเรื่อง web server
const express = require('express')
//const router = require('./routes/myRouter')
const path = require('path')
const router = require('./routes/myRouter')
const cookieParser = require('cookie-parser')
const session = require('express-session')



const app = express() //จัดการเรื่องการสร้าง server, routing etc.
//app.use(router) //ให้ express เรียกใช้ router

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(express.urlencoded({extended:false}))// เป็นการระบุการส่งข้อมูลมาจาก form ในรูปแบบของ post method แล้วให้ url encode เพื่อให้ข้อมูลที่ส่งมามาใช้งาน ต้องระบุก่อนเรียกใช้งาน router
app.use(cookieParser())
app.use(session({secret:"mysession", resave:false, saveUninitialized:false}))
app.use(router)


app.set('views', path.join(__dirname, 'views'))// อ้างอิงถึงตำแหน่ง folder views ที่ทำหน้าที่เก็บ template 
app.set('view engine', 'ejs')//ระบุ engine ที่ใช้

app.use(express.static(path.join(__dirname, 'public'))) //เป็นการใช้ express เพื่อเรียกใช้ static file จาก folder public โดยต้องมี index.html!

app.listen(8080, ()=>{
    console.log("Start sever at port 8080!")
})


