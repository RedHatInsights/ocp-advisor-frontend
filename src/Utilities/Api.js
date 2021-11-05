import axios from 'axios';

const Post = (url, headers = {}, data = {}) =>
  axios.post(url, data, { headers });

export { Post };
