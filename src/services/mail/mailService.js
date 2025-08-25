import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendMail(to, subject, templateName, data) {
        try {
            // Render EJS template
            const templatePath = path.join(__dirname, "../../views/emails", templateName);
            const html = await ejs.renderFile(templatePath, data);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                html
            };

            await this.transporter.sendMail(mailOptions);

            console.log(`Mail sent to ${to}`);
        } catch (error) {
            console.error("Error sending mail:", error);
            throw error;
        }
    }
}

export default new MailService();
