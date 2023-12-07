import emailQueue from "./emailQueue";

export async function sendEmail(to: string, html: string, subject: string) {
  await emailQueue.add({
    to: to,
    html: html,
    subject: subject,
});
}
