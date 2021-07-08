import jwt from "jsonwebtoken"
const JWTSignature = process.env.JWT_SIGNATURE
 
export async function logUserOut (request, reply) {
    try {
        const { session } = await import("../session/session.js")
        if (request?.cookies?.refreshToken) {
            //get the access and refresh token
            const { refreshToken } = request.cookies
            //Decode the refresh token
            const {sessionToken}  = jwt.verify(refreshToken, JWTSignature)  
             //Delete session database
            await session.deleteOne({sessionToken})
        }
        //Remove Cookie
        reply.clearCookie("refreshToken").clearCookie("accessToken")
    } catch (e) {
        console.error(e)
    }
}