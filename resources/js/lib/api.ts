import axios from 'axios';

export const laravelApi = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(import.meta.env.VITE_APP_URL);

export const flaskApi = axios.create({
  baseURL: 'https://qmsopticore.com/flask',
  headers: {
    'Content-Type': 'application/json',
  },
});
