const Telegraf  = require('telegraf'),
    {rozclad} = require('./parse');


const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert({
        "type": process.env.FIREBASE_TYPE,
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY,
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": process.env.FIREBASE_AUTH_URI,
        "token_uri": process.env.FIREBASE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
    }),
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