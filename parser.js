const Telegraf  = require('telegraf'),
    {JSDOM} = require('jsdom');

const options = {
    webHook: {
        port: process.env.PORT
    }
};

const bot = new Telegraf(process.env.SECRET_BOT_KEY, options);
let url = 'http://rozklad.kpi.ua/Schedules/ViewSchedule.aspx?g=894be0b0-9c4b-492e-a3d0-a6950cb1a3e1';


bot.hears(/^[А-ЯІа-яі]{2}-[1-9а-яі]{2,5}$/, (ctx) => rozclad(url)
    .then(result=>{ctx.reply(result)})
    .catch(()=>ctx.reply('Something went wrong')));


function rozclad(url){
    return JSDOM.fromURL(url).then(dom => {
        const document = dom.window.document;
        const first = getWeekData('ctl00_MainContent_FirstScheduleTable', document);
        const second = getWeekData('ctl00_MainContent_SecondScheduleTable', document);
        const week = {
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday'
        };

        let firstWeek = {};
        let secondWeek = {};
        Object.keys(first).forEach(row=>{
            if(row>0) {
                const firstRow = getRowData(first[row]);
                const secondRow = getRowData(second[row]);

                Object.keys(week).forEach(day=>{
                    if (firstWeek[week[day]] === undefined) {
                        firstWeek[week[day]] = [];
                        secondWeek[week[day]] = [];
                    }
                    try {
                        let temp = {};
                        const firstLength = firstRow[day].getElementsByTagName('a').length;
                        const secondLength = secondRow[day].getElementsByTagName('a').length;

                        temp.number = row;
                        temp.name = firstRow[day].getElementsByTagName('a')[0].innerHTML;
                        temp.teacher = firstRow[day].getElementsByTagName('a')[1].innerHTML;
                        temp.classroom = firstRow[day].getElementsByTagName('a')[firstLength-1].innerHTML;
                        firstWeek[week[day]].push(temp);

                        temp.name = secondRow[day].getElementsByTagName('a')[0].innerHTML;
                        temp.teacher = secondRow[day].getElementsByTagName('a')[1].innerHTML;
                        temp.classroom = secondRow[day].getElementsByTagName('a')[secondLength-1].innerHTML;
                        secondWeek[week[day]].push(temp);
                    }
                    catch(err){
                        //
                    }
                });
            }
        });
        const result = '=================\nFIRST WEEK\n=================\n\n' +formatData(firstWeek)+
            '\n=================\nSECOND WEEK\n=================\n\n' + formatData(secondWeek);
        return new Promise(resolve => {
            resolve(result);
        })
    })
}

function getRowData (document) {
    if (document.getElementsByTagName('td') === null) {
        throw "Error";
    }
    return document.getElementsByTagName('td');
}

function getWeekData (id, document) {
    if(document.getElementById(id) === null || document.getElementById(id).getElementsByTagName('tr') === null){
        throw "Error";
    }
    return document.getElementById(id).getElementsByTagName('tr');
}

function formatData(data) {
    let result = '';
    Object.keys(data).forEach(day=>{
        result += '--------------------\n' + day +'\n--------------------\n\n';
        Object.keys(data[day]).forEach(lesson=>{
            result += data[day][lesson].number + '.' + data[day][lesson].name + '\n';
            result += 'Teacher: ' + data[day][lesson].teacher + '\n';
            result += 'Classroom: ' + data[day][lesson].classroom + '\n\n' ;
        });
    });
    return result;
}

bot.telegram.setWebhook('https://js-git-scrapper.hitrch.now.sh');

module.exports = bot.webhookCallback('/');