var path = require('path');
var pg = require('pg');
var connectionString = require(path.join(__dirname, '../db', 'config'));

var client = new pg.Client(connectionString);
client.connect();

client.query("DROP TABLE IF EXISTS users");

client.query("CREATE TABLE IF NOT EXISTS users(id SERIAL, steamid bigint, avatar text, items text)");

client.query("CREATE TABLE IF NOT EXISTS items(id SERIAL, market_hash_name text, icon_url text, market_price integer)");

client.on('end', function() { client.end(); });
