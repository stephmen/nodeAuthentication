import "./env.js"
import { fastify } from "fastify"
import fastifyStatic from "fastify-static"
import fastifyCookie from "fastify-cookie"
import fastifyCors from "fastify-cors"
import path from "path"
import { fileURLToPath } from "url"
import { connectDb } from "./db.js"
import { registerUser } from "./accounts/register.js"
import { authorizeUser } from "./accounts/authorize.js"
import { logUserIn } from "./accounts/logUserIn.js"
import { logUserOut } from "./accounts/logUserOut.js"
import { getUserFromCookies, changePassword } from "./accounts/user.js"
import { sendEmail, mailInit } from "./mail/index.js"
import { createVerifyEmailLink, validateVerifyEmail } from "./accounts/verify.js"
import { createResetLink, validateResetEmail } from "./accounts/reset.js"
import { request } from "http"






// ESM specific features
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = fastify()

async function startApp() {
  try {
    await mailInit()
    
    app.register(fastifyCors, {
      origin: [
        /\.nodeauth.dev/, "https://nodeauth.dev", "localhost"],
        credentials: true,
    })

    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SIGNATURE,
    })

    app.register(fastifyStatic, {
      root: path.join(__dirname, "public"),
    })

    app.get("/api/user", {}, async (request, reply) => {
      const user = await getUserFromCookies(request, reply)
      if (user) return reply.send({ data: { user } })
      reply.send({})
    })

    app.post("/api/2fa-register", {}, async (request,reply) => {
      const user = await getUserFromCookies(request, reply)
      const { token, secret } = request.body
      console.log("token, secret", token, secret)
      reply.send("success")
    })

    app.post("/api/register", {}, async (request, reply) => {
      try {
        const userId = await registerUser(
          request.body.email,
          request.body.password
        )
        //If account was created successfully
        if (userId) {
          const emailLink = await createVerifyEmailLink(request.body.email)
          await sendEmail({
            to: request.body.email,
            subject: "Verify your email",
            html: `<a href="${emailLink}">verify</a>`
          })
          await logUserIn(userId, request, reply)
          reply.send({
            data: {
              to: request.body.email,
              status: "SUCCESS",
              userId,
            },
          })
        }
      } catch (e) {
        console.error(e)
        reply.send({
          data: {
            status: "Failed",
            
          },
        })
      }
    })
    
    app.post("/api/authorize", {}, async (request, reply) => {
      try {
        const { isAuthorized, userId } = await authorizeUser(
          request.body.email,
          request.body.password
          )
          if (isAuthorized) {
            await logUserIn(userId, request, reply)
            reply.send({
              data: {
                status: "SUCCESS",
                userId,
              },
            })
          }         
        } catch (e) {
          console.error(e)
          reply.send({
            data: {
              status: "Failed",
              
            },
          })
        }
      })

      app.post("/api/logout", {}, async (request, reply) => {
        try {
          await logUserOut(request, reply)
          reply.send({
            data: {
              status: "SUCCESS",
            },
          })
          }
         catch (e) {
          console.error(e)
          reply.send({
            data: {
              status: "Failed",
              userId
            },
          })
        }
      })

      app.post("/api/change-password", {}, async (request, reply) => {
        try {
            const { oldPassword, newPassword } = request.body
            const user = await getUserFromCookies(request, reply)
            if(user?.email?.address){
            //Compare current user with for re-auth
            const { isAuthorized, userId } = await authorizeUser(
              user.email.address,
              oldPassword
              )
              // If user say who they are 
              if (isAuthorized) {
                //Update password in db
                await changePassword(userId, Password)
                reply.code(200).send("All Good")
              }
            }
              reply.code(401).send() 
        } catch (e) {
            reply.code(401).send()
        }
    }) 
    
      
      app.post("/api/verify", {}, async (request, reply) => {
        try {
          const { token, email } = request.body
          console.log(" token, email", token, email)
          const isValid = await validateVerifyEmail(token, email)
          if (isValid) {
            return reply.code(200).send()
          }
          return reply.code(401).send()
        } catch (e) {
          console.error(e)
          return reply.code(401).send()
        }
      })

      app.post("/api/reset", {}, async (request, reply) => {
        try {
          const { email, password, token, time } = request.body
          //validate users emai l, token, time
          const isValid = await validateResetEmail(token, email, time)     
          if (isValid) {
          //Find User
          const { user } = await import("./user/user.js")
          const foundUser = await user.findOne({
            "email.address": email
          })
          console.log("Found User: ",foundUser)
          //Change Password
          await changePassword(foundUser._id, password)
        }
          return reply.code(200).send('Password Updated')
        } catch (e) {
          console.error(e)
          return reply.code(401).send()
        }
      })  
      
      
      app.post("/api/forgot-password", {}, async (request, reply) => {
        try {
          const { email } = request.body
          //check if this user exist
          const link = await createResetLink(email)
          //if user exist 
          if(link) {
            await sendEmail({
              to: email,
              subject: "Reset Password",
              html: `<a href="${link}">Reset</a>`
          })
        }
         
        
          return reply.code(200).send(link)
        
          return reply.code(401).send()
        } catch (e) {
          console.error(e)
          return reply.code(401).send()
        }
      })    

    app.get("/test", {}, async (request, reply) => {
      try {
        
        const user = await getUserFromCookies(request, reply)
        // Return user email, if it exist, otherwise return unauthorized
        if (user?._id) {
          reply.send({
            data: user,
          })
        }
        else{
          reply.send({
            data: "User Lookup Failed",
          })
        }
      } catch (e) {
        throw new Error(e)

      }
    })

    await app.listen(3000)
    console.log("🚀 Server Listening at port: 3000")
  } catch (e) {
    console.error(e)
  }
}

connectDb().then(() => {
  startApp()
})
