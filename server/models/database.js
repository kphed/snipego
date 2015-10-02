var path = require('path');
var pg = require('pg');
var connectionString = require(path.join(__dirname, '../db', 'config'));

var client = new pg.Client(connectionString);
client.connect();

var createTableUsers = client.query("CREATE TABLE IF NOT EXISTS users(id SERIAL, steamid bigint, avatar text, item_ids bigint[])");

createTableUsers.on('end', function() { client.end(); });
