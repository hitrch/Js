const Telegraf  = require('telegraf'),
    {rozclad} = require('./parse');

const bot = new Telegraf(process.env.SECRET_BOT_KEY);

bot.start((ctx) => ctx.reply('Welcome'));
bot.hears( /.$/,(ctx) => rozclad(ctx.message.text)
    .then(result => {ctx.reply(result)})
    .catch(() => ctx.reply('Something went wrong. Check if group exists')));

bot.launch();
//bot.telegram.setWebhook('https://js.hitrch.now.sh');

module.exports = bot.webhookCallback('/');