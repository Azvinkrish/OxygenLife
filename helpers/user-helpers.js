var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb');
const { response } = require('express');
const async = require('hbs/lib/async');



module.exports={
    doSignup:(userData)=>{  
    return new Promise(async(resolve,reject)=>{
      const check=  await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
        if(check){
            reject()
        }else{
            userData.logintime=0
        userData.Password=await bcrypt.hash(userData.Password,10)
    db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
        resolve(data.insertedId)
    })
}
    })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log('login success');
                        response.user=user
                        response.status=true
                        
                    db.get().collection(collection.USER_COLLECTION).updateOne({email:userData.email},{
                            $set:{
                                logintime: Date()
                            }
                        })
                        resolve(response) 
                    }else{
                        console.log('login failed');
                        resolve({status:false})
                    }
                })
            }else{
                console.log('login failed'); 
                resolve({status:false}) 
            }
        })
    },
    getallProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
            resolve(products)
        })

    },
    getProductdetails:(productid) =>{
        return new Promise(async (resolve,reject)=> {
            console.log(productid,'product id');
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({_id:ObjectId(productid)}).then((product)=>{
                resolve(product)
            
            })
        })

    },
    addcart:(productid,userId)=> {
        let proObj = {
            item: ObjectId(productid),
            quantity : 1 

        }
             console.log(userId);
        return new Promise(async(resolve,reject) =>{
            let userCart =  await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            console.log(userCart,true,true);
            if (userCart){
                // let productExst = userCart.product.findIndex(product=>product.item === productid)
                let productExst = await db.get().collection(collection.CART_COLLECTION).findOne({'product.productId':ObjectId(productid)})
                console.log(productExst);
                if(productExst){
                    
                    db.get().collection(collection.CART_COLLECTION).updateOne({'product.productId':ObjectId(productid)},
                    {
                        $inc:{'product.$.quantity':1}
                        
                    },
                    ).then((response)=>{
                        resolve()
                    })
                }else{
                    let obj = {productId:ObjectId(productid),quantity:1}
                db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
                {
                    $push:{product:obj}
                }).then((response)=>{
                    resolve()
                })
                }
            }else{
                console.log(true,"helllo");
                let cartObj = {
                    user : ObjectId(userId),
                    product : [{productId: ObjectId(productid),quantity:1}]
                }
                console.log(userId);
                console.log(true,"hahahahaha");
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
               
               resolve()
               
                })

            } 
        })
    },
    getcart:(userId)=>{
        console.log(userId);
        return new Promise(async(resolve,reject)=>{
    let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
    {
        $match: {user:ObjectId(userId)}

     },
     {
        $unwind:'$product'
     },
     {
        $project:{
            item:'$product.productId',
            quantity:'$product.quantity'
        }
     },
     {
        $lookup:{
            from:collection.PRODUCTS_COLLECTION,
            localField:'item',
            foreignField:'_id',
            as:'product'
        }
     }
    ]).toArray()
    
    let cartItems = cart.map((x)=>{
return ({...x,price:Number(x.product[0].price),total:Number(x.product[0].price*x.quantity)})    })

let grandTotal = cartItems.reduce((x,current)=>{
    return x+current.total
},cartItems[0].total)
grandTotal = grandTotal - cartItems[0].total
let response = {
    cartItems,
    grandTotal
}
    resolve(response)
        })

    },
    addwish:(productid,userId)=>{{
        console.log('adwish in');
        console.log(productid);
        let proObj ={
            item: ObjectId(productid),
        }
        return new Promise(async(resolve,reject)=>{
            let userWish = await db.get().collection(collection.WISH_COLLECTION).findOne({user:ObjectId(userId)})
            console.log(userWish,'kjhdsfkaj')
            if (userWish){
                
                let wishexst = await db.get().collection(collection.WISH_COLLECTION).findOne({'product.productId':ObjectId(productid)})  
            if (wishexst){
                console.log('exist')

            }else{
                console.log('not exist')
            let obj = {productId:ObjectId(productid)}
                db.get().collection(collection.WISH_COLLECTION).updateOne({user:ObjectId(userId)},
                {
                    $push:{product:obj}
                }).then((response) =>{
                    resolve()
                })
            }
            }else{
                let wishObj = {
                    user : ObjectId(userId),
                    product:[{productId:ObjectId(productid)}]
                }
                db.get().collection(collection.WISH_COLLECTION).insertOne(wishObj).then((response)=>{
                    resolve()
                })
            }
        })}
    },
    getwish:(userId) =>{
        console.log('get wish in');
        console.log(userId);

        return new Promise(async(resolve,reject)=>{
           let wishList = await db.get().collection(collection.WISH_COLLECTION).aggregate([
            {
                $match: {user:ObjectId(userId)}
            },
            {
                $unwind:'$product'
            },
            {
                $project:{
                    item:'$product.productId',
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCTS_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            }
           ]).toArray()
           console.log(true);
           console.log(wishList);

           resolve(wishList)
        })
    },
    // decCart:(proId,userId)=>{
    //     console.log(proId,true,true);
    //     console.log(userId,"hahaah");

    //     return new Promise(async(resolve,reject) => {
    //         let usercart = db.get().collection(collection.CART_COLLECTION).findOne({'product.productId':ObjectId(productid)})
    //         console.log(usercart);
    //         if(usercart){
    //             let productExst = await db.get().collection(collection.CART_COLLECTION).findOne({'product.productId':ObjectId(productid)})
    //             console.log(productExst);
    //             if(productExst){
    //                 db.get().collection(collection.CART_COLLECTION).updateOne({'product.productId':ObjectId(productid)},
    //                 {
    //                     $inc:{'product.$.quantity':-1}
    //                 }).then((response) =>{
    //                     resolve()
    //                 })
    //             }

    //         }
    //     })
    // },
    // incCart:(proId,userId)=>{
    //     console.log(proId,true,true);
    //     console.log(userId,"hahaah");

    //     return new Promise(async(resolve,reject) => {
    //         let usercart = db.get().collection(collection.CART_COLLECTION).findOne({'product.productId':ObjectId(productid)})
    //         console.log(usercart);
    //         if(usercart){
    //             let productExst = await db.get().collection(collection.CART_COLLECTION).findOne({'product.productId':ObjectId(productid)})
    //             console.log(productExst);
    //             if(productExst){
    //                 db.get().collection(collection.CART_COLLECTION).updateOne({'product.productId':ObjectId(productid)},
    //                 {
    //                     $inc:{'product.$.quantity':-1}
    //                 }).then((response) =>{
    //                     resolve()
    //                 })
    //             }

    //         }
    //     })
    // },
    removeFromcart: (data) => {
        return new Promise(async (resolve, reject) => {
            console.log(data);
            // const cart=data.cart
            console.log("999999999999999");
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: ObjectId(data.cart) },

                    {
                        $pull: { product: { item: ObjectId(data.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
        })
    },
    


       
}