export const reset_password_html_content = () => {
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
      text-align: center;
      padding: 20px 0;
    }

    .logo {
      width: 26px;
      height: 26px;
      display: block;
      margin: 0 auto;
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

    /* Updated Social Links CSS */
    .social-links {
      text-align: center;
      margin: 20px auto;
      padding: 0;
    }

    .social-links a {
      display: inline-block;
      margin: 0 10px;
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
          style="margin: 0 auto;"
        >
      </div>

      <h1 class="header">Password Reset</h1>

      <div class="content">
        <p>Hello,<br><br>
          We wanted to let you know that the password for your Livestocx account has been successfully reset. If you made this change, no further action is required. If you didn't reset your password, please contact our support team immediately to secure your account.
        </p>

        <ul class="bullet-points">
          <li>Keep your password secure and avoid sharing it with anyone.</li>
          <li>If you suspect any unauthorized access to your account, reset your password again and notify us.</li>
        </ul>

        <br/>
        <p>Best regards,<br>Team Livestocx.</p>
      </div>

      <div class="social-links">
        <a href="https://www.facebook.com/livestocx" style="text-decoration: none;">
          <img title="Facebook" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/facebook-rounded-black.png" alt="Fb" width="24" height="24">
        </a>
        <a href="https://twitter.com/livestocx" style="text-decoration: none;">
          <img title="X" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/x-rounded-black.png" alt="X" width="24" height="24">
        </a>
        <a href="https://www.linkedin.com/company/livestocxltd" style="text-decoration: none;">
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
