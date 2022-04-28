import axios from 'axios';

/**
 * Simple wrapper around axios for issuing Eqivo RestAPI calls
 */
const client = axios.create({
    baseURL: process.env.EQIVO_BASE_URL,
    method: 'post',
    auth: {
        username: process.env.EQIVO_REST_AUTH_ID,
        password: process.env.EQIVO_REST_AUTH_TOKEN,
    },
    headers: {
        'content-type': 'application/x-www-form-urlencoded',
    },
});

export default client;
