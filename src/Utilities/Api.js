import axios from 'axios';

const Post = (url, headers = {}, data = {}) =>
  axios.post(url, data, { headers });

const Delete = (url, data = {}, headers = {}) =>
  axios.delete(url, data, {
    headers,
  });

const Put = (url, data = {}, headers = {}) => axios.put(url, data, { headers });

export { Post, Delete, Put };
