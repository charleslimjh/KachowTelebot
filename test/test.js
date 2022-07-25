require("dotenv").config();

const { Telegraf, Markup } = require("telegraf");
const TelegrafTest = require('telegraf-test');
const util = require('util');

// Initialize bot and Firebase
const bot = new Telegraf(process.env.BOT_TOKEN, {
    telegram: {webhookReply: true}
  });
  
// Initialize telegraf test
const port = 2000
const secretPath = 'secret-path'
const test = new TelegrafTest({
    url: http://127.0.0.1:${port}/${secretPath}
})

test.setChat({
    id: // SET ID FROM ENV,
    first_name: '', // MORE OPTIONAL 
    username: '' // MORE OPTIONAL 
})
test.setBot(bot)

console.log("CHAT INFORMATION: " + util.inspect(test.getChat()) + "\n");
console.log("BOT INFORMATION: " + util.inspect(test.getBot()) + "\n");

// bot.startWebhook(/${secretPath}, null, port)

test.sendMessageWithText('/start')
  .then(res => {
        res_json = JSON.parse(res.config.data);
        console.log(res_json.message.text)
        console.log("STATUS: "+ res.statusText);
        console.log("\n");
  })
  .catch(error => {
        console.log("An error was detected!")
    console.error(error)
  })

test.sendMessageWithText('/help')
  .then(res => {
        res_json = JSON.parse(res.config.data);
        console.log(res_json.message.text)
        console.log("STATUS: "+ res.statusText);
        console.log("\n");
  })
  .catch(error => {
        console.log("An error was detected!")
    console.error(error)
  })


test.sendMessageWithText('/booking')
  .then(res => {
        res_json = JSON.parse(res.config.data);
        console.log(res_json.message.text)
        console.log("STATUS: "+ res.statusText);
        console.log("\n");
  })
  .catch(error => {
        console.log("An error was detected!")
    console.error(error)
  })

test.sendMessageWithText('/reminder')
  .then(res => {
        res_json = JSON.parse(res.config.data);
        console.log(res_json.message.text)
        console.log("STATUS: "+ res.statusText);
        console.log("\n");
  })
  .catch(error => {
        console.log("An error was detected!")
    console.error(error)
  })