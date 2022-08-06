var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb');

// const async = require('hbs/lib/async');
const Razorpay = require('razorpay');
const { resolveSrv } = require('dns');


require('dotenv').config();
var instance = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
});

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            const check = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (check) {
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
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.user = user
                        response.status = true

                        db.get().collection(collection.USER_COLLECTION).updateOne({ email: userData.email }, {
                            $set: {
                                logintime: Date()
                            }
                        })
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
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
            resolve(products)
        })

    },
    getProductdetails: (productid) => {
        return new Promise(async (resolve, reject) => {
            console.log(productid, 'product id');
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: ObjectId(productid) }).then((product) => {
                resolve(product)

            })
        })

    },
    addcart: (productid, userId) => {
        let proObj = {
            item: ObjectId(productid),
            quantity: 1

        }
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            console.log(userCart, true, true);
            if (userCart) {
                // let productExst = userCart.product.findIndex(product=>product.item === productid)
                let productExst = await db.get().collection(collection.CART_COLLECTION).findOne({ 'product.productId': ObjectId(productid) })
                console.log(productExst);
                if (productExst) {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ 'product.productId': ObjectId(productid) },
                        {
                            $inc: { 'product.$.quantity': 1 }

                        },
                    ).then((response) => {
                        resolve()
                    })
                } else {
                    let obj = { productId: ObjectId(productid), quantity: 1 }
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
                        {
                            $push: { product: obj }
                        }).then((response) => {
                            resolve()
                        })
                }
            } else {
                console.log(true, "helllo");
                let cartObj = {
                    user: ObjectId(userId),
                    product: [{ productId: ObjectId(productid), quantity: 1 }]
                }
                console.log(userId);
                console.log(true, "hahahahaha");
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {

                    resolve()

                })

            }
        })
    },
    getCartcount: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log("in cart count")
            let cartCount = 0

            user = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            // console.log(user.product.length);
            if (user) {

                cartCount = user.product.length


            }
            console.log(cartCount, 4444444);
            resolve(cartCount)
        })
    },
    getcart: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }

                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.productId',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }
            ]).toArray()

            console.log(cart, 666666666666666666666666666666);

            let response = cart

            resolve(response)
        })

    },
    productCartcount: (cartId, userId, proId, Count, quantity) => {
        return new Promise(async (resolve, reject) => {
            const count = parseInt(Count)
            console.log(count, 77788877777);
            if (count == -1 && quantity == 1) {
                await db.get().collection(collection.CART_COLLECTION).findOneAndUpdate({ _id: ObjectId(cartId) },
                    { $pull: { product: { productId: ObjectId(proId) } } })
                    .then((response) => {
                        resolve({ removeProduct: true })
                    })
            } else {

                await db.get().collection(collection.CART_COLLECTION).findOneAndUpdate
                    ({ _id: ObjectId(cartId), "product.productId": ObjectId(proId) },
                        {
                            $inc: { "product.$.quantity": count }
                        })
                    .then((response) => {

                        resolve(true)
                    })
            }



        })
    },
    removeCartitem: (cartData)=>{
        console.log(cartData,5555555533333);
        return new Promise((resolve,reject)=>{
            
        })
    },

    addwish: (productid, userId) => {
        {
            console.log('adwish in');
            console.log(productid);
            let proObj = {
                item: ObjectId(productid),
            }
            return new Promise(async (resolve, reject) => {
                let userWish = await db.get().collection(collection.WISH_COLLECTION).findOne({ user: ObjectId(userId) })
                console.log(userWish, 'kjhdsfkaj')
                if (userWish) {

                    let wishexst = await db.get().collection(collection.WISH_COLLECTION).findOne({ 'product.productId': ObjectId(productid) })
                    if (wishexst) {
                        console.log('exist')

                    } else {
                        console.log('not exist')
                        let obj = { productId: ObjectId(productid) }
                        db.get().collection(collection.WISH_COLLECTION).updateOne({ user: ObjectId(userId) },
                            {
                                $push: { product: obj }
                            }).then((response) => {
                                resolve()
                            })
                    }
                } else {
                    let wishObj = {
                        user: ObjectId(userId),
                        product: [{ productId: ObjectId(productid) }]
                    }
                    db.get().collection(collection.WISH_COLLECTION).insertOne(wishObj).then((response) => {
                        resolve()
                    })
                }
            })
        }
    },
    getwish: (userId) => {
        console.log('get wish in');
        console.log(userId);

        return new Promise(async (resolve, reject) => {
            console.log(1213);
            let wishList = await db.get().collection(collection.WISH_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.productId',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }
            ]).toArray()
            console.log(true);
            console.log(wishList);

            resolve(wishList)
        })
    },
    getTotal: (cart) => {
        console.log(122134);
        console.log(cart);

        return new Promise(async (resolve, reject) => {

            for (let i = 0; i < cart.length; i++) {
                cart[i].total = cart[i].quantity * cart[i].product[0].price
            }

            console.log(cart)

            resolve(cart)
        })

    },

    getSubtotal: (userId) => {


        return new Promise(async (resolve, reject) => {
            console.log('anas');
            let subTotal = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.productId',
                        quantity: '$product.quantity'
                    }

                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }
            ]).toArray()

            console.log(subTotal)


            let sub = subTotal[0].total

            if (sub != 0) {
                resolve(sub)
                console.log(1212121212121212)
            } else {

                reject()
            }

        })
    },

    getCartproducts: async (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            console.log(cart, 66666666666666666);
            console.log(cart.product, 777777777777777777);
            let cartlist = cart.product



            resolve(cart)
        })

    },
    placeOrder: async (orderData, userId, cart, subTotal) => {
        return await new Promise(async (resolve, reject) => {
            let status = orderData.modeofpayment === 'cod' ? 'confirmed' : 'pending'
            let orderObj = {
                user: ObjectId(userId),
                deliveryDetails: {
                    contact: orderData.phonenumber,
                    address: orderData.home,
                    pincode: orderData.pincode
                },
                modeofpayment: orderData.modeofpayment,
                products: cart,
                amount: subTotal,
                status: status

            }
            await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {



                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) })


                resolve(orderObj)

            })

        })
    },
    generateRazorpay: (orderId, total) => {
        return new Promise(async (resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: '' + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(order);
                    resolve(order)
                }
            });
        })
    },

    verifyPayment: (details) => {

        return new Promise(async (resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.Hmac('sha256', 'JDjjeE1e9aWTilDfvaszYMH6')

            await hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }

        })
    },
    paymentStatus: (orderId) => {
        return new Promise(async (resolve, reject) => {
            console.log(1233133);
            await db.get().collection(collection.ORDER_COLLECTION).
                updateOne({ _id: ObjectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }
                ).then(() => {

                    resolve()
                }).catch((err) => {
                    console.log(err);
                })

        })
    },
    getOrderlist: async (userId) => {
        console.log(userId);
        console.log(2222222222222222222);
        return await new Promise(async (resolve, reject) => {
            console.log(333333333333333);
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ user: ObjectId(userId) }).toArray()


            console.log(orders)
            resolve(orders)
        })
    },
    validateCoupon: (userCoupon, subTotal, Allcoupons) => {
        return new Promise(async (resolve, reject) => {



            let match = await db.get().collection(collection.COUPON_COLLECTION).findOne({ CoupoCode: (userCoupon) })
            console.log(match)
            let discount = 0
            let grandTotal
            let validation = ""
            if (match) {
                if (match.Limit >= 0) {
                    discount = match.discount
                    grandTotal = subTotal - discount

                    console.log(grandTotal);
                    console.log(discount);
                    validation = "coupon applied"
                    let response =
                    {
                        validation,
                        discount,
                        grandTotal
                    }
                    console.log(response)
                    resolve(response)
                } else {
                    let validation = "Offer exceeded"
                    reject({ validation })
                }
            } else {
                let validation = "Invalid Coupon"
                reject({ validation })
            }
        })
    },
    getAllcoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = db.get().collection(collection.COUPON_COLLECTION).find({}).toArray()

            resolve(coupons)

        })
    }, updateCouponlimit: (coupon) => {
        return new Promise(async (resolve, reject) => {

            let cc = await db.get().collection(collection.COUPON_COLLECTION).UpdateOne({ CoupoCode: coupon })
            // ,{
            //     $set:{
            //         $inc: { 'coupon.$.Limit': -1 }
            //     }
            //  })

            console.log(response);
            resolve(response)
        })
    }
}





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
    // removeFromcart: (data) => {
    //     return new Promise(async (resolve, reject) => {
    //         console.log(data);
    //         // const cart=data.cart
    //         console.log("999999999999999");
    //         db.get().collection(collection.CART_COLLECTION)
    //             .updateOne({ _id: ObjectId(data.cart) },

    //                 {
    //                     $pull: { product: { item: ObjectId(data.product) } }
    //                 }).then((response) => {
    //                     resolve({ removeProduct: true })
    //                 })
    //     })
    // },