export const girlified_smart_pad_medical_report_email_html_content = (
  markdownContent: string,
) => {
  // 2) Wrap in your styled template
  return `<!DOCTYPE html>
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
      margin: 0; padding: 0;
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
      color: #1C3B4E;
      line-height: 1.6;
    }
    .content h1, .content h2, .content h3 {
      color: #1C3B4E;
    }
    .content a {
      color: #0066CC;
      text-decoration: none;
    }
    .footer {
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #777777;
    }
    @media only screen and (max-width: 600px) {
      .wrapper { padding: 0; }
      .container { border-radius: 0; }
      .content { padding: 15px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="content">
        ${markdownContent}
      </div>
      <div class="footer">
        <p>For assistance, contact <a href="mailto:support@venille.com.ng">support@venille.com.ng</a></p>
        <p><a href="#">Privacy Policy</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
