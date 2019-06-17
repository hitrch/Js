'use strict';

const request = require('request'),
    {JSDOM} = require('jsdom');

let url = 'http://rozklad.kpi.ua/Schedules/ScheduleGroupSelection.aspx';

function schedule(url){
    return JSDOM.fromURL(url).then(dom => {
        const document = dom.window.document;
        let first = getWeekData('ctl00_MainContent_FirstScheduleTable', document);
        let second = getWeekData('ctl00_MainContent_SecondScheduleTable', document);
        const week = {
            1: 'Понеділок',
            2: 'Вівторок',
            3: 'Середа',
            4: 'Четвер',
            5: 'П\'ятниця',
            6: 'Суббота'
        };

        let firstWeek = [];
        let secondWeek = {};
        first = Array.from(first);
        second = Array.from(second);
        firstWeek = getReduce(first);
        secondWeek = getReduce(second);

        firstWeek = '=================\nПерший тиждень\n=================\n\n' +formatData(firstWeek, week);
        secondWeek = '=================\nДругий тиждень\n=================\n\n' + formatData(secondWeek, week);
        return new Promise(resolve => {
            resolve([firstWeek, secondWeek]);
        })
    })
}

function getReduce(table){
    return table.reduce(function (all, col, i) {
        if(i > 0)
        {
            let Row = Array.from(getRowData(col));
            let column = Row.reduce(function (tuple, day, j) {
                if(j > 0)
                {
                    let temp = {};
                    temp.number = i;
                    if(day.innerHTML !== '')
                    {
                        try{
                            if(day.getElementsByTagName('a')[1].innerHTML !== undefined)
                            {
                                temp.subject = day.getElementsByTagName('a')[0].innerHTML;
                                temp.teacher = day.getElementsByTagName('a')[1].innerHTML;
                                temp.classroom = day.getElementsByTagName('a')[2].innerHTML;

                                tuple.push(temp);
                            }else{
                                if(day.getElementsByTagName('a')[0].innerHTML !== undefined)
                                {
                                    temp.subject = day.getElementsByTagName('a')[0].innerHTML;
                                    tuple.push(temp);
                                }
                                else{
                                    temp.subject = day.innerHTML;
                                    tuple.push(temp);
                                }
                            }
                        }catch (e) {
                            temp.subject = day.getElementsByTagName('a')[0].innerHTML;
                            tuple.push(temp);
                        }
                    }else{
                        tuple.push(temp);
                    }
                }
                return tuple;
            }, []);
            all.push(column);
        }

        return all;
    }, []);
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

function formatData(data, week) {
    let result = '';
    try{
        for(let day = 0;day < data[0].length; day++){
            result += '--------------------\n' + week[+day + +1] +'\n--------------------\n\n';

            for(let lesson=0; lesson < data.length;lesson++)
            {
                if(data[lesson][day].subject !== undefined)
                {
                    result += data[lesson][day].number + '.' + data[lesson][day].subject + '\n';
                }else{
                    result += data[lesson][day].number + '.\n';
                }

                if(data[lesson][day].teacher !== undefined)
                {
                    result += 'Викладач: ' + data[lesson][day].teacher + '\n';
                    if(data[lesson][day].classroom !== undefined)
                    {
                        result += 'Аудиторія: ' + data[lesson][day].classroom + '\n\n' ;
                    }
                }
            }
        }
    }catch (e) {
        console.log(e);
    }
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
                resolve(`http://rozklad.kpi.ua${res.headers.location}`);
            });
        });
    });
};

const rozclad = function rozclad(group){
    return getGroupUrl(url, group).then(groupUrl=>{
            return schedule(groupUrl);
        },
        error=>{
            throw (error)
        })
};

module.exports = {rozclad};