const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  const ip = event.headers['x-forwarded-for'] || 'unknown';

  const tmpPath = path.join('/tmp', 'ipdata.json');
  let data = [];

  if (fs.existsSync(tmpPath)) {
    data = JSON.parse(fs.readFileSync(tmpPath));
  }

  data.push({ ip, waktu: new Date().toISOString() });

  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'IP berhasil ditambahkan',
      ip,
      jumlah_ip: data.length,
    }),
  };
};
