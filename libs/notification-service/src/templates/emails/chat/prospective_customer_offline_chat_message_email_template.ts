export const prospectiveCustomerOfflineChatMessageEmailTemplate = (
  recipientName: string,
  customerName: string,
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
              display: flex;
              justify-content: center;
              align-items: center;
              /*margin-bottom: 20px;*/
          }
  
          .logo {
              width: 26px;
              height: 26px;
          }
  
          .header {
              text-align: center;
              color: #1C3B4E;
              font-size: 22px;
              line-height: 55.2px;
              margin-bottom: 20px;
          }
  
          .content {
              color: #1C3B4E;
              font-size: 18px;
              line-height: 27px;
              padding: 0 10px;
          }
  
          .bullet-points {
              padding-left: 40px;
              margin: 15px 0;
          }
  
          .bullet-points li {
              color: #1C3B4E;
              margin-bottom: 15px;
              font-size: 18px;
          }
  
          .social-links {
              display: flex;
              justify-content: center;
              gap: 20px;
              margin: 20px 0;
          }
  
          .social-icon {
              width: 24px;
              height: 24px;
          }
  
          .footer {
              text-align: center;
              color: #1c3b4e;
              font-size: 14px;
              line-height: 21px;
          }
  
          .footer a {
              color: #4895ef;
              text-decoration: none;
          }
  
          @media only screen and (max-width: 600px) {
              .remove-padding-mobile {
                  padding: 0 !important;
                  border-radius: 0 !important;
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
                   <img src="https://d3d4p0pie749ab.cloudfront.net/versions/small/0b4c8014-45af-4583-a201-371b64cc72ba.jpeg"  
                      alt="Logo" 
                      class="logo"
                    >
              </div>
  
              <h1 class="header">Prospective Customer Message</h1>
  
              <div class="content">
                  <p>Hello ${recipientName}, <br><br>
                  You have a message via chat from a customer named ${customerName}. Please check your chat messages to view the message via your account.</p>
  
                  <br/>
                  <p>Best regards,<br>Team Livestocx.</p>
              </div>
  
              <div class="social-links">
                  <a target="_blank" href="https://www.facebook.com/livestocx" >
                        <img title="Facebook" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/facebook-rounded-black.png" alt="Fb" width="24" height="24">
                      </a>
                      <a target="_blank" href="https://twitter.com/livestocx" >
                        <img title="X" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/x-rounded-black.png" alt="X" width="24" height="24">
                      </a>
                      <a target="_blank" href="https://www.linkedin.com/company/livestocxltd" >
                        <img title="LinkedIn" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/linkedin-rounded-black.png" alt="In" width="24" height="24">
                      </a>
              </div>
  
              <div class="footer">
                  <p>For assistance, contact <strong><a href="mailto:support@livestocx.com">support@livestocx.com</a></strong></p>
                  <p style="margin-top: 10px;"><strong><a href="https://livestocx.com/privacy-policy/" style="color: #1C3B4E;">Privacy policy</a></strong></p>
              </div>
          </div>
      </div>
  </body>
  </html>
    `;
};
