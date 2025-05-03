export const welcome_customer_email_html_content = (customerName: string) => {
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

    .content {
      padding: 20px;
      background-color: #fdfdfe;
    }

    .header {
      text-align: center;
      margin-bottom: 20px;
    }

    .logo {
      width: 60px;
      height: 60px;
      margin: 0 auto;
      display: block;
    }

    .welcome-title {
      font-size: 22px;
      line-height: 55.2px;
      font-weight: bold;
      margin: 10px 0;
    }

    .message {
      font-size: 18px;
      line-height: 27px;
      margin: 15px 0;
    }

    .benefits-list {
      padding-left: 40px;
      margin: 15px 0;
    }

    .benefits-list li {
      margin-bottom: 15px;
      font-size: 18px;
      line-height: 27px;
    }

    .footer {
      background-color: #ffffff;
      padding-bottom: 20px;
      text-align: center;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }

    .social-links {
      margin: 20px 0;
    }

    .social-links a {
      margin: 0 10px;
      display: inline-block;
    }

    .social-links img {
      width: 24px;
      height: 24px;
    }

    .contact-info {
      font-size: 14px;
      line-height: 21px;
      margin: 10px 0;
    }

    .contact-info a {
      color: #4895ef;
      text-decoration: none;
    }

    .privacy-link {
      color: #1C3B4E;
      text-decoration: none;
      font-weight: bold;
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
      
      .message {
        font-size: 16px;
        line-height: 24px;
      }
      
      .benefits-list li {
        font-size: 16px;
        line-height: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="content">
      <div class="header">
        <img src="https://d3d4p0pie749ab.cloudfront.net/versions/original/25e6530d-480a-4c61-b061-0f805a1c007e.jpeg" alt="Logo" class="logo">
        <h1 class="welcome-title">Welcome</h1>
      </div>
      
      <div class="message">
        Hello ${customerName},
           <br><br>
        Welcome to <strong>Venille</strong>! We're excited to support your journey toward better menstrual health. Venille is more than just premium sanitary pads—we’re building a full menstrual wellness experience through our mobile app.
        <br><br>
        <strong>With Venille, you can:</strong>
      </div>
      
      <ul class="benefits-list">
        <li>Track your menstrual cycle and receive health insights.</li>
        <li>Set reminders for pad changes and period predictions.</li>
        <li>Access trusted information on reproductive health and hygiene.</li>
        <li>Order quality sanitary products directly to your door.</li>
      </ul>
      
       <div class="message">
        We’re committed to empowering every woman and girl to feel confident and in control of their menstrual health. We’re glad to have you with us.
        <br><br>
        With care,  
        <br>
        Team Venille
      </div>
    </div>
    
    <div class="footer">
      <div class="social-links">
       <a target="_blank" href="" style="mso-line-height-rule:exactly;text-decoration:underline;color:#1C3B4E;font-size:14px">
          <img title="Facebook" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/facebook-rounded-black.png" alt="Fb" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none">
        </a>
        <a target="_blank" href="" style="mso-line-height-rule:exactly;text-decoration:underline;color:#1C3B4E;font-size:14px">
          <img title="X" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/x-rounded-black.png" alt="X" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none">
        </a>
        <a target="_blank" href="" style="mso-line-height-rule:exactly;text-decoration:underline;color:#1C3B4E;font-size:14px">
          <img title="LinkedIn" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/linkedin-rounded-black.png" alt="In" width="24" height="24" style="display:block;font-size:18px;border:0;outline:none;text-decoration:none">
        </a>
      </div>

      <div class="contact-info">
        For assistance, contact <strong><a href="">support@venille.com.ng</a>
      </div>
      
      <div class="contact-info">
        <a href="" class="privacy-link">Privacy policy</a>
      </div>
    </div>
  </div>
</body>
</html>
`;
};
