export const welcome_seller_email_html_content = (customerName: string) => {
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
  
          .header {
              padding: 50px 0 0;
              background-color: #efefef;
          }
  
          .content {
              background-color: #ffffff;
              padding: 20px;
          }
  
          .hero-image {
              width: 100%;
              max-width: 600px;
              height: auto;
              display: block;
          }
  
          .logo-container {
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 20px;
          }
  
          .logo {
              width: 35px;
              height: 35px;
          }
  
          .welcome-title {
              text-align: center;
              font-size: 22px;
              line-height: 55.2px;
              margin-bottom: 20px;
          }
  
          .main-content {
              font-size: 18px;
              line-height: 27px;
              padding: 0 10px;
          }
  
          .features-list {
              padding: 15px 40px;
              margin: 15px 0;
          }
  
          .features-list li {
              margin-bottom: 15px;
              font-size: 18px;
              line-height: 27px;
          }
  
          .footer {
              background-color: #ffffff;
              padding: 20px;
              border-bottom-left-radius: 15px;
              border-bottom-right-radius: 15px;
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
  
          .footer-text {
              text-align: center;
              font-size: 14px;
              line-height: 21px;
              margin: 10px 0;
          }
  
          .footer-link {
              color: #4895ef;
              text-decoration: none;
          }
  
          @media only screen and (max-width: 600px) {
              .wrapper {
                  width: 100%;
              }
              
              .content {
                  padding: 15px;
              }
              
              .welcome-title {
                  font-size: 22px;
                  line-height: 40px;
              }
              
              .main-content {
                  font-size: 16px;
                  line-height: 24px;
              }
              
              .features-list {
                  padding: 15px 25px;
              }
              
              .header {
                  padding-top: 20px;
              }
          }
      </style>
  </head>
  <body>
      <div class="header">
          <div class="wrapper">
              <img src="https://animaff-media.s3.us-east-1.amazonaws.com/public/email-header.jpg" alt="" class="hero-image">
              
              <div class="content">
                  <div class="logo-container">
                              <img src="https://d3d4p0pie749ab.cloudfront.net/versions/original/25e6530d-480a-4c61-b061-0f805a1c007e.jpeg" alt="Logo" class="logo">
                  </div>
                  
                  <h1 class="welcome-title"><strong>Welcome</strong></h1>
                  
                  <div class="main-content">
                      <p>Hello ${customerName},<br><br>
                      Thank you for joining Livestocx! As a valued seller, you play a vital role in connecting buyers with quality livestock and strengthening our agricultural community.
                      </p>
                      
                      <p>Livestocx helps you showcase your livestock, manage transactions, and grow your business with ease. Together, we’re empowering farmers and transforming agriculture.</p>
                      <br>
                      <p>Warm regards,<br>Team Livestocx.</p>
                  </div>
              </div>
              
              <div class="footer">
                  <div class="social-links">
                     <a target="_blank" href="https://www.facebook.com/livestocx" style="mso-line-height-rule:exactly;text-decoration:underline;color:#1C3B4E;font-size:14px">
            <img title="Facebook" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/facebook-rounded-black.png" alt="Fb" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none">
          </a>
          <a target="_blank" href="https://twitter.com/livestocx" style="mso-line-height-rule:exactly;text-decoration:underline;color:#1C3B4E;font-size:14px">
            <img title="X" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/x-rounded-black.png" alt="X" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none">
          </a>
          <a target="_blank" href="https://www.linkedin.com/company/livestocxltd" style="mso-line-height-rule:exactly;text-decoration:underline;color:#1C3B4E;font-size:14px">
            <img title="LinkedIn" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/linkedin-rounded-black.png" alt="In" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none">
          </a>
                  </div>
                  
                  <p class="footer-text">For assistance, contact <strong><a href="mailto:support@livestocx.com" class="footer-link">support@livestocx.com</a></strong></p>
                  <p class="footer-text"><strong><a href="https://livestocx.com/privacy-policy/" class="footer-link">Privacy policy</a></strong></p>
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
};
