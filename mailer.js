const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function sendNotif(to,result,job) {

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: `dis.tri.uted@gmail.com`, // generated ethereal user
      pass: `coding17` // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Dis-Tri-Buted 👻" <dis.tri.uted@gmail.com>', // sender address
    to: to, // list of receivers
    subject: `Notif Regarding Job ${job}`, // Subject line
    text: `Notif Regarding Job ${job}`, // plain text body
    html: `Hey there,<br> Your Job <b>${job}</b> has been completed <br> You can access the result <a href="${result}"> here</a> <br><br> Regards,<br> Team Distributed` // html body
  });

  console.log("Message sent: %s", info.messageId);
}

//sendNotif("nurdtechie98@gmail.com","xyz.com", "12dee334f").catch(console.error);

module.exports = sendNotif;