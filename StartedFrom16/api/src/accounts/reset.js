import { timeStamp } from 'console'
import crypto from 'crypto'
const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env

function createResetToken(email,expTimeStamp) {
    
    try {
        
        const authString = `${JWT_SIGNATURE}:${email}:${expTimeStamp}`
        return crypto.createHash("sha256").update(authString).digest("hex")
         
    } catch (e) {
        console.error(e)
    }
}

function validateExpTimestamp(expTimestamp) {
//one day in millisseconds
const expTime = 24 * 60 * 60 * 1000
// difference between now and expired time
const dateDiff = Number(expTimestamp) - Date.now()
//const dateDiff = Date.now() - Number(expTime)
console.log("dateDiff\: ",dateDiff)
// We're epired if not in apst OR difference in time is less than allowed
const isValid = dateDiff > 0 && dateDiff < expTime
return isValid
}

export async function createResetEmailLink(email) {


    try {
        //encode url string
        const URIencodedEmail =  encodeURIComponent(email)
        //create timeStamp
        const expTimeStamp = Date.now() + 24 * 60 * 60 * 1000
        //create token
        const token = createResetToken(email, expTimeStamp)

        return `https://${ROOT_DOMAIN}/reset/${URIencodedEmail}/${expTimeStamp}/${token}`
    } catch (e) {
        console.error(e)
    }
}

export async function  createResetLink(email)  {
    try {
        const { user } = await import("../user/user.js")
        //Check if user exist
        const foundUser = await user.findOne({
           'email.address': email 
        })
        if (foundUser) {
            const link = await createResetEmailLink(email) 
            return link
        }
        return""
        
    } catch (e) {
        console.log(e)
        return false
    }
}

export async function validateResetEmail(token, email, expTimestamp) {
    try {
        //Create a hash aka token
        const resetToken = createResetToken(email, expTimestamp)
        //Compare hash with token
        const isValid = resetToken === token  
        //time is not expired
        const isTimestampValid = validateExpTimestamp(expTimestamp) 
        console.log('isTimestampValid\: ', isTimestampValid)
        
       
        if (isValid && isTimestampValid) {

            //update user, to make them verify
            const { user } = await import("../user/user.js")
           
            return true
        }
        return false
    } catch (e) {
        console.log(e)
        return false
    }
}