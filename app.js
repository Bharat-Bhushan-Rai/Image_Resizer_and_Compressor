// requiring all the modules which are used in this project
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path= require("path");
const multer= require("multer");
const sharp =require("sharp");

// basic set up for the express and body-parser

const app=express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use("/uploads",express.static(path.join(__dirname+"/uploads")));

// using multer making storage for uploading the images
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload= multer({
    storage:storage,

}).single('image');

// handing route starts from here

app.get("/",function(req,res)
{
    res.render('index',{errormsg:""});
});

// route to handle post request for uploading image file
app.post("/",function(req,res)
{
    upload(req,res,function(err)
    {
        if(err)
        {
            res.render('index',{errormsg:"Error in Upload"});
        }
        else
        {
            if(req.file==undefined)
            {
                res.render('index',{errormsg:"Please upload a file to proceed"});
                
            }
            else
            {
                const name=req.file.filename;
                
                const imageurl=req.file.path;
                console.log(imageurl);
                res.render('cpress_resize',{imageurl:imageurl,filename:name});
            }
        }
    });
})

// route to handle post request to compress the image file
app.post("/compress/uploads/:filename",async function(req,res)
{

        const filename=req.params.filename;
        const ext=path.extname(filename);
        const quality= parseInt(req.body.quality);
        if(ext==".jpeg" || ext ==".jpg")
        {
            (async function(){
                try{
                    await sharp("uploads/"+filename)
                    .jpeg({quality:quality,chromaSubsampling:'4:4:4'})
                    .toFile("compress/"+filename);
                }catch (error) {
                    console.log(error);
                }
            })();
            res.send("test");
        }
   
})
// route to handle post request to resize image 
app.post("/resize/uploads/:filename",function(req,res)
{
    const filename=req.params.filename;
    const width=parseInt(req.body.width);
    const height=parseInt(req.body.height);
    (async function(){
        try{
            await sharp("uploads/"+filename)
            .resize(width,height)
            .toFile("resize/"+filename);
        }catch (error) {
            console.log(error);
        }
    })();
    res.send("test");

})

app.listen(3000,function()
{
    console.log("successfully running on port 3000");
});