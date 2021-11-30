import axios from 'axios';

const Post = (url, headers = {}, data = {}) =>
  axios.post(url, data, { headers });

const Delete = (url, data = {}, headers = {}) => {
  return axios.delete(url, data, {
    headers,
  });
};

export { Post, Delete };
