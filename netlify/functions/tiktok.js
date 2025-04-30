const axios = require('axios');

exports.handler = async (event, context) => {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return {
      statusCode: 406,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 406,
        message: 'masukan parameter url'
      }, null, 2)
    };
  }

  try {
    function formatNumber(integer) {
      let numb = parseInt(integer);
      return Number(numb).toLocaleString().replace(/,/g, '.');
    }

    function formatDate(n, locale = 'id-ID') {
      let d = new Date(n * 1000);
      return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      });
    }

    const domain = 'https://www.tikwm.com/api/';
    const response = await axios.post(domain, {}, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.tikwm.com/'
      },
      params: {
        url: url,
        hd: 1
      }
    });

    const resTik = response.data?.data;
    if (!resTik || Object.keys(resTik).length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: false,
          creator: 'Kyy',
          code: 404,
          message: 'Video tidak ditemukan atau url tidak valid'
        }, null, 2)
      };
    }

    let type = 'video';
    let result = {
      id: resTik.id,
      title: resTik.title,
      region: resTik.region,
      taken_at: formatDate(resTik.create_time),
      cover: resTik.cover,
      music_info: {
        id: resTik.music_info.id,
        title: resTik.music_info.title,
        author: resTik.music_info.author,
        album: resTik.music_info.album || null,
        url: resTik.music || resTik.music_info.play
      },
      stats: {
        views: formatNumber(resTik.play_count),
        likes: formatNumber(resTik.digg_count),
        comment: formatNumber(resTik.comment_count),
        share: formatNumber(resTik.share_count),
        download: formatNumber(resTik.download_count)
      },
      author: {
        id: resTik.author.id,
        fullname: resTik.author.unique_id,
        nickname: resTik.author.nickname,
        avatar: resTik.author.avatar
      }
    };

    if (!resTik.size && !resTik.wm_size && !resTik.hd_size && resTik.images) {
      type = 'image';
      result.images = resTik.images;
    } else {
      result.duration = resTik.duration + ' Seconds';
      result.video = {
        watermark: resTik.wmplay,
        nowatermark: resTik.play,
        nowatermark_hd: resTik.hdplay
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: true,
        creator: 'Kyy',
        type,
        result
      }, null, 2)
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: false,
        creator: 'Kyy',
        code: 500,
        message: `Terjadi kesalahan: ${e.message}`
      }, null, 2)
    };
  }
};
