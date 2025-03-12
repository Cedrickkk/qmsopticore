import axios from 'axios';

export const laravelApi = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const flaskApi = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
