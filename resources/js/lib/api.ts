import axios from 'axios';

export const laravelApi = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const flaskApi = axios.create({
  baseURL: 'https://qmsopticore.com/flask',
  // baseURL: 'http://localhost:5000/',
  headers: {
    'Content-Type': 'application/json',
  },
});
