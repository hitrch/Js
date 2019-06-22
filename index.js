const Telegraf  = require('telegraf'),
    {rozclad} = require('./parse');


const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(
        {
            "type": "service_account",
            "project_id": "rozklad-fa3f9",
            "private_key_id": "6c46948dcf2cb8ccc40a535dda39d79faeae8503",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9Owq+Y4Vyt4pE\nra5JsyRgIkxcpkiOEbd7p1oGmItiun60HZv1FTR+cHmOlEStJHfQBqcUSB/nsvPo\nOBzJzpnhAb+x9dkun2EZVkSTXabspHIVSVXv0xNxrQI0ZxJns+2MT3h+OPa15WzI\nhJt0cgvYyCk9QgBn0qyBiMJFM/IrxVXapqVsx4/2D0mKB7cahC89z2VyEx9cbQEL\nyocp/UjH2dTO1QVNrO1l8oB2/g+rUeH3fA1K4W2VsA6rT4RtRUzrewjT2rs8MurT\n+DfFm6a8JhPlzn3Hik22FAjQYo7tcP2vwjHMCOIdN7xb6ge/Mg3mqO1p61xQxFsb\n77o/dPifAgMBAAECggEAKi9JW9wv2b0U8+6MFh37k/rRby4aqqFEeCp8pU/IcwAE\nUv7uz5okk7NbRe/Dx52DoDp7cMgLZMm+Ghy4PjzyjPio1XFrMzuQl+dlbjzIg6S9\nUgWBRO+XPBZHkYsQzVGNOWRWBj2IslAtCh6V0UXDYlZs6x0Vng+XKWFlfavw5tS6\n7zxCIN8+SjFUxRtyML62sUcqHq7c9RZh/CS7Csfef4Me+X06EUzE8Xk78LJMtjIC\n7BErS2Zto5U0sNY2Lz4wKR+dQGFVrj8dRMR1+xi5w7ilQlpIox3Y3epJLt1psBUS\niVL5hL/HI/MHaHMEzA+sM8XtzSUqRyEx1XAdgqE3gQKBgQDl28fdjs/ENtDWeQhf\nBokKgyTpz7dphcGh2x3jnyYnZUn0NCvglCdGjffKdQhoPvyU8+Pebh/Rz83iTKIU\nVnfbMa/I4JZ7gR6D90ipR9KnmGmGx4cHpJd963m5yyFWeCzIDstF7zwxvXwHurKM\nAcs/hrwX1J210vau9GVEUhHVvwKBgQDSwGZp/4Q73T+ovzMm8Txw83m/IfAhSSvc\ndwf6ou9b2Z1lYIS0d8yK37iXoBN8uvXa6GX5uZOTrXFTRLqPx2Kaon5JGNLy9KTU\nIgItq9I7uUOhbTUUsDRPZH96+y/COhAfXlqAxXjmRvQsa8QzP7lL1/w57otxo6Aq\n+Cle7NBVIQKBgQCBMRVV5uXJ79FTKnXVCxRNT0aZD8GT0rTxZvmWrSXBsMFvOz+K\nG1sz4alrJnpSNUy735SsuRKzV2vtjIrwiWUWUwftDKYnxnvDSmKRmqfAwP5W3aB8\nYDsxb/9buNsFAciRrRb9OKiJgGnM4ldmL7/v9aeUcVEvF+LElOKyErqpewKBgA/Y\n59qQnCDkQiUuO2pyOVlE9aKpqqTWG7Y4PSFbnyQI+QzmdRQc7gSDTh4Yq151sIcF\ncqWUjsRMBnl8cYreM0vtbBGTDEm4m6xX4lIM2YIkLDG3RIaJuWU+6VcWDEFOnGe/\ncI6+SpkGPNYaRGaWJBjP5Od2SIYDB8gzYOkCZagBAoGAUP30Xov6F9iXZ3pdE6lM\nNF0Vurp83BUFYQfPzwT1mJNP44l6kZBO+Evt495rIKO68tHwqRvxXof/A1L1+r0L\nzDnSmE0OMxHY4C1+wYjTWRE35442/cl8vEOv8Ntn5jr3NNfY3JbpB2bSZd1ldggV\nAnBGOCuwp03auq7NEAHmh2k=\n-----END PRIVATE KEY-----\n",
            "client_email": "firebase-adminsdk-10eyt@rozklad-fa3f9.iam.gserviceaccount.com",
            "client_id": "113233140440622237598",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-10eyt%40rozklad-fa3f9.iam.gserviceaccount.com"
        }
    ),
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