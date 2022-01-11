require('dotenv-flow').config();
const redis = require('redis');

const { REDIS_URL } = process.env;
const db = redis.createClient({ url: REDIS_URL });
db.on('error', (err) => console.error('Redis Client Error', err));
db.connect();

module.exports = db;
