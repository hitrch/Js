const Telegraf  = require('telegraf'),
    {rozclad} = require('./parse');


const admin = require("firebase-admin");
const serviceAccountKey = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    databaseURL: "https://rozklad-fa3f9.firebaseio.com"
});
const db = admin.firestore();

let groupRef = db.collection('groups');

const bot = new Telegraf(process.env.SECRET_BOT_KEY);

bot.start((ctx) => ctx.reply('Welcome. Enter your group(XX-XX)'));
bot.hears( /.$/,(ctx) => {
    let group = ctx.message.text.toLowerCase();
    let isGroup = checkGroup(group);
    isGroup.then(data => {
        if(data !== undefined)
        {
            ctx.reply(data.week1).then(() => {
                ctx.reply(data.week2);
            });
        }else{
            rozclad(group)
                .then(([res1, res2]) => {
                    ctx.reply(res1).then(() => {
                        ctx.reply(res2);
                    });
                    saveGroup(group, res1, res2);
                })
                .catch(() => ctx.reply('Something went wrong. Check if group exists(XX-XX)'));
        }
    });

});

function checkGroup(group){
    return db.collection('groups').doc(group).get()
        .then((doc) => {
            return doc.data();
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });

}

function saveGroup(group, res1, res2){
    let setGroup = groupRef.doc(group).set({
        'week1' : res1,
        'week2' : res2
    });
}


bot.telegram.setWebhook('https://js.hitrch.now.sh');

module.exports = bot.webhookCallback('/');