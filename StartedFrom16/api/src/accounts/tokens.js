import jwt from 'jsonwebtoken'

const JWTSignature = process.env.JWT_SIGNATURE

export async function createTokens(sessionToken, userId) {
    try {
        //Create Refresh Token
            //Session ID
            const refreshToken = jwt.sign({
                sessionToken,
            }, JWTSignature)
            //Create Access Token
            // Session Id, User ID
            const accessToken = jwt.sign({
                sessionToken,
                userId
            }, JWTSignature)
        //Return Refresh Token & Access Token
      return{ accessToken, refreshToken}
    } catch (e) {
        console.log(e)
    }
}