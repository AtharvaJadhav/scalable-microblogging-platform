import nodemailer from "nodemailer";
import Queue from "bull";

interface EmailJobData {
  to: string;
  html: string;
  subject: string;
}

const emailQueue = new Queue<EmailJobData>(
  "emailQueue",
  "redis://127.0.0.1:6379"
);

// async..await is not allowed in global scope, must use a wrapper
async function sendEmailJob(to: string, html: string, subject: string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();
  // console.log("testAccount:", testAccount);

  // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: "pzkc5bo7h465tqnq@ethereal.email", // generated ethereal user
//       pass: "NEMpcht562uudPEBXW", // generated ethereal password
//     },

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ID, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD      // Your App Password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Team Ekko " <ekko@example.com>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

// Process jobs in the queue
emailQueue.process(
  async (job: Queue.Job<EmailJobData>, done: Queue.DoneCallback) => {
    try {
      await sendEmailJob(job.data.to, job.data.html , job.data.subject);
      console.log("Email sent!!");
      done();
    } catch (error) {
      console.error(error);
      done(error);
    }
  }
);

export default emailQueue;
