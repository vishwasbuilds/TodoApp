// Shared Axios client for requests to the backend API.
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api'; // Android emulator -> host PC

const api = axios.create({ baseURL: API_URL, timeout: 12000 });

export default api;
