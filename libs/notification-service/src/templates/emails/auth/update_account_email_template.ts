export const update_account_email_html_content = (
  donor: string,
  activationCode: string,
) => {
  return `
<!DOCTYPE html>
<html dir="ltr" lang="en">
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
            font-family: 'Barlow', sans-serif;
        }

        .wrapper {
            background-color: #efefef;
            padding: 50px 0;
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

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .logo {
            width: 35px;
            height: 35px;
        }

        .title {
            font-size: 22px;
            color: #1C3B4E;
            font-weight: bold;
            margin: 10px 0;
        }

        .message {
            font-size: 18px;
            line-height: 27px;
            color: #1C3B4E;
            margin: 15px 0;
        }

        .verification-code {
             background-color: #f8f9fa;
            padding: 10px;
            display: flex;
            width: fit-content;
            justify-content: center;
            margin: 15px auto;
        }

        .footer {
            padding: 20px;
            text-align: center;
        }

        .social-links {
            margin: 20px 0;
        }

        .social-links a {
            margin: 0 10px;
            text-decoration: none;
        }

        .social-links img {
            width: 24px;
            height: 24px;
        }

        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
            .wrapper {
                padding: 0;
            }
            
            .container {
                border-radius: 0;
            }
            
            .content {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="content">
                <div class="header">
                    <img src="https://d3d4p0pie749ab.cloudfront.net/versions/small/0b4c8014-45af-4583-a201-371b64cc72ba.jpeg"  
                         alt="Logo" 
                         class="logo">
                    <h1 class="title">Verify New Account Email</h1>
                </div>
                
                <div class="message">
                    Hello ${donor},<br><br>
                    We received a request to update the email for your Animaff account. To proceed, verify your new email address with this activation code:
                </div>
                
                <div class="verification-code">
                    ${activationCode}
                </div>
                
                <div class="message">
                    This code is valid for the next 1 hour. Please enter it on the password verification page to authorize your request.
                </div>
            </div>

            <div class="footer">
                <div class="social-links">
                    <a target="_blank" href="https://www.facebook.com/livestocx" >
                      <img title="Facebook" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/facebook-rounded-black.png" alt="Fb" width="24" height="24">
                    </a>
                    <a target="_blank" href="https://twitter.com/livestocx">
                      <img title="X" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/x-rounded-black.png" alt="X" width="24" height="24">
                    </a>
                    <a target="_blank" href="https://www.linkedin.com/company/livestocxltd" >
                      <img title="LinkedIn" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/linkedin-rounded-black.png" alt="In" width="24" height="24">
                    </a>
                </div>
                
                <p>For assistance, contact <strong><a href="mailto:support@livestocx.com">support@livestocx.com</a></strong></p>
                <p><strong><a href="https://livestocx.com/privacy-policy/">Privacy policy</a></strong></p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};
