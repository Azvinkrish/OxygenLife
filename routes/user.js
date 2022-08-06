
var express = require('express');
var router = express.Router();

const userHelpers = require('../helpers/user-helpers')
const otpHelper = require('../helpers/otpHelper');
const { response } = require('express');



/* User Login */
let userLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/')
  }
}




//Signup data to server

router.post('/sign-up', (req, res) => {
  const { email, phonenumber } = req.body
  req.session.number = phonenumber
  req.session.email = email
  req.session.whole = req.body
  otpHelper.make(phonenumber).then((verification) =>
    console.log(verification))
  res.render('user/verify', { whole: req.session.whole })
})



//OTP AUTHeNTICATION
router.post('/verify', (req, res) => {
  let { otp } = req.body
  otp = otp.join("")
  console.log(otp);
  const phone_number = req.session.number
  otpHelper.verifyOtp(otp, phone_number).then((verifcation_check) => {
    if (verifcation_check.status == "approved") {
      console.log("approved");
      req.session.checkstatus = true

      userHelpers.doSignup(req.session.whole).then((response) => {
        console.log(response);
        res.redirect('/login')
      }).catch(() => {
        req.session.alreadyexist = true
        res.redirect('/signup')
      })
    } else {
      console.log('not approved');
      res.redirect('/signup')

    }
  })
})


router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/signup', { alreadyexist: req.session.alreadyexist })
  }
})




router.get('/login', async (req, res) => {

  if (req.session.loggedIn) {
    let userId = req.session.user._id
    let cartCount = await userHelpers.getCartcount(userId)
    let cart = await userHelpers.getCartproducts(userId)
    res.redirect('/profile', { cartCount,cart})
  } else {
    res.render('user/log', { loginErr: req.session.loginErr })
  }
})


router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginErr = "Invalid username or password"
      res.redirect('/login')
    }
  })
})


/* GET home page. */
router.get('/', async (req, res, next) => {
  let user = req.session.user
  let products = await userHelpers.getallProducts()
  console.log(products);
  if (user) {
    let userId = req.session.user._id
    let cartCount = await userHelpers.getCartcount(userId)
    let cart = await userHelpers.getcart(userId)
    console.log(cart)
    console.log(true,true)
    // let { subTotal, cartItems } = await userHelpers.getTotal(cart)
    res.render('user/home', { user, cartCount, products, cart})
  } else {
    res.render('user/home',{products})
    req.session.loginErr = false
  }
});





router.get('/shop', async (req, res) => {
  let user = req.session.user
  let products = await userHelpers.getallProducts()

  if (req.session.loggedIn) {
    let userId = req.session.user._id
    let cartCount = await userHelpers.getCartcount(userId)
    if(cartCount>0){
      let cart = await userHelpers.getcart(userId)
      res.render('user/products', { products, user, cartCount,cart })
    }else{
      res.render('user/products', { products, cartCount})

    }
  } else {
      res.render('user/products', { products}) 
  }
})


router.get('/detailview', async (req, res) => {
    if (req.session.loggedIn) {
      let user = req.session.loggedIn
      let userId = req.session.user._id
      let cartCount = await userHelpers.getCartcount(userId)
      if(cartCount>0){
        let cart = await userHelpers.getcart(userId)
        userHelpers.getProductdetails(req.query.id).then((product) => {
        res.render('user/product-details', { product, cartCount, user,cart })
        })
      } else {
        userHelpers.getProductdetails(req.query.id).then((product) => {
        res.render('user/product-details', { product, cartCount })
        })
      }
    }else{
    userHelpers.getProductdetails(req.query.id).then((product) => {
    res.render('user/product-details', { product})
  })
}
})

router.get('/cart', async (req, res) => {
  if (req.session.loggedIn) {
    let user = req.session.user
    let userId = req.session.user._id
    let cartCount = await userHelpers.getCartcount(userId)
    if (cartCount<=0) {
      res.render('user/emptyCart', { user })
    } else {
      let cart = await userHelpers.getcart(userId)
      console.log(cart);
      console.log(true,true,true,33333333333)
      console.log(cart.product);
      let total = userHelpers.getTotal(cart)
      console.log(total,2222222222)
      let subTotal = await userHelpers.getSubtotal(userId)
      console.log(subTotal);

      res.render('user/cart', { user, cart, cartCount,subTotal,total })


    }

  } else {
    res.redirect('/login')
  }
})


router.get('/placeorder', async (req, res) => {
  console.log('im in', true);
  
  if (req.session.user) {
    let user = req.session.user
  let userId = req.session.user._id
  let cartCount = await userHelpers.getCartcount(userId)
    if (cartCount = 0) {
      alert("cart is empty Add Products to cart")
      res.redirect('/shop', { user })
    } else {
      let cartCount = await userHelpers.getCartcount(userId)
      let cart = await userHelpers.getcart(userId)
      console.log(cart);
      console.log(true,true,true,33333333333)
      console.log(cart.product);
      let total = userHelpers.getTotal(cart)
      console.log(total,2222222222)
      let subTotal = await userHelpers.getSubtotal(userId)
      console.log(subTotal);

      res.render('user/checkout', { user, cart, cartCount, subTotal })
    }

  } else {
    res.redirect('/')
  }
})

