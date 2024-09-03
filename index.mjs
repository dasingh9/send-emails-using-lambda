import { S3 } from '@aws-sdk/client-s3';
import sgMail from '@sendgrid/mail';
import { insertEmailConfirmation } from './dao/mongodb-dao.mjs';

// Set your SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('Loading function');
const s3 = new S3();

export const handler = async (event) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    try {
        //1. READ FILE FROM S3
        const csvContent = await readFileFromS3(bucket, key);

        //2. CONVERT FILE TO AN ARRAY
        const customers = convertToArray(csvContent);

        //3. SEND EMAILS USING SENDGRID
        // install send-grid
        // create an API key in SEND GRID portal
        const from = "from_email@gmail.com";
        const subject = "Deal of the day";
        const body = getEmailTemplate();
        for (let customer of customers) {
            const to = customer.emailAddress;
            try {
                //3. SEND EMAIL
                await sendEmail(to, from, subject, body);
                //4. SAVE RECORD TO MONGODB
                await insertEmailConfirmation(to, from, subject, 'success');
            }
            catch (error) {
                console.error(`Failed to send email to ${to}`);
            }
        }
        console.log("Job completed");
        return {"jobStatus" : "complete" };

    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }

};

async function sendEmail(to, from, subject, message) {
    const msg = {
        to,
        from, // Use your verified SendGrid sender email
        subject,
        text: message,
        html: message,
    };

    try {
        const response = await sgMail.send(msg);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}. Error: ${error}`);
        throw new Error(`Failed to send email to ${to}`);
    }

}

async function readFileFromS3(bucket, key) {
    const params = {
        Bucket: bucket,
        Key: key,
    };

    // Fetch the object from S3
    const data = await s3.getObject(params);

    // Convert the Body to a string using transformToString
    const csvContent = await data.Body.transformToString('utf-8');

    return csvContent;
}

function convertToArray(csvContent) {
    // Split the CSV content into lines
    const lines = csvContent.split(/\r?\n/);
    const customers = [];
    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",");
        customers.push({
            "name": columns[0],
            "emailAddress": columns[1]
        });
    }
    return customers;
}

function getEmailTemplate() {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pizza Promotion</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f8f8f8;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #ff6347;
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                }
                .header img {
                    width: 50px;
                    height: 50px;
                }
                .header h1 {
                    margin: 10px 0;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content h2 {
                    color: #ff6347;
                }
                .content p {
                    font-size: 18px;
                    color: #333333;
                }
                .content .deal {
                    font-size: 24px;
                    font-weight: bold;
                    color: #ff6347;
                    margin: 20px 0;
                }
                .cta-button {
                    display: inline-block;
                    padding: 15px 30px;
                    font-size: 18px;
                    color: #ffffff;
                    background-color: #ff6347;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .footer {
                    background-color: #333333;
                    color: #ffffff;
                    text-align: center;
                    padding: 10px;
                    font-size: 14px;
                }
                .footer p {
                    margin: 5px 0;
                }
                .footer a {
                    color: #ff6347;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://raw.githubusercontent.com/dasingh9/public/471932a8ea430d3e20f62147a6f6f297754f1e7f/pizza-slice.jpg?raw=true" alt="Pizza Logo">
                    <h1>Pizza Special Deals!</h1>
                </div>
                <div class="content">
                    <h2>Get Your Favorite Pizza at an Amazing Price!</h2>
                    <p>Don't miss out on our delicious pizza deals, available for a limited time only. Order now and enjoy!</p>
                    <div class="deal">Buy 1 Get 1 Free on All Pizzas!</div>
                    <p>Use Promo Code: <strong>PIZZADEAL</strong></p>
                    <a href="https://example.com/order" class="cta-button">Order Now</a>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Pizza Place. All Rights Reserved.</p>
                    <p><a href="https://example.com/unsubscribe">Unsubscribe</a> from these emails.</p>
                </div>
            </div>
        </body>
        </html>
        `;
}