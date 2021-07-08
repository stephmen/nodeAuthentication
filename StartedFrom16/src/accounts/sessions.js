import { randomBytes } from "crypto";

export async function createSession(userId, connection) {
    try {
        
    
    //genereate a session token
    const sessionToken=randomBytes(43).toString("hex")
    //retrieve connection information
    const  { ip, userAgent } = connection
    //database insert for session
    const { session } = await import("../session/session.js")
    await session.insertOne({
        sessionToken,
        userId,
        valid: true,
        userAgent,
        ip,
        updatedAt: new Date(),
        createdAt: new Date()

    })
    //Return session token
    return sessionToken
} catch (error) {
    throw new Error('Session Creation Failed')   
}

}