const   request = require('request'),
    TelegramBot = require('node-telegram-bot-api'),
    { JSDOM } = require('jsdom');
const {SECRET_BOT_KEY} = require('./secret');

const token = SECRET_BOT_KEY;
const bot = new TelegramBot(token, {polling: true});

/*request({
    headers: {
        'Content-Type': 'application/json'
    },
    uri: "http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx",
    body: JSON.stringify({
        ctl00_ToolkitScriptManager_HiddenField: ';;AjaxControlToolkit, Version=3.5.60623.0, Culture=neutral, PublicKeyToken=28f01b0e84b6d53e::834c499a-b613-438c-a778-d32ab4976134:22eca927:ce87be9:2d27a0fe:23389d96:77aedcab:1bd6c8d4:7b704157',
        __VIEWSTATE: '/wEMDAwQAgAADgEMBQAMEAIAAA4BDAUDDBACAAAOAgwFBwwQAgwPAgEIQ3NzQ2xhc3MBD2J0biBidG4tcHJpbWFyeQEEXyFTQgUCAAAADAUNDBACAAAOAQwFAQwQAgAADgEMBQ0MEAIMDwEBBFRleHQBG9Cg0L7Qt9C60LvQsNC0INC30LDQvdGP0YLRjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAF2sFgY4y5OMotjUisdjX6wYSpvo',
        __EVENTTARGET: '',
        __EVENTARGUMENT: '',
        ctl00$MainContent$ctl00$txtboxGroup: 'ІС-72',
        ctl00$MainContent$ctl00$btnShowSchedule: 'Розклад занять',
        __EVENTVALIDATION: '/wEdAAEAAAD/////AQAAAAAAAAAPAQAAAAUAAAAIsA3rWl3AM+6E94I5Tu9cRJoVjv0LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANf3SW/O93GGq9Au1Jvd6rjtsQXg',
        hiddenInputToUpdateATBuffer_CommonToolkitScripts: '1',
    }),
    method: 'POST'
}, function (err, res) {
    if (err) {
        console.error(err);
        return;
    }
    url = 'http://' + this.uri.host + res.headers.location;
});*/

let url = 'http://rozklad.kpi.ua/Schedules/ViewSchedule.aspx?g=894be0b0-9c4b-492e-a3d0-a6950cb1a3e1';


bot.on('message', (message)=>{
    rozclad(url).then(roz =>{
        bot.sendMessage(message.from.id, roz);
    });
});

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