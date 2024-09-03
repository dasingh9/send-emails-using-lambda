# Lambda + S3 + SendGrid + MongoDB to send emails and store records
To send marketing emails to customers and store records to MongoDB

## To setup this app on your local
1. `Clone this repo`
2. `cd send-emails-using-lambda`
3. `npm install`

## High level solution design
![image](https://github.com/user-attachments/assets/7aa5ead4-d149-4566-b203-a22f3900fc95)
### Flow
- This Lambda is triggered when a customers.txt file is uploaded to S3 bucket
- The Lambda reads the customer name and email address from customers.txt from s3 bucket using `@aws-sdk/client-s3` package
- The Lambda converts the records to a JSON array of customers
- The Lambda calls SendGrid API using `@sendgrid/mail` npm package to send Pizza deals to customers' emails.
- The Lambda saves record to MongoDB using MongoClient from `mongodb` package.

## Steps to Deploy Lambda App to AWS Lambda using Zip file
1. Select and zip all the files and folders inside `send-emails-using-lambda` directory (Note: do not zip `send-emails-using-lambda` directory)
2. Login to AWS console - https://console.aws.amazon.com/ using your AWS account
3. Go to Lambda and search your lambda there. (Assuming you have already created a lambda in the AWS console)
4. Click on Upload from dropdown and select .zip file (see below screenshot)
5. Your lambda will be deployed automatically

   ![image](https://github.com/user-attachments/assets/e012b14e-1ae5-4dcc-adc9-8ac4b657b5d0)


## Help & Support
Contact me if you have any questions! 😊