router.post('/confirmOrder', async (req, res) => {
  if(req.session.loggedIn){
  console.log(req.body, req.session.user._id);
  console.log(true, 99999999999999);
  let userId = req.session.user._id
  let cart = await userHelpers.getcart(userId)
  let total = userHelpers.getTotal(cart)
  console.log(total,2222222222)
  let subTotal = await userHelpers.getSubtotal(userId)
  userHelpers.placeOrder(req.body, userId, total, subTotal).then((response) => {
    console.log(response, 545);
    let orderId = response._id
    console.log(orderId);
  
    if (req.body.modeofpayment == 'cod') {
      console.log("hai its cod");
      res.json({ cod: true })
    } else {
      console.log("hai its online payement");
      userHelpers.generateRazorpay(orderId, subTotal).then((response) => {
        res.json(response)
      })
    }
  })
}else{
  res.redirect('/login')
}
})

router.post('/quantinc', async (req, res) => {
  console.log(req.body)
  let cartId = req.body.cart
  let proId = req.body.proId
  let count = req.body.count
  let quantity = req.body.quantity
  let userId = req.session.user._id
 
    await userHelpers.productCartcount(cartId, userId, proId, count, quantity)
  .then(async(response)=>{
    let cartCount = await userHelpers.getCartcount(userId)
    if (cartCount<=0) {
      res.render('user/emptyCart', { user })
    }else{
    let cart = await userHelpers.getcart(userId)
    let subTotal =  await userHelpers.getSubtotal(userId)
    console.log(subTotal);
    res.json({ status: true ,subTotal,cart});
    }
  })
})


router.post('/applyCoupon/', async(req, res) => {
  if (req.session.user) {
  let userId = req.session.user._id

  let subTotal =  await userHelpers.getSubtotal(userId)
  let Allcoupons = await userHelpers.getAllcoupons()

  await userHelpers.validateCoupon(req.body.coupon,subTotal,Allcoupons).then((response)=>{

    res.json({response})
  }).catch((err)=>{
    console.log(err)
    res.json({err})
  })
  }else{
    res.redirect('/login')
  }
})


router.post('/removeProcart',(req,res)=>{
  console.log(req.body, 66786786);

  // if (req.session.loggedIn){
  //   userHelpers.removeCartitem(req.body).then((response)=>{
  //     resolve(response)
  //   })

  // }

})



router.get('/addcart/:id', async(req, res) => {
  if (req.session.loggedIn) {
    let user = req.session.loggedIn
    let product = await userHelpers.addcart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })
    })

  } else {
    res.redirect('/login')
  }
})



router.get('/wish', async (req, res) => {
  console.log(true, true)
  if (req.session.loggedIn) {
    let user = req.session.user
    let userId = req.session.user._id
    let cartCount = await userHelpers.getCartcount(userId)
    let wishList = await userHelpers.getwish(userId, cartCount)
    console.log(wishList);
    res.render('user/wishlist', { user, wishList })
  } else {
    res.redirect('/login')
  }
})

router.get('/addwish/:id', (req, res) => {
  console.log(' wish', req.params.id);


  if (req.session.loggedIn) {
    let user = req.session.loggedIn
    console.log('gooing in add wish');

    userHelpers.addwish(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })
    })

  } else {
    res.redirect('/login')
  }
})

router.get('/editprofile', async (req, res) => {
  console.log('im in', true);
  let user = req.session.user
  console.log(user);
  if (req.session.user) {
    let userId = req.session.user._id
    let cartCount = await userHelpers.getCartcount(userId)
    res.render('user/editProfile', { user, cartCount })
  } else {
    res.redirect('/')
  }
})



router.get('/profile', userLogin, async (req, res) => {
  let userId = req.session.user._id
  let user = req.session.user
  let cartCount = await userHelpers.getCartcount(userId)
  if (req.session.loggedIn) {
    let cart = await userHelpers.getcart(userId)
    res.render('user/profile', { user, cartCount, cart})
    
  } else {
    res.render('user/log', { "loginErr": req.session.loginErr })
    req.session.loginErr = false
  }

});

// router.get('/editProfile', userLogin, async (req, res) => {
//   let user = req.session.user
//   let userId = req.session.user._id
//   let cartCount = await userHelpers.getCartcount(userId)
//   if (req.session.loggedIn) {
//     res.render('user/editProfile', { user, cartCount })
//   } else {
//     res.render('user/log', { "loginErr": req.session.loginErr })
//     req.session.loginErr = false
//   }

// });









router.get('/successPage', (req, res) => {
  console.log(999999999999);


  res.render('user/success', { user })

})

router.post('/verify-payment', (req, res) => {
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.paymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })

  }).catch((er) => {
    res.json({ status: false, errMsg: '' })
  })

})

router.get('/orders', async (req, res) => {
  let user = req.session.user._id
  if (req.session.loggedIn) {
    console.log(1111111111111111111)
    let userId = req.session.user._id
    let cartCount = await userHelpers.getCartcount(userId)
    let orders = userHelpers.getOrderlist(user).then((orders) => {

      res.render('user/orderSummary', { user, cartCount })
    })
  } else {
    res.redirect('/login')
  }
})

router.get('/logout', (req, res) => {
  console.log("kldfslk", true);
  res.redirect('/')
  req.session.destroy()
})

module.exports = router;






























