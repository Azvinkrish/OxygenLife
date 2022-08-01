require('dotenv').config();
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN)

module.exports={
    make:(phone_number)=>{
        return new Promise(async(resolve,reject)=>{
           await client.verify
            .services(process.env.TWILIO_SERVICE_ID)
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
           .services(process.env.TWILIO_SERVICE_ID)
           .verificationChecks.create({
               to:`+91${phone_number}`,
               code:otp,
           }).then((verification_check)=>{
               resolve(verification_check)
           })
        })
    }
}
