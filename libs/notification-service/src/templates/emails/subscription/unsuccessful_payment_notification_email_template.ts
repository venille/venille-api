export const unsuccessful_payment_notification_html_content = (payload: {
  amount: string;
  paymentType: string;
}) => {
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

    .logo-container img{
      width: 50px;
      height: 50px;
    }
    
    .header {
      text-align: center;
      color: #1C3B4E;
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    
    .content {
      color: #1C3B4E;
      font-size: 18px;
      line-height: 27px;
      padding: 0 10px;
    }
    
    .receipt-details {
      background-color: #f8f8f8;
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
    }
    
    .receipt-details p {
      font-size: 16px;
      margin: 5px 0;
    }
    
    .footer {
      text-align: center;
      color: #1c3b4e;
      font-size: 14px;
      margin-top: 20px;
    }
    
    .footer a {
      color: #4895ef;
      text-decoration: none;
    }
    
    .store-buttons {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
    
    .store-button {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #1C3B4E;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      text-decoration: none;
      font-size: 16px;
      font-weight: bold;
      width: 180px;
      margin-right: 5px;
    }
    
    .store-button img {
      width: 20px;
      height: 20px;
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <div class="main-content">
    <div class="email-container">
      <div class="logo-container">
        <img src="https://d3d4p0pie749ab.cloudfront.net/versions/small/0b4c8014-45af-4583-a201-371b64cc72ba.jpeg" alt="Logo">
      </div>

      <h1 class="header">Unsuccessful Payment Attempt</h1>

      <div class="content">
        <p>Hello,</p>
        <p>We noticed that you attempted to make a payment for <strong>${payload.paymentType}</strong>, but the transaction was unsuccessful.</p>
        
        <p>To complete your subscription, please make a payment using the details below:</p>
        <div class="receipt-details">
          <p><strong>Account Name:</strong> LIVESTOCK AGRITECH SOLUTIONS LTD</p>
          <p><strong>Bank Name:</strong> Zenith Bank</p>
          <p><strong>Account Number:</strong> 1229719809</p>
          <p><strong>Amount:</strong> ₦${payload.amount}</p>
        </div>

        <br/>
        <p>Alternatively, you can update the mobile application and use the bank transfer option, which works faster. Download the latest version using the links below:</p>
        
        <div class="store-buttons">
          <a href="https://play.google.com/store/apps/details?id=com.livestocx.livestocx_mobile" class="store-button" target="_blank">
            <img src="https://cdn-icons-png.freepik.com/256/324/324113.png?uid=R99293591&ga=GA1.1.1670147572.1711909201&semt=ais_hybrid" alt="Google Play">
            <span>Google Play</span>
          </a>
          <a href="https://apps.apple.com/ng/app/livestocx/id6738842775?platform=iphone" class="store-button" target="_blank">
            <img src="https://cdn-icons-png.freepik.com/256/5977/5977575.png?uid=R99293591&ga=GA1.1.1670147572.1711909201&semt=ais_hybrid" alt="App Store">
            <span>App Store</span>
          </a>
        </div>
        
        <br/>
        <p>Best regards,</p>
        <p>The Livestocx Team</p>
        <br/>
      </div>

      <div class="footer">
        <p>For assistance, contact <a href="mailto:support@livestocx.com">support@livestocx.com</a></p>
        <p><a href="https://livestocx.com/privacy-policy/">Privacy Policy</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};
