export const forgot_password_html_content = (passwordResetCode: string) => {
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
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
  
          body {
              width: 100%;
              height: 100%;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              background-color: #FFFFFF;
              font-family: 'Barlow', sans-serif;
              color: #1C3B4E;
          }
  
          .wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
          }
  
          .main-content {
              background-color: #efefef;
              padding: 50px 0;
          }
  
          .email-container {
              background-color: #ffffff;
              border-radius: 15px;
              padding: 20px;
              margin: 0 auto;
              width: 100%;
              max-width: 600px;
          }
  
          .logo-container {
              width: 100%;
              text-align: center;
              padding: 20px 0;
          }
  
          .logo-container table {
              width: 100%;
          }
  
          .logo-container td {
              text-align: center;
          }
  
          .logo {
              width: 26px;
              height: 26px;
          }
  
          .header {
              text-align: center;
              font-size: 22px;
              line-height: 55.2px;
              margin-bottom: 20px;
              font-weight: bold;
          }
  
          .content {
              font-size: 18px;
              line-height: 27px;
              padding: 0 10px;
          }
  
          .otp-code {
              background-color: #f8f9fa;
              padding: 10px 4px;
              margin: 15px auto;
              width: fit-content;
              font-weight: bold;
          }
  
          .social-links {
              width: 100%;
              text-align: center;
              padding: 20px 0;
          }
  
          .social-links table {
              width: 100%;
          }
  
          .social-links td {
              text-align: center;
          }
  
          .social-links a {
              display: inline-block;
              margin: 0 10px;
              text-decoration: none;
          }
  
          .footer {
              text-align: center;
              font-size: 14px;
              line-height: 21px;
              padding: 20px;
          }
  
          .footer a {
              color: #4895ef;
              text-decoration: none;
          }
  
          .footer .privacy-link {
              color: #1C3B4E;
              margin-top: 10px;
              display: block;
          }
  
          @media only screen and (max-width: 600px) {
              .remove-padding-mobile {
                  padding: 0 !important;
              }
              
              .email-container {
                  border-radius: 0;
              }
              
              .content {
                  font-size: 16px;
              }
          }
      </style>
  </head>
  <body>
      <div class="main-content">
          <div class="email-container">
              <div class="logo-container">
                  <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                          <td align="center">
                              <img src="https://d3d4p0pie749ab.cloudfront.net/versions/original/25e6530d-480a-4c61-b061-0f805a1c007e.jpeg"  
                                  alt="Logo" 
                                  class="logo">
                          </td>
                      </tr>
                  </table>
              </div>
  
              <h1 class="header">Reset Password</h1>
  
              <div class="content">
                  <p>Hello,<br><br>
                  We received a request to reset the password for your Medexer account. To proceed, please verify your email address.</p>
                  
                  <p>Here is your reset password code (OTP):</p>
                  
                  <div class="otp-code">
                      ${passwordResetCode}
                  </div>
                  
                  <p>This code is valid for the next 1 hour. Please enter it on the password verification page to authorize your request address.</p>
              </div>
  
              <div class="social-links">
                  <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                          <td align="center">
                              <a target="_blank" href="https://www.facebook.com/livestocx" style="display: inline-block; margin: 0 10px;">
                                  <img title="Facebook" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/facebook-rounded-black.png" alt="Fb" width="24" height="24">
                              </a>
                              <a target="_blank" href="https://twitter.com/livestocx" style="display: inline-block; margin: 0 10px;">
                                  <img title="X" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/x-rounded-black.png" alt="X" width="24" height="24">
                              </a>
                              <a target="_blank" href="https://www.linkedin.com/company/livestocxltd" style="display: inline-block; margin: 0 10px;">
                                  <img title="LinkedIn" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/linkedin-rounded-black.png" alt="In" width="24" height="24">
                              </a>
                          </td>
                      </tr>
                  </table>
              </div>
  
              <div class="footer">
                  <p>For assistance, contact <strong><a href="mailto:support@livestocx.com">support@livestocx.com</a></strong></p>
                  <a href="https://livestocx.com/privacy-policy/" class="privacy-link"><strong>Privacy policy</strong></a>
              </div>
          </div>
      </div>
  </body>
</html>
`;
};
