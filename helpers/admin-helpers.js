var db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
// const async = require('hbs/lib/async');



module.exports = {

    addUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            const checkuser = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (checkuser) {
                reject()
            } else {
                userData.logintime = 0
                userData.Password = await bcrypt.hash(userData.Password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data.insertedId)
                })

            }
        })
    },

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    addProducts: (productData) => {
        return new Promise(async (resolve, reject) => {
                productData.quantity = parseInt(productData.quantity)
                productData.price = parseInt(productData.price)
          
                db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(productData).then((response) => {
                    resolve(response)
                   
                    console.log(response);
                })

            }
        )
    },
    updateProduct:(productid,productUpdate)=>{
        console.log('update in');
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({_id:ObjectId(productid)},{
                $set:{
                    title:productUpdate.title,
                    description:productUpdate.description,
                    price:productUpdate.price,
                    category:productUpdate.category,
                    quantity:productUpdate.quantity
                }
            }).then(()=>{
                resolve()
            })
            console.log('update done');
        })
    },
    doadminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let admi = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })
            console.log(admi);
            if (admi) {
                bcrypt.compare(adminData.password, admi.password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.admin = admi
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        })
    },
    getallProducts: () => {
        return new Promise(async (resolve, reject) => {
            const products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
            resolve(products)
        })

    },
    getProductdetails:(productid) =>{
        return new Promise(async (resolve,reject)=> {
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({_id:ObjectId(productid)}).then((product)=>{
                resolve(product)
            })
        })

    },
deleteproduct:(productid) =>{
    new Promise((resolve,reject) =>{
        db.get().collection(collection.PRODUCTS_COLLECTION).deleteOne({_id:ObjectId(productid)}).then((response)=>{
            resolve(response)
        })
        })
},
addcoupons:(couponData) => {
    return new Promise(async (resolve, reject) => {
          
      await  db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData).then((response) => {
            resolve(response)
           
            console.log(response);
        })

    })
},
getCoupons: () => {

    console.log('im in to get coupons');
    return new Promise(async (resolve, reject) => {
        const couponslist = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
        console.log(couponslist)
        console.log(084387598794038720982648387349284560298472879238609)
        resolve(couponslist)
    })

},addCategory:(categ)=>{

    console.log('im in add category')
    console.log(categ);
    return new Promise(async (resolve, reject) => {
          
        await  db.get().collection(collection.CATEGORY_COLLECTION).insertOne(categ).then((response) => {
             
            console.log(response);
            resolve(response)
             
             
          })
  
      })

},
getcategory: () => {

    console.log('im in to get coupons');
    return new Promise(async (resolve, reject) => {
        const categoryList = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
        console.log(categoryList)
       
        resolve(categoryList)
    })

},
unblockUser:(userId)=>{
  
    return new Promise (async(resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
        {
            $set:{
                isBlocked:true
            }
        })
      
        resolve()
    })
},
blockUser:(userId)=>{
  
    return new Promise (async(resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},
        {
            $set:{
                isBlocked:false
            }
        })
      
        resolve()
    })


}
}



