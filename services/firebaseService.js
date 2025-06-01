// firebaseService.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // koristimo admin.firestore(), ne getFirestore()

// Spremi postavke u Firestore
async function savePrayerSettingsToFirebase(data) {
    const id = data.deviceId || `${data.city}-${data.country}`.replace(/\s+/g, '-');
    await db.collection('prayerSettings').doc(id).set(data);
  }

// Dohvati sve postavke iz Firestore
async function getAllUserPrayerSettings() {
  const snapshot = await db.collection('prayerSettings').get();
  const settings = [];

  snapshot.forEach(doc => {
    settings.push({ id: doc.id, ...doc.data() });
  });

  return settings;
}

module.exports = {
  getAllUserPrayerSettings,
  savePrayerSettingsToFirebase,
};
