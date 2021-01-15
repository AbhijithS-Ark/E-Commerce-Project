

//setting up express 
const express = require("express");
const app = express();
const db = require("./models");
const PORT = process.env.PORT || 4000;
const session = require("express-session");
const flash = require("connect-flash");
let forcedrouting = false;
const multer = require('multer');
var bodyParser = require('body-parser')
const path = require('path');
const { randomInt } = require("crypto");
var now = new Date();
var timeID = Number(now);
//setting up the disk storage as memery storage might cause issues
const storage = multer.diskStorage({
   destination:'./public/uploads/',
   filename:(_req, file, cb) => {
      cb(null, file.fieldname + '-' +timeID+ Date.now() + '-'+path.extname(file.originalname));
   }
});

//Init upload for multer
const upload = multer({
   storage: storage,
   limits:{fileSize:1000000},
   fileFilter:function(req,file,cb){
      chechFileType(file,cb);
   }
}).array('images',3);

function chechFileType(file,cb){
   //Allowed extensions 
   const filetypes = /jpeg|jpg|png|gif/;
   //check extension
   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

   const mimetype = filetypes.test(file.mimetype);

   if(mimetype && extname){
      return cb(null,true);
   }else{
      cb('Error: Images Only!');
   }
}





app.use(bodyParser.urlencoded({ extended: true }));

//Express Error Handling
/*app.use(function (err, req, res) {
  if (err instanceof multer.MulterError) {
    res.statusCode = 400;
    res.send(err.code);
  } else if (err) {
    if (err.message === "FILE_MISSING") {
      res.statusCode = 400;
      res.send("FILE_MISSING");
    } else {
      res.statusCode = 500;
      res.send("GENERIC_ERROR");
    }
  }
});*/
//sequelize set up 
db.sequelize.sync({ force:true }).then(()=>{
   console.log(" database working");
   app.listen(PORT,()=>{
      console.log(`listening at : http://localhost:${PORT}`);
   });
   
})
.then(function(){
   db.category.bulkCreate([
      {
      categoryname:'Mens'
      },
      {
         categoryname:'Womens'
         },
         {
            categoryname:'Mobiles'
            },
            {
               categoryname:'Laptops&Desktops'
               }      
   ])
})

//defining the associations 


db.userprofile.belongsTo(db.user, {foreignKey: 'userid', targetKey: 'userid'});
db.user.hasOne(db.userprofile, {foreignKey: 'userid', targetKey: 'userid'});

db.cart.belongsTo(db.user, {foreignKey: 'userid', targetKey: 'userid'});
db.user.hasOne(db.cart, {foreignKey: 'userid', targetKey: 'userid'});

db.user.hasMany(db.ship, {foreignKey: 'userid'});
db.ship.belongsTo(db.user, {foreignKey: 'userid'});


db.user.hasMany(db.product, { foreignKey: 'userid' }); // creating foreign key
db.product.belongsTo(db.user, { foreignKey: 'userid' });

db.product.hasOne(db.productimg, { foreignKey: 'productid',targetKey:'productid' }); // creating foreign key
db.productimg.belongsTo(db.product, { foreignKey: 'productid',targetKey:'productid' });


db.category.hasMany(db.product, { foreignKey: 'categoryid' }); // creating foreign key
db.product.belongsTo(db.category, { foreignKey: 'categoryid' });


db.cart.hasMany(db.product, { foreignKey: 'cartid' }); // creating foreign key
db.product.belongsTo(db.cart, { foreignKey: 'cartid' });


//association from cart to ships table will be done later;

//category creation




//all routes setup 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine','ejs');
app.use(session({
   secret: 'SECRET KEY',
   resave: false,
   saveUninitialized:true
}));
app.use(flash());
app.use(express.static(__dirname + '/public'));

//basic routing
//default home page
app.get('/', (req,res) =>{

   if(req.session.loggedin === true){
    res.render('Loghome',{title :'Loghome',errormessages:'',successmessages:''});
   }
   else{
    res.render('home',{title :'Home'});
   }
});

//login form 

app.get('/Login', (req,res) =>{
   if(req.session.loggedin === true){
  return  res.redirect('/Loghome');
   }
else{
  return res.render('Login',{title :'Login',errormessages: "",successmessages:''});

}
});


//signup page
app.get('/Login',(req,res) =>{
   if (forcedrouting == true) {
      forcedrouting = false;
      req.flash('message', '*PLEASE LOGIN TO BUY/SELL YOUR PRODUCTS*')
      return res.render("Login", { errormessages: req.flash('message'), successmessages: '',title:'Login' })
  }
  if(req.session.loggedin == true){
      res.redirect("/Loghome");
  }

  return res.render("Login",{errormessages:"",successmessages:'', title:'Login'});
});






