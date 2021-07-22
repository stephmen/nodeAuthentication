import jwt from "jsonwebtoken"
const {JWT_SIGNATURE, ROOT_DOMAIN } = process.env
 
export async function logUserOut (request, reply) {
    try {
        const { session } = await import("../session/session.js")
        if (request?.cookies?.refreshToken) {
            //get the access and refresh token
            const { refreshToken } = request.cookies
            //Decode the refresh token
            const { sessionToken }  = jwt.verify(refreshToken, JWT_SIGNATURE)  
             //Delete session database
            await session.deleteOne({sessionToken})
        }
        //Remove Cookie
        reply.clearCookie("refreshToken", {
            path: "/",
            domain: ROOT_DOMAIN,
            httpOnly: true,
            secure: true,
        }).clearCookie("accessToken", {
            path: "/",
            domain: ROOT_DOMAIN,
            httpOnly: true,
            secure: true,
        })
    } catch (e) {
        console.error(e)
    }
}