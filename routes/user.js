
var express = require('express');
var router = express.Router();

const userHelpers=require('../helpers/user-helpers')
const otpHelper =require('../helpers/otpHelper');
const adminHelpers = require('../helpers/admin-helpers');
const { response } = require('express');
const async = require('hbs/lib/async');



/* User Login */
let userLogin = (req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/')
  }
}
  


/* GET home page. */
router.get('/',async (req, res, next)=> {
  let user=req.session.user
  if (user){
    let userId =req.session.user._id
    let cartCount= await userHelpers.getCartcount(userId)
    res.render('user/home',{user,cartCount})
  }else{
    res.render('user/home')
    req.session.loginErr=false
  }
});




router.get('/profile',userLogin, (req,res)=>{
  if (req.session.loggedIn){
    res.render('user/profile',{user:req.session.user})
  }else{
  res.render('user/log',{"loginErr":req.session.loginErr})
  req.session.loginErr=false
  }

});

router.get('/editProfile',userLogin, (req,res)=>{
  let user = req.session.user
  if (req.session.loggedIn){
    res.render('user/editProfile',{user})
  }else{
  res.render('user/log',{"loginErr":req.session.loginErr})
  req.session.loginErr=false
  }

});



//Signup data to server

router.post('/sign-up',(req,res)=>{
  const{email,phonenumber}=req.body
  req.session.number=phonenumber
  req.session.email=email
  req.session.whole=req.body
  otpHelper.make(phonenumber).then((verification)=>
  console.log(verification))
  res.render('user/verify',{whole:req.session.whole})
})

router.post('/verify', (req,res)=>{
  let{otp}=req.body
  otp=otp.join("")
  console.log(otp);
  const phone_number=req.session.number
  otpHelper.verifyOtp(otp,phone_number).then((verifcation_check)=>{
    if(verifcation_check.status=="approved"){
      console.log("approved");
      req.session.checkstatus=true

      userHelpers.doSignup(req.session.whole).then((response)=>{
        console.log(response );
        res.redirect('/login')
      }).catch(()=>{
        req.session.alreadyexist=true
        res.redirect('/signup')
      })
    }else{
      console.log('not approved');
      res.redirect('/signup')

    }
  })
})


router.get('/signup',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
  res.render('user/signup',{alreadyexist:req.session.alreadyexist})
  }
})
                                                 



router.get('/login', (req, res) => {
  if (
    req.session.loggedIn
  ) {
    res.redirect('/profile')
  } else {
    res.render('user/log', { loginErr: req.session.loginErr })
  }
})
  

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
     req.session.loggedIn=true
     req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalid username or password"
      res.redirect('/login')
    }
  })
})

router.get('/shop',(req,res)=>{
if(req.session.loggedIn){
let user = req.session.loggedIn

  userHelpers.getallProducts().then((products)=>{
    console.log(products);
  res.render('user/products',{products,user})
  })
}else{
  userHelpers.getallProducts().then((products)=>{
    console.log(products);
  res.render('user/products',{products})

})
}
})

router.get('/detailview',(req,res)=>{

  console.log('hala',req.query.id);
 userHelpers.getProductdetails(req.query.id).then((product)=>{
  console.log(product);

 res.render('user/product-details',{product})

 })

})


router.get('/addcart/:id',(req,res)=>{
  if(req.session.loggedIn){
    let user = req.session.loggedIn
    let product = userHelpers.addcart(req.params.id,req.session.user._id).then(()=> {
    res.json({status:true})
    })

  }else{
    res.redirect('/login')
  }
})
router.get('/decCart/:id',(req,res)=>{
  console.log(req.params.id,555555555555555555555555555);

  if(req.session.loggedIn){
    let user = req.session.user
    console.log(req.params.id,true)
    userHelpers.decCart(req.params.id,req,session.user._id).then(()=>{
      res.json({status:true})
    })

  }
})

router.get('/incCart/:id',(req,res)=>{
  console.log(req.params.id);

  if(req.session.loggedIn){
    let user = req.session.user
    console.log(req.params.id,true)
    userHelpers.incCart(req.params.id,req,session.user._id).then(()=>{
      res.json({status:true})
    })

  }
})

router.post('/remove-Product-forcart', (req, res, next) => {
 console.log(487932874973479);
  console.log(req.body);
  console.log(true,true,true,'ithenne');
  userHelpers.removeFromcart(req.body).then(() => {
    res.json(response)
  })
})


router.get('/cart',async(req,res)=>{  
  if(req.session.loggedIn){
    let user = req.session.user
    
    let {cartItems,grandTotal,cartCount} = await userHelpers.getcart(req.session.user._id)
     
    console.log(cartCount,111111111111111111111111111111)
    if (cartCount <= 0 ) {
      res.render('user/emptyCart',{user})

    }else{
    res.render('user/cart',{user,cartItems,grandTotal})
  }
    
  }else{
    res.redirect('/login')
  }
})

router.get('/wish',async(req,res)=>{
  console.log(true,true)
  if(req.session.loggedIn){
    let user = req.session.user
    let wishList = await userHelpers.getwish(req.session.user._id)
    console.log(wishList);
    res.render('user/wishlist',{user,wishList})
  }else{
    res.redirect('/login')
  }
})

router.get('/addwish/:id',(req,res)=>{
  console.log(' wish',req.params.id);

 
  if(req.session.loggedIn){
    let user = req.session.loggedIn
    console.log('gooing in add wish');
    
   userHelpers.addwish(req.params.id,req.session.user._id).then(()=> {
    res.json({status:true})
    })

  }else{
    res.redirect('/login')
  }
})

router.get('/editprofile',(req,res)=>{
  console.log('im in', true );
  let user = req.session.user
  console.log(user); 
   if(req.session.user){
    console.log(hahahah);
    res.render('user/editProfile',{user})
  }else{
    res.redirect('/')
  }
})




router.get('/placeorder',async(req,res)=>{
  console.log('im in', true );
  let user = req.session.user

   if(req.session.user){

    let {cartItems,grandTotal} = await userHelpers.getcart(req.session.user._id)
    
    console.log(cartItems)
    console.log(grandTotal)
  

    res.render('user/checkout',{user,grandTotal,cartItems})
  }else{
    res.redirect('/login')
  }
})

		
        router.post('/applyCoupon/',(req,res)=>{
          
          console.log(coupon_code)
          
        })

router.post('/confirmOrder',async(req,res)=>{
console.log(req.body,req.session.user._id);
console.log(true,99999999999999);
let user = req.session.user._id 
let total = await userHelpers.getTotal(user)
let cartProducts = await userHelpers.getCartproducts(req.session.user._id)

userHelpers.placeOrder(req.body,user,total,cartProducts).then((response)=>{
  console.log(response,5454545454598988989898);
  let orderId = response._id
  console.log(orderId);
  if(req.body['modeofpayment']=='cod'){
    res.json({status:true})
  }else{
    userHelpers.generateRazorpay(orderId,total).then((response)=>{
      res.json(response)

    })
  }
})



})

router.get('/successPage',(req,res)=>{
  console.log(999999999999);
  
    
    res.render('user/success',{user})
 
})

router.get('/orders',(req,res)=>{
  let user = req.session.user._id
  if(req.session.loggedIn){
    console.log(1111111111111111111)
    let orders = userHelpers.getOrderlist(user).then((orders)=>{
      
    res.render('user/orderSummary',{user})
  })
  }else{
    res.redirect('/login')
  }
})

router.get('/logout',(req,res)=>{
  console.log("kldfslk",true);
  res.redirect('/')
  req.session.destroy()
})

module.exports = router;






























