import { createSession } from "./sessions.js"
// import { createTokens } from "./tokens.js"
import { refreshTokens } from "./user.js"


export async function logUserIn(userId, request, reply) {
    const connectionInformation = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
    }
    //create Session
    const sessionToken = await createSession(userId, connectionInformation)
    console.log('session', sessionToken)
    
    await refreshTokens(sessionToken, userId, reply)

    // //create JWT
    // const { accessToken, refreshToken} = await createTokens(sessionToken, userId)
    // //setCookie
    // const now =  new Date()
    // //Get date, 30 days and the future
    // const refreshExpires = now.setDate(now.getDate() + 30)
    // reply
    //       .setCookie("refreshToken", refreshToken, {
    //         path: "/",
    //         domain: "localhost",
    //         httpOnly: true,
    //         expires: refreshExpires,
    //       })
    //       .setCookie("accessToken", accessToken, {
    //         path: "/",
    //         domain: "localhost",
    //         httpOnly: true,
    //       })
          


}