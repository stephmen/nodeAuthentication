import mongo from "mongodb"
import jwt from "jsonwebtoken"
import { createTokens } from "./tokens.js"
import bcrypt from "bcryptjs"

const { genSalt, hash } = bcrypt


const { ObjectId } = mongo

const JWTSignature = process.env.JWT_SIGNATURE
const { ROOT_DOMAIN } = process.env
export async function getUserFromCookies(request, reply) {
try {
    const { user } = await import("../user/user.js")
    const { session } = await import("../session/session.js")
    //check to make sure access token exist
    if (request?.cookies?.accessToken) {
        // if access token
        const {accessToken} = request.cookies
        //Decode access token
        const decodedAccessToken  = jwt.verify(accessToken, JWTSignature)
        
        //Return user from record
        return user.findOne({
            _id: ObjectId(decodedAccessToken?.userId),
        }) 
    }
    if (request?.cookies?.refreshToken) {
        //get the access and refresh token
        const { refreshToken } = request.cookies
        //Decode the refresh token
        const {sessionToken}  = jwt.verify(refreshToken, JWTSignature)  
        //Lookup session
        const currentSession = await session.findOne({sessionToken})
        console.log("SessionToken:", currentSession)
        //confirm session is valid
        if (currentSession.valid) {
            //if session is valid, 
            //Look up current user
            const currentUser = await user.findOne({
                _id: ObjectId(currentSession.userId)
            })
            console.log('currentUser', currentUser)
            //refresh tokens
            await refreshTokens(sessionToken, currentUser._id, reply)
            //Return Current User
            return currentUser
        }
    }
} catch (e) {
    console.error(e)
    
}
}
export async function refreshTokens(sessionToken, userId, reply) {
    try {
        const { accessToken, refreshToken} = await createTokens(
            sessionToken, 
            userId)
        const now =  new Date()
        //Get date, 30 days and the future
        const refreshExpires = now.setDate(now.getDate() + 30)
        reply
          .setCookie("refreshToken", refreshToken, {
            path: "/",
            domain: ROOT_DOMAIN,
            httpOnly: true,
            secure: true,
            expires: refreshExpires,
          })
          .setCookie("accessToken", accessToken, {
            path: "/",
            domain: ROOT_DOMAIN,
            httpOnly: true,
            secure: true,
          })
        
    } catch (e) {
        console.error(e)
    }
}

export async function changePassword (userId, newPassword) {
    try {
        const { user } = await import("../user/user.js")
          // generate salt
        const salt = await genSalt(10)

        const hashedPassword = await hash(newPassword, salt)
        //update user
        return user.updateOne(
            {
            _id: userId,
            },
              {  $set: {
                    password: hashedPassword,
                }
              }
        )
    } catch (e) {
        console.log("Error changePW:",e)
    }
}