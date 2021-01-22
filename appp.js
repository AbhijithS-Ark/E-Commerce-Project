

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
const { render } = require("ejs");

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
db.sequelize.sync(/*{ force:true }*/).then(()=>{
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

db.cart.belongsTo(db.user, {foreignKey: 'userid'});
db.user.hasMany(db.cart, {foreignKey: 'userid'});

db.user.hasMany(db.ship, {foreignKey: 'userid'});
db.ship.belongsTo(db.user, {foreignKey: 'userid'});


db.user.hasMany(db.product, { foreignKey: 'userid' }); // creating foreign key
db.product.belongsTo(db.user, { foreignKey: 'userid' });

db.product.hasOne(db.productimg, { foreignKey: 'productid',targetKey:'productid' }); // creating foreign key
db.productimg.belongsTo(db.product, { foreignKey: 'productid',targetKey:'productid' });


db.category.hasMany(db.product, { foreignKey: 'categoryid' }); // creating foreign key
db.product.belongsTo(db.category, { foreignKey: 'categoryid' });

db.ship.belongsTo(db.cart ,{foreignKey: 'cartid', targetKey: 'cartid'});
db.cart.hasOne(db.ship,{foreignKey: 'cartid', targetKey: 'cartid'});



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
        res.render("profile",{title:'Profile'});
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
            cartcount:`${0}`
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
       else if( req.files[0]==="undefined"||req.files[1] === "undefined"){
           req.flash("msg","PLEASE UPLOAD 2 IMAGES");
           return res.render("Sell",{msg:req.flash('msg'),title:'POST'});
         }
       else if(req.files[0]!="undefined"&&req.files[1] != "undefined"){
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
//finding all products of acategory
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

app.get("/AllWomens",(req,res)=>{
   console.log("triggered");
db.product.findAll({
   where: {categoryid:2},
   }) .then((product1)=>{
      let idarray1 = []
      product1.forEach(element => {
         idarray1.push(element.dataValues.productid)
      });
      console.log(idarray1);
      db.productimg.findAll({
      where :{productid:idarray1}
      }).then((img1)=>{
            console.log(img1);
            res.send({
               product1,
               img1
            })
         })
      
   }).catch((err)=>{
      console.log("some error occured here please find",err)
   })
});

app.get("/AllMobiles",(req,res)=>{
   console.log("triggered");
db.product.findAll({
   where: {categoryid:3},
   }) .then((product3)=>{
      let idarray3 = []
      product3.forEach(element => {
         idarray3.push(element.dataValues.productid)
      });
      console.log(idarray3);
      db.productimg.findAll({
      where :{productid:idarray3}
      }).then((img3)=>{
            console.log(img3);
            res.send({
               product3,
               img3
            })
         })
      
   }).catch((err)=>{
      console.log("some error occured here please find",err)
   })
});

app.get("/AllDesktop&Laptops",(req,res)=>{
   console.log("triggered");
db.product.findAll({
   where: {categoryid:4},
   }) .then((product4)=>{
      let idarray4 = []
      product4.forEach(element => {
         idarray4.push(element.dataValues.productid)
      });
      console.log(idarray4);
      db.productimg.findAll({
      where :{productid:idarray4}
      }).then((img4)=>{
            console.log(img4);
            res.send({
               product4,
               img4
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


//viewing of product 

app.post("/productview",(req,res)=>{
   console.log(req.body);
   let productid = req.body.productid;
   console.log(productid);
   db.product.findOne({
      where:{productid:productid}
   }).then((product)=>{
      let productinfo = product.dataValues;
      console.log(productinfo);
      let productID=productinfo.productid;
      let productname=productinfo.productname;
      let modelno=productinfo.Modelno;
      let brand=productinfo.brand;
      let title=productinfo.Title;
      let description=productinfo.Description;
      let condition=productinfo.Condition;
      let price=productinfo.price;
      let companyname=productinfo.Company_name;
      let Qty_add=productinfo.Qty_add;
       console.log(productID);
       console.log(productname);
       console.log(modelno);
       console.log(brand);
       console.log(title);
       console.log(description);
       console.log(condition);
       console.log(price);
       console.log(companyname);
       console.log(Qty_add);

      db.productimg.findOne({
      where:{productid:productid}
      }).then((images)=>{
         console.log(images);
         let image1 = images.productfilename1;
         let image2 = images.productfilename2;
         console.log(image1);
         console.log(image2);

      return   res.render('PRODUCTVIEW',{ title:'PRODUCT',image1,image2,productID,productname,modelno,brand,title,condition,price,description,companyname,Qty_add})
      }).catch((err)=>{
         console.log("some error occured here please find",err)
      })
   })
});


//cart addition of products by user.
app.post("/addtocart",(req,res)=>{
   console.log(req.body);
   console.log("triggered");
   let userid=req.session.userid;
   console.log(userid,"this id");
   let productuserid=req.body.userID;
   console.log(productuserid);
   let productname=req.body.productname;
   console.log(productname);
   let title=req.body.Title;
   console.log(title);
   let price=req.body.price;
   console.log(price);
   let filename=req.body.filename1;
   console.log(filename);
   let productid=req.body.productid;
   console.log(productid);
   db.cart.findOne({where: {userid:userid, Productid:productid}})
   .then((cart)=>{
            if(cart){
      return res.render("Loghome", { successmessages: '', errormessages: 'This product has been already added' , title:'Loghome' })  
            }
            else if(req.session.userid==productuserid){
               return res.render("Loghome", { successmessages: '', errormessages: 'You are trying to add products posted by You' , title:'Loghome' })
            }
            else if(db.product.findOne({
               where:{productid:productid},
               attributes:['Qty_add']
            })=='0'){
               return res.render("Loghome", { successmessages: '', errormessages: 'You are trying to add out of stock of stock product !' , title:'Loghome' })
            }
            else{
               db.cart.create({
                  productid:`${productid}`,
                  Productname:`${productname}`,
                  Title:`${title}`,
                  File:`${filename}`,
                  Price:`${price}`,
                  Qty_ordered:`${1}`,
                  userid:`${userid}`
               }).then(()=>{
               return res.render("cart", { title:'cart' })
               }).catch((err)=>{
                  console.log("some error occured here please find",err)
               })
            }       
   }).catch((err)=>{
      console.log("some error occured here please find",err)
   })
})


//listen to cart form/page  request
app.get('/cart',(req,res)=>{
   if(req.session.loggedin==true){
   res.render('cart',{title :'cart'});
   }
   else{
    return  res.redirect("/Login");
   }
});

app.get('/cartproducts',(req,res)=>{
   db.cart.findAll({
      where:{userid:req.session.userid}
   }).then((cart)=>{
       console.log(cart);
       res.send({cart});
   })
        
})

app.post('/cartdelete',(req,res)=>{
   console.log(req.body);
   let cartid=req.body.cartid;
   console.log(cartid);
   db.ship.destroy({
      where:{
         userid:req.session.userid,
         cartid:cartid
      }
   }).then(()=>{
      db.cart.destroy({
         where:{
            userid:req.session.userid,
            cartid:cartid
         }
      }).then(()=>{
         return  res.render('cart',{title :'cart'});
            }).catch((err)=>{
               console.log("some error occured here please find",err)
          })
   })
})

app.post('/cartquantity',(req,res)=>{
   console.log(req.body);
   let cartid = req.body.cartid;
   console.log(cartid);
   let qty=req.body.qty;
   console.log(qty);
   let productid=req.body.productid;
   console.log(productid);
   db.cart.update({Qty_ordered:qty},{
      where:{
         userid:req.session.userid,
         cartid:cartid
      }
   }) .then(()=>{
      db.cart.findAll({
where:{
   userid:req.session.userid
},
attributes:['Qty_ordered','price']
      }).then((cart)=>{
     console.log(cart);
     let quantity = []
     cart.forEach(element => {
        quantity.push(element.dataValues.Qty_ordered)
     });
     console.log(quantity);
     let price = []
     cart.forEach(element => {
      price.push(element.dataValues.price)
     });
     console.log(price);
     let totalprice = 0;
       for(let i=0;i<cart.length;i++){
          totalprice+=cart[i].dataValues.Qty_ordered*cart[i].dataValues.price;
       }
       console.log(totalprice);
       return  res.render('cart',{title :'cart'});
      }).catch((err)=>{
                  console.log("some error occured here please find",err)
             })        
   })
   }) 
 

   app.get('/carttotal',(req,res)=>{
      db.cart.findAll({
         where:{
            userid:req.session.userid
         },
         attributes:['Qty_ordered','price']
               }).then((cart)=>{
                  let totalprice = 0;
                  for(let i=0;i<cart.length;i++){
                     totalprice+=cart[i].dataValues.Qty_ordered*cart[i].dataValues.price;
                  }
                  console.log(totalprice);
                  res.send({totalprice});
               })
   })

app.get('/ship',(req,res)=>{
   if(req.session.loggedin===true){
      res.render('ship',{title:'shipment'})
   }
   else{
      return res.redirect('/Login');
   }
})
//checkout of products
app.post('/checkout',(req,res)=>{
    db.cart.findAll({
       where:{userid:req.session.userid}
    }).then((cart)=>{
      let cartID = []
      cart.forEach(element => {
         cartID.push(element.dataValues.cartid)
      });
      
      console.log(cartID);
      let productID = []
      cart.forEach(element => {
         productID.push(element.dataValues.productid)
      });
      console.log(productID);
      let Qty = []
      cart.forEach(element => {
         Qty.push(element.dataValues.Qty_ordered)
      });
      console.log(Qty);
      console.log(productID);
      console.log(cartID);
      let today=new Date();
      let date=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      console.log(date);
      let arrivaldate=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()+5);
      console.log(arrivaldate);
      for( let i=0;i<cartID.length;i++){
      db.ship.create({
         shipdate:`${date}`,
         arrivaldate:`${arrivaldate}`,
         userid:`${req.session.userid}`,
         cartid:`${cartID[i]}`
      })
   }
      db.product.findAll({
         where:{productid:productID},
            attributes:['Qty_add']
            }).then((product)=>{
               let Quantity = []
               product.forEach(element => {
                   Quantity.push(element.dataValues.Qty_add);
               });
               console.log(Quantity);
               let UpdatedQuantity = []
               for( let i=0;i<Quantity.length;i++){
                     UpdatedQuantity[i]=Quantity[i]-Qty[i];
               }
               console.log(UpdatedQuantity);
               for(let i=0;i<=UpdatedQuantity.length;i++){
               db.product.update({Qty_add:UpdatedQuantity[i]},{
                  where:{productid:productID[i],Qty_add:Quantity[i]}
    }) 
    }
   })  .then(()=>{
      return res.render('ship',{title:'shipment'})
         }).catch((err)=>{
             console.log("some error occured here please find",err)
         }) 
  
  })
})



app.get('/shipping',(req,res)=>{
  db.ship.findAll({
     where:{userid:req.session.userid}
  }).then((ship)=>{
   console.log(ship);
   db.cart.findAll({
      where:{userid:req.session.userid}
   }).then((cart)=>{
        console.log(cart);
        db.userprofile.findOne({
           where:{userid:req.session.userid}
        }).then((user)=>{
            console.log(user);
            res.send({
               ship,cart,user
            })
        }).catch((err)=>{
         console.log("some error occured here please find",err)
        })
})
  })
})
app.get('/userprofile',(req,res)=>{
   db.userprofile.findOne({
      where:{userid:req.session.userid}
   }).then((profile)=>{
      console.log(profile);
       db.product.findAll({
          where:{userid:req.session.userid}
       }).then((product)=>{
       console.log(product)
       res.send({profile,product});
      }).catch((err)=>{
         console.log("some error occured here please find",err)
        })
        
   })   
})

app.post('/updateprofile',(req,res)=>{
   console.log(req.body);
   let firstname=req.body.firstname;
   console.log(firstname);
   let lastname=req.body.lastname;
   console.log(lastname);
   let aptno=req.body.aptno;
   console.log(aptno);
   let street=req.body.street;
   console.log(street);
   let country=req.body.country;
   console.log(country);
   let city=req.body.city;
   console.log(city);
   let phone=req.body.phone;
   console.log(phone);
   let zip=req.body.zip;
   console.log(zip);
   let address=req.body.address;
   console.log(address);
db.userprofile.update({Firstname:`${firstname}`,Lastname:`${lastname}`,apt_no:`${aptno}`,street_address:`${street}`,address:`${address}`,City:`${city}`,Zip_code:`${zip}`,Country:`${country}`,Phone_no:`${phone}`},{
where:{userid:req.session.userid}                     
}).then(()=>{
return  res.render("profile",{title:'Profile'})
}).catch((err)=>{
   console.log("some error occured here please find",err)
  })

  })
//Aboutus 
  app.get('/Aboutus',(req,res)=>{
     if(req.session.loggedin==true){
      res.render('Aboutus',{title :'About Us'});
     }else{
  return res.redirect('/Login');
     }
});

async function updatecartcount() {


   const trigger_cartadd = await db.sequelize.query('CREATE TRIGGER cart_add AFTER INSERT ON carts' +
   ' FOR EACH ROW' +
   ' BEGIN' +
   '  UPDATE users SET cartcount = cartcount + 1 WHERE userid=userid;' +
   'END;')

   const trigger_cartdelete = await db.sequelize.query('CREATE TRIGGER cart_delete AFTER DELETE ON carts' +
   ' FOR EACH ROW' +
   ' BEGIN' +
   '  UPDATE users SET cartcount = cartcount - 1 WHERE userid=userid;' +
   'END;')
}
setTimeout(() => {
   console.log("--------------------------------------------------------------------------------------");
   updatecartcount();
}, 2000)


app.get('/cartcounts',(req,res)=>{
   db.user.findOne({
      where:{userid:req.session.userid},
      attributes:['cartcount']
   }).then((count)=>{
  console.log(count,"this is the cartcount");
      res.send({count});
   }).catch((err)=>{
    console.log("some error occured here please find",err)
}) 
})

//404 error occured 
app.get('*',(req,res)=>{
   res.render('404',{title :'About Us'});
});
