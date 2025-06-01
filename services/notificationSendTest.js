const admin = require('firebase-admin');
const path = require('path');

// 🔐 Učitaj service account ključ
const serviceAccount = require(path.join(__dirname, 'firebaseServiceAccount.json'));

// 🔧 Inicijalizuj Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🔁 Tvoj FCM token
const testDeviceToken = 'd8hH3LIRRfe6yCTmrqIMNF:APA91bEDjFiNuWlRY4sl5lK_mumWaN1PSoJRmPB4eaiSuJIMdf1UywW__V5sm7gcWeKFca96qW0wHdO-8j9p5yKrxrdMaaXDije5o0ngPvISG3P5rkjkdqs';

// 📬 Poruka koja će biti poslana
const message = {
  token: testDeviceToken,
  notification: {
    title: '🔔 Test Notifikacija',
    body: 'Ovo je test poruka poslana iz Node.js 🚀',
  },
  data: {
    customKey: 'customValue',
  },
};

// 🚀 Pošalji poruku
admin
  .messaging()
  .send(message)
  .then((response) => {
    console.log('✅ Notifikacija poslana! Response:', response);
  })
  .catch((error) => {
    console.error('❌ Greška pri slanju:', error);
  });
