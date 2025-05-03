import { PromotedSubscriptionReceiptProductInfo } from '@app/notification-service/src/interface';

export const promotion_subscription_payment_receipt_html_content = (payload: {
  amount: string;
  paymentDate: string;
  paymentReference: string;
  products: PromotedSubscriptionReceiptProductInfo[];
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

    .logo-container img {
      width: 50px;
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
    
    .promotion-details {
      background-color: #f8f8f8;
      padding: 15px;
      border-radius: 10px;
      margin-top: 20px;
    }
    
    .promotion-details p {
      font-size: 16px;
      margin: 5px 0;
    }
    
    .product-list {
      margin-top: 15px;
    }
    
    .product-item {
      display: flex;
      align-items: center;
      background-color: #fff;
      padding: 10px;
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .product-item img {
      width: 60px;
      height: 60px;
      border-radius: 5px;
      margin-right: 10px;
    }
    
    .product-item p {
      font-size: 16px;
      color: #1C3B4E;
      font-weight: bold;
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
        <img src="https://d3d4p0pie749ab.cloudfront.net/versions/small/0b4c8014-45af-4583-a201-371b64cc72ba.jpeg" alt="Logo">
      </div>

      <h1 class="header">Product Promotion Subscription</h1>

      <div class="content">
        <p>Hello,</p>
        <p>Thank you for subscribing to our <strong>Product Promotion Plan</strong>. Your products are now being promoted on our platform.</p>
        
        <div class="promotion-details">
          <p><strong>Subscription Plan:</strong> Product Promotion Plan</p>
          <p><strong>Amount Paid:</strong> ₦${payload.amount}</p>
          <p><strong>Payment Date:</strong> ${payload.paymentDate}</p>
          <p><strong>Payment Reference:</strong> ${payload.paymentReference}</p>
        </div>

        <h2 style="margin-top: 20px; font-size: 20px;">Promoted Products</h2>
        <div class="product-list">
          ${payload.products
            .map(
              (product) => `
            <div class="product-item">
              <img src="${product.imageUrl}" alt="${product.name}">
              <p>${product.name}</p>
            </div>
          `,
            )
            .join('')}
        </div>

        <br/>
        <p>If you have any questions, feel free to contact our support team.</p>
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