//home page when it is logged in 
app.get("/Loghome", (req, res) => {

   if (req.session.loggedin === true) {
       console.log(req.session.userid);
       return res.render("Loghome", { successmessages: 'Loginsuccesful', errormessages: '' , title:'Loghome' })
   } else {
       forcedrouting = true;
       res.redirect("/Login");
   }

});

//page where all products are shown is in home page itself have to see

//page to display user profile
app.get("/profile", (req, res) => {
   if (req.session.loggedin === true) {
       return res.render("profile")
   } else {
       forcedrouting = true;
       res.redirect("/Login");
   }
});

app.get("/logout", (req, res) => {
   if (req.session.loggedin === true) {
       req.session.loggedin = false;
       return res.redirect("/")
   } else {
       forcedrouting = true;
       res.redirect("/Login");
   }
});



//listen to All products request
app.get('/Allproducts', (req,res) =>{
   res.render('Allproducts',{title :'Allproducts'});
});


//listen to cart form/page  request
app.get('/cart',(req,res)=>{
   res.render('cart',{title :'cart'});
});

app.get('/Aboutus',(req,res)=>{
   res.render('Aboutus',{title :'About Us'});
});


//404 error occured 
app.get('/404',(req,res)=>{
   res.render('404',{title :'About Us'});
});





//login 
app.post('/signin', (req,res) =>{
   let data = req.body;
   let email = req.body.useremail;
  let  inputpassword = req.body.userpassword;
  console.log(data);

//get all user details by email
db.user.findOne({where:{emailId:email}})
     .then((user)=>{
        if(!user){
           req.flash('message','*NO EMAIL REGISTERED FOUND*')
           return res.render("Login",{errormessages:req.flash('message'),successmessages:'', title:'Login'})
        }else{
           console.log(user);
           let registereduser = user.dataValues;
           let userid = registereduser.userid;
           let password = registereduser.password;
           let email = registereduser.emailId;
       
           if (inputpassword !== password) {
            req.flash('message', '*INCORRECT PASSWORD*')
            return res.render("Login", { errormessages: req.flash('message'), successmessages: '' ,title:'Login'})
       
         }else{
            req.session.loggedin = true;
            req.session.userid = registereduser.userid;
            console.log(req.session.userid);
            res.redirect("/Loghome")
         }
     }
     })
});





//to get user to signup
app.post('/signup', (req,res) =>{
   console.log(req.body);
   let data=req.body;
   let email=req.body.email;
   let passwordfield = req.body.password;
   let confirmpasswordfield = req.body.confirmpassword;
   let Fname = req.body.Fname;
   let Lname = req.body.Lname;
   let aptno = req.body.aptno;
   let street= req.body.street;
   let address = req.body.address;
   let country = req.body.country;
   let City = req.body.state;
   let zipcode = req.body.zipcode;
   let phoneno= req.body.phone;

   var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
   if (reg.test(req.body.email) == false) {
      req.flash('message', '*PLEASE ENTER VALID EMAIL ADDRESS*')
    return res.render("Login", { errormessages: req.flash('message'), successmessages: '' ,title:'Login'})
   } else if(passwordfield.length < 8){
      req.flash('message', '*PASSWORD SHOULD BE GREATER THAN 8 CHARACTERS*')
      return res.render("Login", { errormessages: req.flash('message') , successmessages: '' ,title:'Login'})
   }  else if (passwordfield !== confirmpasswordfield) {
      req.flash('message', 'CONFIRM PASSWORD AND PASSWORD FIELD DO NOT MATCH')
      return res.render("Login", { errormessages: req.flash('message'),successmessages: '' ,title:'Login' })
   }
    db.user.findOne({where:{emailId:email}})
    .then((user) => {
       if(!user){
         console.log("no user like that is found");
         db.user.create({
            emailId: `${email}`,
            password: `${passwordfield}`,
        })
      .then((user) => {
             console.log('User created successfully');
             console.log(user);
             let registereduser=user.dataValues;
             let userid = registereduser.userid;
             console.log(userid);
             db.userprofile.create({
                Firstname:`${Fname}`,
                Lastname:`${Lname}`,
                apt_no:`${aptno}`,
                street_address:`${street}`,
                address:`${address}`,
                City:`${City}`,
                Zip_code:`${zipcode}`,
                Country:`${country}`,
                Phone_no:`${phoneno}`,
                userid:`${userid}`

             });

             console.log("userprofile created")
      })
      .then(()=>{
         console.log("user created successfully to db");
         req.flash('message', 'REGISTERED SUCCESFULLY. LOGIN NOW')
         return res.render("Login", { errormessages: '', successmessages: req.flash('message') ,title:'Login'})
      })
      .catch((err)=>{
         console.log("some error occured",err)
      });
      }else{req.flash("message","*EMAIL ID IS ALREADY REGISTERED*")
           return res.render("Login",{errormessages:req.flash('message'),successmessages:'',title:'Login'})
   }
    });
}); 

