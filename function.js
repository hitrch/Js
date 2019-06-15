'use strict';

const request = require('request'),
    {JSDOM} = require('jsdom');

let url = 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';

function schedule(url){
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


const getGroupUrl = function getGroupUrl(url, group) {
    return JSDOM.fromURL(url).then(dom => {
        const document = dom.window.document;
        const formElement = document.getElementById('aspnetForm');
        const hiddenInputs = formElement.querySelectorAll('input[type="hidden"]');

        const form = {
            ctl00$MainContent$ctl00$txtboxGroup: group,
            ctl00$MainContent$ctl00$btnShowSchedule: "Розклад занять"
        };

        [...hiddenInputs].forEach(elem =>{ elem.value ? form[elem.name] = elem.value : console.log("Error")});

        return new Promise(resolve=>{
            request.post({
                url: url,
                form: form
            }, (err, res)=>{
                resolve(`http://rozklad.kpi.ua${res.headers.location}`)
            });
        });
    });
};

const rozclad = function rozclad(group){
    return getGroupUrl(url, group).then(groupUrl=>{
            return schedule(groupUrl)
        },
        error=>{
            throw (error)
        })
};

module.exports = {rozclad};