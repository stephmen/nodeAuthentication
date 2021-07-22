import nodemailer from 'nodemailer'
let mail
export async function mailInit () {
    let testAccount = await nodemailer.createTestAccount()    
    mail = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    })
}

export async function sendEmail({
            from = "stephmen@gmail.com",
            to = "stephmen@gmail.com",
            subject,
            html,
}) {
    try {
       
        const info = await mail.sendMail({
            from,
            to,
            subject,
            html,  
        }
        )
        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
        console.log(info)
    } catch (e) {
        console.log(e)
    }
}