export const incorrect_subscription_payment_amount_html_content = (payload: {
  amountPaid: string;
  payment_date: string;
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
      width: 26px;
      height: 26px;
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
  </style>
</head>
<body>
  <div class="main-content">
    <div class="email-container">
      <div class="logo-container">
        <img src="https://d3d4p0pie749ab.cloudfront.net/versions/small/0b4c8014-45af-4583-a201-371b64cc72ba.jpeg" alt="Logo" width="50">
      </div>

      <h1 class="header">Incorrect Transfer Amount</h1>

      <div class="content">
        <p>Hello,</p>
        <p>We noticed that your recent bank transfer payment was made with an incorrect amount. Unfortunately, this has resulted in a declined payment.</p>
        <p>Below are the details of the transaction:</p>
        
        <div class="receipt-details">
          <p><strong>Amount Paid:</strong> ₦${payload.amountPaid}</p>
          <p><strong>Payment Date:</strong> ${payload.payment_date}</p>
        </div>

        <br/>
        <p>Since the amount paid does not match the required amount, your payment has been declined, and you will be reimbursed shortly.</p>
        <p>If you wish to proceed with your subscription, please make a new payment with the correct amount.</p>
        <p>For any inquiries, feel free to contact our support team.</p>
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
