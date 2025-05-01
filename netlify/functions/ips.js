const fs = require('fs');
const path = require('path');

exports.handler = async () => {
  const filePath = path.join('/tmp', 'ipdata.json');

  if (!fs.existsSync(filePath)) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Belum ada data IP',
        data: [],
      }),
    };
  }

  const data = JSON.parse(fs.readFileSync(filePath));

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Daftar IP berhasil diambil',
      data,
    }),
  };
};
