const   //http = require('http'),
    request = require('request'),
    cheerio = require('cheerio'),
    TelegramBot = require('node-telegram-bot-api');

const token = '662101909:AAEEPKpvBZ8e648LQ7fQ40Udi9TqGIcTo58';
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (message)=>{
    request({uri:'http://rozklad.kpi.ua/Schedules/ViewSchedule.aspx?g=894be0b0-9c4b-492e-a3d0-a6950cb1a3e1', method:'GET'},
        function (err, res, page) {
//Передаём страницу в cheerio

            let roz = '';
            const $ = cheerio.load(page,  { decodeEntities: false });

            let rozclad = [];

            $('td').each(function(index) {
                if (index % 7 != 0) rozclad.push($(this).text());
            });

            //console.log('Перший тиждень');
            roz = roz+'Перший тиждень \r\n';


            for(let j = 0; j < 6;j++){
                for (let i = 0; i < rozclad.length / 2; i++){
                    if (i % 6 == j) roz = roz + Math.floor(i / 6) + '. ' + rozclad[i] + '\r\n';
                }
            }

            roz = roz +'\r\n\r\n\r\nДругий тиждень\r\n';

            for(let j=0;j<6;j++) {
                for (let i = rozclad.length / 2; i < rozclad.length; i++) {
                    if (i % 6 == j) roz = roz + Math.floor(i / 6 - 6) + '. ' + rozclad[i] + '\r\n';
                }
            }

            bot.sendMessage(message.from.id, roz);
        });

});