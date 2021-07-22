import https from "https"
import { fastify } from "fastify"
import fetch from "cross-fetch"
import fastifyStatic from "fastify-static"
import { fileURLToPath } from "url"
import path from "path"


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = fastify()

async function startApp() {
    try {
        const PORT = 5000
        
        app.register(fastifyStatic, {
            root: path.join(__dirname, "public"),
          })

        
        
          app.get("/2fa", {}, async (request,reply) => reply.sendFile("2fa.html"))

          app.get("/reset/:email/:exp/:token", {}, async (request,reply) => reply.sendFile("reset.html"))
        

        
        app.get(
            "/verify/:email/:token", {}, async(request, reply) => {
            try {
            const { email, token } = request.params
            console.log("request", email, token)
            const values = {
                email,
                token,
            }
            
            const httpsAgent = new https.Agent({
                rejectUnauthorized: false,
            })

            const res = await fetch("https://api.nodeauth.dev/api/verify", {
            method: "POST",
            body: JSON.stringify(values),
            credentials: 'include',
            agent: httpsAgent,
            headers: { "Content-type": "application/json; charset=UTF-8" },
            })
            if (res.status === 200) {
                return reply.redirect("/")
              }
              reply.code(401).send()
            } catch (e) {
              console.log("e", e)
              reply.code(401).send()
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
        
          await app.listen(PORT)
          console.log(`🚀 Server Listening at port: ${PORT}`)
          console.log("PORT:",PORT)
        } catch (e) {
        console.log(e)  
        }
}

startApp()