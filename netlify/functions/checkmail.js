const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');

exports.handler = async function(event, context) {
  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email dan password wajib dikirim di body request.' })
      };
    }

    const config = {
      imap: {
        user: email,
        password: password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 5000
      }
    };

    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: ['HEADER', 'TEXT'],
      markSeen: false,
      struct: true
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    const last5 = messages.slice(-5).reverse();

    const results = [];

    for (let msg of last5) {
      const all = msg.parts.find(part => part.which === 'TEXT');
      const raw = all.body;

      const parsed = await simpleParser(raw);
      results.push({
        from: parsed.from.text,
        subject: parsed.subject,
        date: parsed.date,
        text: parsed.text
      });
    }

    connection.end();

    return {
      statusCode: 200,
      body: JSON.stringify(results, null, 2)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Gagal mengambil email atau kredensial salah.' })
    };
  }
};
