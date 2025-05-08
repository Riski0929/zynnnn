const nodemailer = require('nodemailer')

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { to, subject, message } = body;

    if (!to || !subject || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: false, message: 'Semua field (to, subject, message) wajib diisi.' })
      };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Zynn Bot" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: true, message: 'Email berhasil dikirim.' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: false, message: 'Gagal mengirim email.', error: error.message })
    };
  }
};
