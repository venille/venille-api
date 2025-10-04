export const girlifiedBioContactUsEmailTemplate = (
    senderName: string, 
    senderEmail: string, 
    companyOrganization: string,
    inquiryType: string,
    message: string
  ) => {
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
  
          .info-label {
              font-weight: bold;
              color: #2d5a6b;
          }
  
          .info-section {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
          }
  
          .info-section p {
              margin-bottom: 8px;
          }
  
          .info-section p:last-child {
              margin-bottom: 0;
          }
  
          .footer-text {
              font-size: 12px;
              text-align: center;
              font-weight: bold;
              text-decoration: underline;
              color: #1C3B4E;
          }
  
          .sender-email {
              font-size: 16px;
              text-decoration: underline;
              color: #2d5a6b;
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
                  <h1><strong>New Contact Form Inquiry</strong></h1>
                  
                  <div class="info-section">
                      <p><span class="info-label">From:</span> ${senderName}</p>
                      <p><span class="info-label">Email:</span>${senderEmail}</p>
                      <p><span class="info-label">Company/Organization:</span> ${companyOrganization}</p>
                      <p><span class="info-label">Inquiry Type:</span> ${inquiryType}</p>
                  </div>
                  
                  <div style="margin-top: 20px;">
                      <p class="info-label">Message:</p>
                      <p style="margin-top: 10px; white-space: pre-wrap;">${message}</p>
                  </div>
              </div>
              
              <div style="padding: 20px;">
                  <p class="footer-text">This is a message from a customer, reply to them via their email.</p>
              </div>
          </div>
      </div>
  </body>
  </html>
    `;
  };