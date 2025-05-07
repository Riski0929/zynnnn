const axios = require('axios');

exports.handler = async (event) => {
  try {
    const { id, message } = JSON.parse(event.body);

    if (!id || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ status: false, message: 'id dan message harus diisi' })
      };
    }

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    const res = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: id,
      text: message
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ status: true, result: res.data })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: false, message: err.message })
    };
  }
};
