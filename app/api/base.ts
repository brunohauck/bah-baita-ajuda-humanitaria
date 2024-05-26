import axios from 'axios';
// import {API_BASE_URL} from '@env';

const URL = 'https://backend.startdev.net';

export const api = axios.create({
  baseURL: URL + '/data/user/',
  headers: { 'Content-Type': 'application/json' }
});

