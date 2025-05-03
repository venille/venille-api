export const contactUsEmailTemplate = (senderName: string, senderEmail: string, subject: string, message: string) => {
  return `
  <!DOCTYPE html>
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <link href="https://fonts.googleapis.com/css2?family=Barlow&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
    <style>
        /* Base styles */
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #FFFFFF;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        .wrapper {
            background-color: #efefef;
            padding-top: 50px;
            padding-bottom: 50px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 15px;
        }

        .content {
            padding: 20px;
            background-color: #fdfdfe;
        }

        /* Typography */
        h1 {
            font-family: 'Barlow', sans-serif;
            font-size: 20px;
            line-height: 55.2px;
            color: #1C3B4E;
            margin: 0;
            text-align: center;
        }

        p {
            font-family: 'Barlow', sans-serif;
            font-size: 18px;
            line-height: 27px;
            color: #1C3B4E;
            margin: 0;
        }

        .footer-text {
            font-size: 12px;
            text-align: center;
            font-weight: bold;
            text-decoration: underline;
        }

        .sender-email {
            font-size: 16px;
            text-decoration: underline;
        }

        /* Mobile Styles */
        @media only screen and (max-width: 600px) {
            .remove-padding-mobile {
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                border-radius: 0 !important;
            }
            
            .content {
                padding: 15px;
            }
            
            h1 {
                font-size: 18px;
                line-height: 1.3;
            }
            
            p {
                font-size: 16px;
                line-height: 1.4;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="content">
                <h1><strong>${subject}</strong></h1>
                
                <div style="margin-top: 15px;">
                    <p>Hello,<br><br>${message}</p>
                </div>
                
                <div style="margin-top: 15px;">
                    <p>Best regards,</p>
                    <p>${senderName} - <span class="sender-email">${senderEmail}</span>.</p>
                </div>
            </div>
            
            <div style="padding: 20px;">
                <p class="footer-text">This is a message from a customer, reply them via their email.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};
