// Shared Axios client for requests to the backend API.
import axios from 'axios';

const API_URL = 'https://todoapp-qv5g.onrender.com/api';

const api = axios.create({ baseURL: API_URL, timeout: 12000 });

export default api;
