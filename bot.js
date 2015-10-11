// == Require Our Stuff == //
var fs = require('fs');
var Steam = require('steam');
var SteamUser = require('steam-user');
var SteamTradeOffers = require('steam-tradeoffers');
//var getSteamAPIKey = require('steam-web-api-key');
var BackpackLogger = require('steam_backpack');
var winston = require('winston');
var randomstring = require('randomstring');
var express = require('express');
var body_parser = require('body-parser');
var FireBase = require("firebase");

// == setup winston logger interfaces == //
var logger = new (winston.Logger)({
	transports: [
	new (winston.transports.Console)({level : 'info', colorize: 'all', prettyPrint: true}),
	new (winston.transports.File)({filename: __dirname+'/logs/error.log', level: 'error'})
	]
});

// == define some constants for our app == //
var appid = {
	CSGO : 730,
	Steam : 753
};

var context = {
	CSGO : 2,
	Steam : 6
};

// == BOT INFO == //
var bot_info = {
	username : 'khoa_phan',
	password : 'snipego123$',
	api_key : '5763057DCDBBE10EEE1B2E26FEA61939',
	id : 1,
	name : "khoa_phan",
	port : process.env.PORT || 3017,
	sentry : function() {
		if(fs.existsSync(__dirname+'/sentry/ssfn/'+bot_info.username+'.ssfn')) {
			var sha = require('crypto').createHash('sha1');
			sha.update(fs.readFileSync(__dirname+'/sentry/ssfn/'+bot_info.username+'.ssfn'));
			return new Buffer(sha.digest(), 'binary');
		} else if(fs.existsSync(__dirname+'/sentry/'+bot_info.username+'_sentryfile.hash')) {
			return fs.readFileSync(__dirname+'/sentry/'+bot_info.username+'_sentryfile.hash');
		} else {
			return null;
		}
	}
};

// == db db_info and table whhere we will be storing our user data/backpack == //
var db_info = {
	firebaseRef : new FireBase("https://snipego.firebaseio.com/")
};

// == Define Our Core Objects == //
var bot = new SteamUser(new Steam.SteamClient);
var tradeoffers_api = new SteamTradeOffers();
var backpack_logger = new BackpackLogger({
	db_info : db_info,
	client : tradeoffers_api,
	bot_info : bot_info
});

// == define offer server == //
var offer_server = express();
offer_server.use( body_parser.json() ); // == to support JSON-encoded bodies == //
offer_server.use(body_parser.urlencoded({ extended: true})); // == To support URL-encoded bodies == //

// == if we have a updated server list use it == //
if(fs.existsSync('servers.json')) {
	bot.client.servers = JSON.parse(fs.readFileSync('servers.json'));
}

// == set steamUser options == //
bot.setOption('dataDirectory',null);
bot.setSentry(bot_info.sentry());

// == the lesser relavant events == //
bot.on('servers', function(servers){
	fs.writeFile('servers.json', JSON.stringify(servers));
});

bot.on('error', function(e) {
	// Some error occurred during logon
  logger.log('error', 'Our Bot errored out with the error code: '+ e.cause);
});

// == ok now let's login and get going == //
bot.logOn({
  accountName : bot_info.username,
  password : bot_info.password
});

bot.on('loggedOn', function(details) {
  logger.log('info', 'Bot login was successful');
});

bot.on('webSession', function(sessionID, cookies) {
	logger.log('info', "Got web session");
	tradeoffers_api.setup({
		sessionID: sessionID,
		webCookie: cookies,
		APIKey: bot_info.api_key
	}, function() {
		init_app();
	});
});

// == our main start funciton to run when steam is all set up == //
function init_app() {
  logger.log("info", 'Bot is now fully logged in');
  bot.friends.setPersonaState(Steam.EPersonaState.Online);

	// == init app can be called when we relogin and in that case we dont wanna start over our logger or offer server == //
	if(bot_info.state !== 'running') {
		backpack_logger.start();

		var offer_server_handle = start_offer_server();

		bot_info.state = 'running';

		// == in the event of fatal error== //

		//do something when app is closing
		process.on('exit', exitHandler.bind(null,{server_handle : offer_server_handle, cleanup: true, exit:true}));
		//catches ctrl+c event
		process.on('SIGINT', exitHandler.bind(null, {server_handle : offer_server_handle,cleanup: true, exit:true}));
		//catches uncaught exceptions
		process.on('uncaughtException', exitHandler.bind(null, {server_handle : offer_server_handle, exit:true}));
	}

}


// =============== the offer server and its command routes ================ //

function start_offer_server() {
	var offer_server_handle = offer_server.listen(bot_info.port, '127.0.0.1', 30);
	return offer_server_handle;
}

// == send a request to deposit items to inventory == //
offer_server.post('/add', function(req, resp) {
	console.log('CALLING BOT ADD METHOD 2', req.body, resp.body);
	var user_info = req.body;

	function send_deposit_offer() {
		logger.log("info", 'Sending trade offer to user : '+ user_info.id + ' trade_token : ' + user_info.trade_token);
		var protection_code = randomstring.generate(5).toUpperCase();

		tradeoffers_api.makeOffer({
			partnerSteamId : user_info.id,
			itemsFromMe : [],
			itemsFromThem : user_info.items,
			accessToken : user_info.trade_token,
			message : protection_code
		}, function(err, response) {
			if(err) {
				logger.log("info", err);
				resp.json({"error" : "There was an error sending your request. Please try again"});
				resp.end();
				make_offer_error(err);
				return;
			}

			// == tell the backpacklogger to watch this trade offer == //
			backpack_logger.que.push(response.tradeofferid);
			resp.json({"success": "trade offer sent. PROTECTION CODE : "+protection_code, "protection_code" : protection_code});
			resp.end();
		});
	}

	send_deposit_offer();
});

// [if we dont receive a route we can handle]
offer_server.all('*', function(req, resp) {
	resp.type('application/json');
	resp.json({"error" : "server error"});
	resp.end();
});


// ============================== UTILITY FUNCTIONS ====================================//

function make_offer_error(err) {
  err = String(err);

	// == cookies expired. just relogon == //
	if(err.indexOf("401") > -1) {
		bot.webLogOn();
	}
}

// ============================== Handle Fatal sudden termination ============================== //

function exitHandler(options, err) {
	process.stdin.resume(); // == so console dosnt close instantly == //

    if (options.cleanup) {
    	options.server_handle.close();
    	console.log('EXITING..........SHUTTING DOWN OFFER SERVER. OFFERS IN QUE', backpack_logger.que);
    }

    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}
