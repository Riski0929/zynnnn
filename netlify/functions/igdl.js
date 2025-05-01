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
    const api = `https://fastrestapis.fasturl.cloud/downup/igdown/advanced?url=${encodeURIComponent(url)}&type=detail`;
    const res = await axios.get(api);
    const data = res.data?.result;

    if (!data) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: false,
          creator: 'Kyy',
          code: 404,
          message: 'Media tidak ditemukan atau URL tidak valid'
        }, null, 2)
      };
    }

    const type = data.is_video ? 'video' : 'image';
    const result = {
      id: data.id,
      shortcode: data.shortcode,
      type,
      dimensions: data.dimensions,
      taken_at: data.taken_at_timestamp,
      caption: data.caption?.text || null,
      display_url: data.display_url,
      owner: {
        id: data.owner.id,
        username: data.owner.username,
        full_name: data.owner.full_name,
        is_verified: data.owner.is_verified,
        is_private: data.owner.is_private,
        avatar: data.owner.profile_pic_url
      },
      stats: {
        likes: data.like_count,
        comments: data.comment_count,
        views: data.video_view_count || null
      },
      media: type === 'video'
        ? data.video_url
        : (Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : (Array.isArray(data.display_resources)
              ? data.display_resources.map(r => r.src)
              : [data.display_url]))
    };

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
