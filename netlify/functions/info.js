exports.infoHandler = async (event, context) => {
  try {
    const filePath = './ips.json';
    if (fs.existsSync(filePath)) {
      const ips = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: true,
          ipList: ips
        }, null, 2)
      };
    } else {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: false,
          message: 'Tidak ada IP yang tercatat'
        }, null, 2)
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: false,
        message: `Terjadi kesalahan: ${e.message}`
      }, null, 2)
    };
  }
};
