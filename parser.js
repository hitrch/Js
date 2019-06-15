const Telegraf  = require('telegraf'),
    {rozclad} = require('./function');

const bot = new Telegraf(process.env.SECRET_BOT_KEY);
let url = 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';

bot.start((ctx) => ctx.reply('Welcome'));
bot.hears( /.$/,(ctx) => rozclad(ctx.message.text)
    .then(result=>{ctx.reply(result)})
    .catch(()=>ctx.reply('Something went wrong')));

bot.telegram.setWebhook('https://js.hitrch.now.sh');

module.exports = bot.webhookCallback('/');