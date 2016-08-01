/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    SLACK_TOKEN=<MY TOKEN> node slack_bot.js

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

require('dotenv').config();

if (!process.env.SLACK_BOT_WEBHOOK) {
    console.log('Error: Specify slack token in .env file');
    process.exit(1);
}

// Persistent datastore with automatic loading
var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db', autoload: true });
// You can issue commands right away


var Botkit = require('botkit');
var os = require('os');

var options = {};
if (process.env.DEBUG === 'true') {
    options.debug = true;
}
var controller = Botkit.slackbot(options);

var bot = controller.spawn({
    token: process.env.SLACK_BOT_WEBHOOK
}).startRTM();

// Run a simple web server for slack commands

controller.hears(['add (.*) to (the )?(.*) list'], 'direct_message', function (bot, message) {
    var user = message.user;
    var team = message.team;
    var item = message.match[1];
    var list = message.match[3].toLowerCase();
    var doc = {
        item: item,
        list: list,
        user: user,
        team: team
    };
    db.insert(doc, function (err, newDoc) {
        db.find({list: list}, function (err, docs) {
            bot.reply(message, 'Here is the ' + list + ' list: ' + docs.map(function (elem) {
                return elem.item;
            }).join(', '));
        });
    });
});

controller.hears(['remove (.*) from (the )?(.*) list'], 'direct_message', function (bot, message) {
    var item = message.match[1];
    var list = message.match[3].toLowerCase();
    var user = message.user;
    var team = message.team;
    var doc = {
        item: item,
        list: list,
        user: user,
        team: team
    };
    db.remove(doc, function (err, newDoc) {
        db.find({list: list}, function (err, docs) {
            bot.reply(message, 'Here is the ' + list + ' list: ' + docs.map(function (elem) {
                return elem.item;
            }).join(', '));
        });
    });
});

controller.hears(['show me (the )?(.*) list'], 'direct_message', function (bot, message) {
    var list = message.match[2].toLowerCase();
    var user = message.user;
    var team = message.team;
    db.find({list: list, user: user, team: team}, function (err, docs) {
        bot.reply(message, 'Here is the ' + list + ' list: ' + docs.map(function (elem) {
            return elem.item;
        }).join(', '));
    });
});

controller.hears('(.*)', 'direct_message', function (bot, message) {
    console.log(message);
});
