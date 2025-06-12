export const admin_order_sanitary_pad_email_html_content = (payload:{
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    quantity: string,
    deliveryMethod: string,
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
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #FFFFFF;
            font-family: 'Barlow', sans-serif;
        }

        .wrapper {
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

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .logo {
            width: 60px;
            height: 60px;
        }

        .title {
            font-size: 22px;
            color: #1C3B4E;
            font-weight: bold;
            margin: 10px 0;
        }

        .message {
            font-size: 18px;
            line-height: 27px;
            color: #1C3B4E;
            margin: 15px 0;
        }

        .order-details {
            background-color: #f8f9fa;
            padding: 15px;
            margin: 20px auto;
            width: fit-content;
            border-radius: 8px;
        }

        .footer {
            padding: 20px;
            text-align: center;
        }

        .social-links {
            margin: 20px 0;
        }

        .social-links a {
            margin: 0 10px;
            text-decoration: none;
        }

        .social-links img {
            width: 24px;
            height: 24px;
        }

        @media only screen and (max-width: 600px) {
            .wrapper {
                padding: 0;
            }

            .container {
                border-radius: 0;
            }

            .content {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="content">
                <div class="header">
                    <img src="https://d3d4p0pie749ab.cloudfront.net/versions/original/25e6530d-480a-4c61-b061-0f805a1c007e.jpeg"  
                         alt="Venille Logo" 
                         class="logo">
                    <h1 class="title">New Sanitary Pad Order</h1>
                </div>
                
                <div class="message">
                    Hello Venille Admin,<br><br>
                    A customer has placed a new order for Venille Sanitary Pads. Please find the order details below:
                </div>
                
                <div class="order-details">
                    <strong>Customer Name:</strong> ${payload.customerName}<br>
                    <strong>Customer Email:</strong> ${payload.customerEmail}<br>
                    <strong>Customer Phone:</strong> ${payload.customerPhone}<br> <br>
                    <strong>Quantity Ordered:</strong> ${payload.quantity}<br>
                    <strong>Delivery Method:</strong> ${payload.deliveryMethod}
                </div>
                
                <div class="message">
                    Please ensure prompt processing and delivery. If logistics support is required, notify the relevant team immediately.
                </div>
            </div>

            <div class="footer">
                <div class="social-links">
                    <a target="_blank" href="#">
                        <img title="Facebook" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/facebook-rounded-black.png" alt="Fb">
                    </a>
                    <a target="_blank" href="#">
                        <img title="X" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/x-rounded-black.png" alt="X">
                    </a>
                    <a target="_blank" href="#">
                        <img title="LinkedIn" src="https://fryrscb.stripocdn.email/content/assets/img/social-icons/rounded-black/linkedin-rounded-black.png" alt="In">
                    </a>
                </div>

                <p>For support, contact <strong><a href="mailto:support@venille.com.ng">support@venille.com.ng</a></strong></p>
                <p><strong><a href="https://venille.com.ng/privacy-policy">Privacy Policy</a></strong></p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};
