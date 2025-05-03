export const email_verification_html_content = (
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
              background-color: #FFFFFF;
              font-family: 'Barlow', sans-serif;
          }
  
          .wrapper {
              width: 100%;
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
  
          /* Header */
          .logo-container {
              text-align: center;
              padding: 20px 0;
          }
  
          .logo {
              width: 35px;
              height: 35px;
              display: inline-block;
          }
  
          /* Typography */
          h1 {
              font-family: 'Barlow', sans-serif;
              font-size: 26px;
              color: #1C3B4E;
              text-align: center;
              margin: 0;
          }
          
          .header {
              font-size: 22px;
              font-weight: bold;
          }
  
          p {
              font-family: 'Barlow', sans-serif;
              font-size: 18px;
              line-height: 27px;
              color: #1C3B4E;
              margin: 15px 0;
          }
  
          /* Verification code */
          .verification-code {
              background-color: #f8f9fa;
              padding: 10px;
              display: flex;
              width: fit-content;
              justify-content: center;
              margin: 15px auto;
          }

          .otp-code {
              background-color: #f8f9fa;
              padding: 10px 4px;
              margin: 15px auto;
              width: fit-content;
              font-weight: bold;
          }
  
          /* Footer */
          .footer {
              font-size: 12px;
              padding: 20px;
              text-align: center;
          }
  
          .social-links {
              text-align: center;
              padding: 20px 0;
          }
  
          .social-links a {
              display: inline-block;
              margin: 0 10px;
              text-decoration: none;
          }
  
          /* Media Queries */
          @media only screen and (max-width: 600px) {
              .container {
                  width: 100%;
                  border-radius: 0;
              }
              
              .wrapper {
                  padding: 0;
              }
          }
      </style>
  </head>
  <body>
      <div class="wrapper">
          <div class="container">
              <div class="content">
                  <div class="logo-container">
                      <img src="https://d3d4p0pie749ab.cloudfront.net/versions/original/25e6530d-480a-4c61-b061-0f805a1c007e.jpeg" 
                           alt="Logo" 
                           class="logo"
                           style="display: inline-block;">
                  </div>
                  
                  <h1 class="header">Email Verification</h1>
                  
                  <p>Hello ${donor},</p>
                  <p>Thank you for signing up with Livestocx! To complete your registration, we need to verify your email address.</p>
                  
                  <p>Here is your verification code (OTP):</p>
                  <div class="otp-code">
                    ${activationCode}
                  </div>
                  
                  <p>This code is valid for the next 1 hour. Please enter it on the verification page to confirm your email address.</p>
              </div>
  
              <div class="footer">
                  <div class="social-links">
                      <a target="_blank" href="https://www.facebook.com/livestocx" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img title="Facebook" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/facebook-rounded-black.png" alt="Fb" width="24" height="24" style="display: block;">
                      </a>
                      <a target="_blank" href="https://twitter.com/livestocx" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img title="X" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/x-rounded-black.png" alt="X" width="24" height="24" style="display: block;">
                      </a>
                      <a target="_blank" href="https://www.linkedin.com/company/livestocxltd" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img title="LinkedIn" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/linkedin-rounded-black.png" alt="In" width="24" height="24" style="display: block;">
                      </a>
                  </div>
                  
                  <p>For assistance, contact <strong><a href="mailto:support@livestocx.com">support@livestocx.com</a></strong></p>
                  <p><strong><a href="https://livestocx.com/privacy-policy/">Privacy policy</a></strong></p>
              </div>
          </div>
      </div>
  </body>
</html>  <!DOCTYPE html>
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
              background-color: #FFFFFF;
              font-family: 'Barlow', sans-serif;
          }
  
          .wrapper {
              width: 100%;
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
  
          /* Header */
          .logo-container {
              text-align: center;
              padding: 20px 0;
          }
  
          .logo {
              width: 35px;
              height: 35px;
              display: inline-block;
          }
  
          /* Typography */
          h1 {
              font-family: 'Barlow', sans-serif;
              font-size: 26px;
              color: #1C3B4E;
              text-align: center;
              margin: 0;
          }
          
          .header {
              font-size: 22px;
              font-weight: bold;
          }
  
          p {
              font-family: 'Barlow', sans-serif;
              font-size: 18px;
              line-height: 27px;
              color: #1C3B4E;
              margin: 15px 0;
          }
  
          /* Verification code */
          .verification-code {
              background-color: #f8f9fa;
              padding: 10px;
              display: flex;
              width: fit-content;
              justify-content: center;
              margin: 15px auto;
          }

          .otp-code {
              background-color: #f8f9fa;
              padding: 10px 4px;
              margin: 15px auto;
              width: fit-content;
              font-weight: bold;
          }
  
          /* Footer */
          .footer {
              font-size: 12px;
              padding: 20px;
              text-align: center;
          }
  
          .social-links {
              text-align: center;
              padding: 20px 0;
          }
  
          .social-links a {
              display: inline-block;
              margin: 0 10px;
              text-decoration: none;
          }
  
          /* Media Queries */
          @media only screen and (max-width: 600px) {
              .container {
                  width: 100%;
                  border-radius: 0;
              }
              
              .wrapper {
                  padding: 0;
              }
          }
      </style>
  </head>
  <body>
      <div class="wrapper">
          <div class="container">
              <div class="content">
                  <div class="logo-container">
                      <img src="https://d3d4p0pie749ab.cloudfront.net/versions/small/0b4c8014-45af-4583-a201-371b64cc72ba.jpeg" 
                           alt="Logo" 
                           class="logo"
                           style="display: inline-block;">
                  </div>
                  
                  <h1 class="header">Email Verification</h1>
                  
                  <p>Hello ${donor},</p>
                  <p>Thank you for signing up with Livestocx! To complete your registration, we need to verify your email address.</p>
                  
                  <p>Here is your verification code (OTP):</p>
                  <div class="otp-code">
                    ${activationCode}
                  </div>
                  
                  <p>This code is valid for the next 1 hour. Please enter it on the verification page to confirm your email address.</p>
              </div>
  
              <div class="footer">
                  <div class="social-links">
                      <a target="_blank" href="https://www.facebook.com/livestocx" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img title="Facebook" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/facebook-rounded-black.png" alt="Fb" width="24" height="24" style="display: block;">
                      </a>
                      <a target="_blank" href="https://twitter.com/livestocx" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img title="X" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/x-rounded-black.png" alt="X" width="24" height="24" style="display: block;">
                      </a>
                      <a target="_blank" href="https://www.linkedin.com/company/livestocxltd" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                        <img title="LinkedIn" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/linkedin-rounded-black.png" alt="In" width="24" height="24" style="display: block;">
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
