import axios from 'axios';

interface EmailRequest {
  sender: {
    name: string;
    email: string;
  };
  to: {
    email: string;
  }[];
  subject: string;
  htmlContent: string;
  attachment?: { url?: string; content: string; name: string }[];
}

async function sendEmail(config: {
  from_name?: string;
  from_email?: string;
  to_email: string;
  html: string;
  sub: string;
  attachment?: { url?: string; content: string; name: string }[];
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const emailRequest: EmailRequest = {
    sender: {
      name: process.env.MAIL_FROM_NAME ?? 'Medexer',
      email: process.env.MAIL_FROM_EMAIL,
    },
    to: [
      {
        email: config.to_email,
      },
    ],
    subject: config.sub,
    htmlContent: config.html,
    attachment: config.attachment,
  };

  try {
    // console.log('BREVO_API_KEY : ', process.env.BREVO_API_KEY);

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      emailRequest,
      {
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
      },
    );

    console.log('Email sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export default {
  sendEmail,
};
