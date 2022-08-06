var express = require('express');
// const async = require('hbs/lib/async');
// const adminHelpers = require('../helpers/admin-helpers');
var router = express.Router();
const adminHelper=require('../helpers/admin-helpers');
// const userHelpers = require('../helpers/user-helpers');
var objectId=require('mongodb').ObjectId

/* GET users listing. */

router.get('/',(req,res)=>{
  if(req.session.login){
  res.redirect('/admin/panel');
  }else{
    let loginerror=req.session.loginErr
  res.render('admin/admin-login',{loginerror})
  req.session.loginErr=false
  }
})


router.post('/panel',(req,res)=>{
  adminHelper.doadminLogin(req.body).then((response)=>{
    if(response.status){
    req.session.login=response.status
    req.session.admin=response.admin
    res.render('admin/admin-panel',{admin:true})
    }else{
      req.session.loginErr=true
      res.redirect('/admin')
    }
  })
})



router.get('/panel', function(req, res, next) {
  if(req.session.login){
    
      res.render('admin/admin-panel',{admin:true});
  }
  else{
    res.redirect('/admin')
  } 
});


router.post('/addcategory',(req,res)=>{
  if(req.session.login){
   console.log(req.body);
   console.log(true,true,true);
   res.redirect('/category')

  }else{
    res.redirect('/admin')
  }

})

router.get('/viewusers', function(req, res, next) {
  if(req.session.login){
    adminHelper.getAllUsers().then((users)=>{
      res.render('admin/view-users',{admin:true,users} );
    console.log(users);
    })
  }
  else{
    res.redirect('/admin')
  } 
});

router.get('/orders', (req, res, next) => {
  if(req.session.login){
    adminHelper.getAllUsers().then((users)=>{
      res.render('admin/view-orders',{admin:true} );
    console.log(users);
    })
  }
  else{
    res.redirect('/admin')
  } 
});

router.get('/addproduct', (req, res, next)=> {
  if(req.session.login){
   console.log("hiiiiiiiiii")
   adminHelper.getcategory().then((category)=>{

    console.log(category)
    console.log(8768767777777777777777777777777777777777777)

  res.render('admin/add-product',{admin:true,category} );
   })  
  }
  else{
    res.redirect('/admin')
  } 
});


router.get('/editproduct/:id',async function(req, res, next) {
  let product = await adminHelper.getProductdetails(req.params.id)
  console.log(req.params.id);
  if(req.session.login){
      res.render('admin/edit-product',{admin:true,product} );
  }
  else{
    res.redirect('/admin')
  } 
});


router.post('/editproduct/:id',(req,res)=>{
  console.log('post in');
  adminHelper.updateProduct(req.params.id,req.body).then(()=>{
    console.log('lets redirect');
    res.redirect('/admin/viewproducts')
    console.log('done');
  })
})

router.get('/viewproducts', (req, res, next)=> {
  if(req.session.login){
  adminHelper.getallProducts().then((products)=>{
      res.render('admin/view-products',{admin:true,products} );
  })
  }
  else{
    res.redirect('/admin')
  } 
});


router.post('/add-item',(req,res)=> {
  if(req.session.login){
    console.log('start');
    let id = new objectId()
        let image = req.files.image
            image.mv('./public/product-images/' + id +'.jpg')
            console.log('added image');
          
          req.body._id = id
    adminHelper.addProducts(req.body).then((products)=>{
      console.log('done');
      res.redirect('/admin/viewproducts')
    })
  }else{
    res.redirect('/admin')
  } 
})

router.get('/deleteproduct/:id',(req,res)=>{
  let product = req.params.id
  console.log(product)
 adminHelper.deleteproduct(req.params.id).then((response) =>{
res.redirect('/viewproducts')
 })
})



router.get('/category',(req,res)=>{
  console.log(true,true,true)
  if(req.session.login){
    adminHelper.getcategory().then((category)=>{
      console.log(category);
      console.log(4354577566345686673546)
      res.render('admin/category',{admin:true,category})
    })
  }else{
    res.redirect('/admin')
  }
});



router.get('/addcategory',(req,res)=>{
  if(req.session.login){
    res.render('admin/addNewcategory',{admin:true})

  }else{
    res.redirect('/admin')
  }
});



router.post('/addNewcategory',async(req,res)=> {
  if(req.session.login){
    console.log('start');
    console.log(req.body)

    await adminHelper.addCategory(req.body).then((category)=>{

      res.redirect('/admin/category')
      
    })
    
   
  }else{
    res.redirect('/admin')
  } 
})



router.get('/coupons',async (req,res)=>{

  console.log('hellooooooooooooooooo');
  if(req.session.login){
    console.log(99999999999999999999999999999999);

   await adminHelper.getCoupons().then((coupons)=>{

    console.log(coupons)
    console.log(9999999999999999999999999999999999999)
    console.log(true,true)

    res.render('admin/managecoupon',{admin:true,coupons})
    
   })
   

  }else{
    res.redirect('/admin')
  }
});

router.get('/addcoupon',(req,res)=>{
  if(req.session.login){
    res.render('admin/add-coupon',{admin:true})

  }else{
    res.redirect('/admin')
  }
});

router.post('/addCoupontoServer',(req,res)=> {
  if(req.session.login){
    console.log('start');
    console.log(req.body)
    
    adminHelper.addcoupons(req.body).then((coupons)=>{
  
      console.log('done');
      res.redirect('/admin/coupons')
    })
  }else{
    res.redirect('/admin')
  } 
})

router.get('/deletecoupon/:id'),(req,res)=>{
  console.log('iam in')
  console.log(true,true,true)
  console.log(req.params.id)



}


router.get('/bannerUpdate',(req,res)=>{
  if(req.session.login){
    res.render('admin/banner-update',{admin:true})
  }else{
    res.redirect('/admin')
  }
})

router.get('/logout',(req,res)=>{
  req.session.login=false
  res.redirect('/')
})



router.post('/unBlockUser/:id',async(req,res)=>{
userId = req.params.id
await adminHelper.unblockUser(userId).then((response)=>{
  res.json(response)
})
})



router.post('/blockUser/:id',async(req,res)=>{
  userId = req.params.id
  await adminHelper.blockUser(userId).then((response)=>{
    res.json(response)
  })
  })

module.exports = router;


