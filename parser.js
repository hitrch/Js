const Telegraf  = require('telegraf'),
    {rozclad} = require('./function');

const options = {
    webHook: {
        port: process.env.PORT
    }
};

const bot = new Telegraf(process.env.SECRET_BOT_KEY, options);

let url = 'http://rozklad.kpi.ua/Schedules/ViewSchedule.aspx?g=894be0b0-9c4b-492e-a3d0-a6950cb1a3e1';

bot.start((ctx) => ctx.reply('Welcome'));
bot.hears( '',(ctx) => rozclad(url)
    .then(result=>{ctx.reply(result)})
    .catch(()=>ctx.reply('Something went wrong')));

bot.telegram.setWebhook('https://js.hitrch.now.sh');

module.exports = bot.webhookCallback('/');