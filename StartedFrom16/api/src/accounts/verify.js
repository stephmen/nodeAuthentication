import crypto from 'crypto'
const { ROOT_DOMAIN, JWT_SIGNATURE } = process.env

export async function createVerifyEmailToken(email) {
    //Auth String, JWT Signature, email
    try {
        const authString = `${JWT_SIGNATURE}:${email}`
        
        return crypto.createHash("sha256").update(authString).digest("hex")
            return crypto.createHash("sha256").update(authString).digest("hex")

    } catch (e) {
        console.error(e)
    }
}

export async function createVerifyEmailLink(email) {

    try {
        const emailToken = await createVerifyEmailToken(email)
        const URIencodedEmail =  encodeURIComponent(email)
        console.log(URIencodedEmail, emailToken)
        return `https://${ROOT_DOMAIN}/verify/${URIencodedEmail}/${emailToken}`
    } catch (e) {
        console.error(e)
    }
}

export async function validateVerifyEmail(token, email) {
    try {
        //Create a hash aka token
        const emailToken = await createVerifyEmailToken(email)
        //Compare hash with token
        const isValid = emailToken === token
        // const isValid = true
        console.log("emailToken", emailToken)
        console.log("Token", token)
        console.log("IsValid", isValid)
        //If successful update user to make them veriyfy.
        if (isValid) {
            //update user, to make them verify
            const { user } = await import("../user/user.js")
            await user.updateOne({
               'email.address': email 
            }, 
            {
               $set: { "email.verified": true }, 
            }
            )

            // Return success
            return true
        }
        return false
    } catch (e) {
        console.log(e)
        return false
    }
}
export async function validateResetEmail(token, email, expTimestamp) {
    try {
        //Create a hash aka token
        const resetToken = await createResetToken(email, expTimestamp)
        //Compare hash with token
        const isValid = resetToken === token
       //Time is not expired
       const isTimestampvalid = validateExpTimestamp(expTimestamp)
        
        //If successful update user to make them veriyfy.
        if (isValid) {
            //update user, to make them verify
            const { user } = await import("../user/user.js")
            await user.updateOne({
               'email.address': email 
            }, 
            {
               $set: { "email.verified": true }, 
            }
            )

            // Return success
            return true
        }
        return false
    } catch (e) {
        console.log(e)
        return false
    }
}