//listen to sell form/post request

app.get('/Sell',(req,res)=>{
   let userid=req.session.userid;
   if(req.session.loggedin===true){
      console.log("this is the user id",userid);
   res.render('Sell',{title :'Sell'});

   }else{
      return res.render("Login",{errormessages:'',successmessages:'', title:'Login'})
   }

});

app.post('/multipart-upload',(req,res)=>{
   if(req.session.loggedin==true){
       upload(req,res,(err)=>{
        if(err){
           req.flash("msg","ERROR OCCURED DURING FILE UPLOAD")
           return res.render("Sell",{msg:req.flash('msg'),title:'POST'});
        }
       else if( req.files[0]=="undefined"||req.files[1] == "undefined"){
           req.flash("msg","PLEASE UPLOAD 2 IMAGES");
           return res.render("Sell",{msg:req.flash('msg'),title:'POST'});
         }
       else if(req.files[0]&&req.files[1] !== "undefined"){
             console.log(req.files);
             let image1 = req.files[0];
             let image2 = req.files[1];
             let img1 = image1.filename;
             let img2 = image2.filename;
            console.log(img1);
            console.log(img2);
            let data= req.body;
            console.log(data);

            let productname= req.body.productname;
            let title= req.body.title;
            let Brand= req.body.Brand;
            let model= req.body.model;
            let company= req.body.company;
            let category= req.body.category;
            let condition= req.body.condition;
            let price= req.body.Price;
            let quantity= req.body.Quantity;
            let description= req.body.description;
            console.log(productname);
            console.log(title);
            console.log(Brand);
            console.log(model);
            console.log(company);
            console.log(category);
            console.log(condition);
            console.log(price);
            console.log(quantity);
            console.log(description);
            let categoryid;
            switch(category) {
              case "MENS":
               categoryid = "1";
               break;
              case "WOMENS":
               categoryid = "2";
               break;
             case "MOBILES":
                categoryid ="3";
                break;
             case "LAPTOP&DESKTOPS":
                 categoryid = "4";
                 break;
            }
            console.log(categoryid);
            db.product.create({
               productname:`${productname}`,
               Modelno:`${model}`,
               brand:`${Brand}`,
               Title:`${title}`,
               Description:`${description}`,
               Condition:`${condition}`,
               price:`${price}`,
               Company_name:`${company}`,
               Qty_add:`${quantity}`,
               categoryid:`${categoryid}`,
               userid:`${req.session.userid}`
               
            })
            .then((productid) => {
                  let product = productid.dataValues;
                     let imgid=product.productid;
                  console.log(product,"these values  are inserted");
                     console.log(imgid,"this is the value");
                  db.productimg.create({
                     productfilename1: `/uploads/${image1.filename}`,
                     productfilename2: `/uploads/${image2.filename}`,
                     productid:`${imgid}`
                  }) .then(()=>{
                     req.flash("msg","PRODUCT IS POSTED SUCCESSFULLY");
                     return res.render("Sell",{msg:req.flash('msg'),title:'POST',image1:`/uploads/${image1.filename}`,image2:`/uploads/${image2.filename}`});

                   
                  }) .catch((err)=>{
                     console.log("some error occured",err)
                  })
                    
               })
          
             }else if(req.body===undefined){
               req.flash("msg","PLease fill in the details of product");
               return res.render("Sell",{msg:req.flash('msg'),title:'POST'});
                
            }
            
         })
   }
   else{
      return res.redirect("/Login");
   }
   
})

app.get("/AllMens",(req,res)=>{
   console.log("triggered");
db.product.findAll({
   where: {categoryid:1},
   }) .then((product)=>{
      let idarray = []
      product.forEach(element => {
         idarray.push(element.dataValues.productid)
      });
      console.log(idarray);
      db.productimg.findAll({
      where :{productid:idarray}
      }).then((img)=>{
            console.log(img);
            res.send({
               product,
               img
            })
         })
      
   }).catch((err)=>{
      console.log("some error occured here please find",err)
   })
});

app.get('/product',(req,res)=>{
   if(req.session.loggedin==true){
      res.render('PRODUCTVIEW',{ title:'PRODUCT'})
   }
   else{
      return res.render("Login",{errormessages:'',successmessages:'', title:'Login'})
   }
})




app.post("/productview",(req,res)=>{
   console.log(req.body);
   let productid = req.body.productid;
   console.log(productid);
   db.product.findOne({
      where:{productid:productid}
   }).then((product)=>{
      let productinfo = product.dataValues;
      console.log(productinfo);
      db.productimg.findOne({
      where:{productid:productid}
      }).then((images)=>{
         console.log(images);
      return   res.render('PRODUCTVIEW',{ title:'PRODUCT',product:product,product:images})
      }).catch((err)=>{
         console.log("some error occured here please find",err)
      })
   })
})