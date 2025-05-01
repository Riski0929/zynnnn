const axios = require('axios');
const fs = require('fs'); // Menggunakan file untuk menyimpan data IP

// Fungsi untuk menyimpan IP ke file
const saveIp = (ip) => {
  const filePath = './ips.json';  // File tempat menyimpan IP
  let ips = [];
  
  // Cek apakah file sudah ada
  if (fs.existsSync(filePath)) {
    ips = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  // Simpan IP baru jika belum ada
  if (!ips.includes(ip)) {
    ips.push(ip);
    fs.writeFileSync(filePath, JSON.stringify(ips, null, 2));  // Simpan IP ke file
  }
};

exports.handler = async (event, context) => {
  try {
    const ip = event.headers['x-forwarded-for']?.split(',')[0] || 'Unknown';
    
    // Simpan IP yang datang
    saveIp(ip);

    // Ambil info IP dari ipinfo.io
    const { data } = await axios.get(`https://ipinfo.io/${ip}?token=bf2e607b007c45`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: true,
        result: {
          ip: data.ip,
          region: data.region,
          city: data.city,
          country: data.country,
          loc: data.loc,
          org: data.org
        }
      }, null, 2)
    };
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
