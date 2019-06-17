const Telegraf  = require('telegraf'),
    {rozclad} = require('./parse');

const bot = new Telegraf(process.env.SECRET_BOT_KEY);

bot.start((ctx) => ctx.reply('Welcome. Enter your group(XX-XX)'));
bot.hears( /.$/,(ctx) => rozclad(ctx.message.text)
    .then(([res1, res2]) => {
        ctx.reply(res1);
        ctx.reply(res2);
    })
    .catch(() => ctx.reply('Something went wrong. Check if group exists(XX-XX)')));

bot.telegram.setWebhook('https://js.hitrch.now.sh');

module.exports = bot.webhookCallback('/');