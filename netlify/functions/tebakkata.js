const axios = require('axios');

exports.handler = async () => {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/nazedev/database/refs/heads/master/games/tebakkata.json');
    const data = res.data;

    if (!Array.isArray(data) || data.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          status: false,
          message: 'Data tebakkata kosong atau tidak valid'
        }, null, 2)
      };
    }

    const random = data[Math.floor(Math.random() * data.length)];

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: true,
        creator: 'Kyy',
        result: {
          index: random.index,
          soal: random.soal,
          jawaban: random.jawaban
        }
      }, null, 2)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: false,
        message: `Gagal mengambil data: ${e.message}`
      }, null, 2)
    };
  }
};
