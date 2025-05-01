// Ambil IP dari memory global
let ipList = global.ipList || [];
global.ipList = ipList;

exports.handler = async () => {
  try {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: true,
        ipList
      }, null, 2)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: false, message: `Error: ${e.message}` }, null, 2)
    };
  }
};
