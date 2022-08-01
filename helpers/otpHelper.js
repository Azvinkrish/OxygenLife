
const client = require('twilio')(config.accountSID,config.authToken)

module.exports={
    make:(phone_number)=>{
        return new Promise(async(resolve,reject)=>{
           await client.verify
            .services(config.serviceId)
            .verifications.create({
                to:`+91${phone_number}`,
                channel:'sms'
            }).then((verifications) =>{
                console.log(verifications.status)
                resolve(verifications)
            })  
        }) 
    }, 

    verifyOtp:(otp,phone_number)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(phone_number);
           await client.verify
           .services(config.serviceId)
           .verificationChecks.create({
               to:`+91${phone_number}`,
               code:otp,
           }).then((verification_check)=>{
               resolve(verification_check)
           })
        })
    }
}
