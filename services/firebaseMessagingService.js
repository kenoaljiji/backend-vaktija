const admin = require("firebase-admin");
const moment = require("moment");
const { getAllUserPrayerSettings } = require("./firebaseService");

// Helper: određuje sljedeći namaz
function getNextPrayer(current, times) {
  const order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const nowIndex = order.indexOf(current);
  for (let i = nowIndex + 1; i < order.length; i++) {
    if (times[order[i]]) {
      return { name: order[i], time: times[order[i]] };
    }
  }
  return { name: "fajr", time: times["fajr"] };
}

// Glavna funkcija
async function sendPrayerNotifications() {
  console.log('pokrece se');
  const now = moment();
  const users = await getAllUserPrayerSettings();

  for (const user of users) {
    const {
      prayerTimes,
      notifications,
      translations,
      token,
      language,
    } = user;

    if (!prayerTimes || !notifications || !token) continue;

    for (const [prayerName, prayerTime] of Object.entries(prayerTimes)) {
      const userSettings = notifications[prayerName];
      if (!userSettings?.enabled) continue;

      // Parsiraj sat i minut iz prayerTime (npr. "03:36")
      const [hour, minute] = prayerTime.split(':').map(Number);

      // Kreiraj moment za danas sa satom i minutom iz prayerTime, pa oduzmi 5 minuta
      const prayerMoment = moment(now).hour(hour).minute(minute).second(0).subtract(5, 'minutes');

      console.log(`➤ Usporedba za ${prayerName}:`);
      console.log(`   prayerTime: ${prayerTime}`);
      console.log(`   prayerMoment -5min: ${prayerMoment.format("HH:mm")}`);
      console.log(`   now:          ${now.format("HH:mm")}`);

      // Izračunaj razliku u minutama između sada i trenutka za molitvu
      const diffMinutes = now.diff(prayerMoment, 'minutes');

      // Ako je sada unutar minute kada treba poslati notifikaciju
      if (diffMinutes >= 0 && diffMinutes < 1) {
        const nextPrayer = getNextPrayer(prayerName, prayerTimes);

        const title =
          `${translations?.timeFor || "Vrijeme za"} ` +
          `${translations?.[prayerName] || prayerName} ` +
          `${translations?.prayerAt || "u"} ${prayerTime}`;

        const body =
          `${translations?.nextPrayerIs || "Sljedeći namaz je"} ` +
          `${translations?.[nextPrayer.name] || nextPrayer.name} ` +
          `${translations?.prayerAt || "u"} ${nextPrayer.time}`;

        const message = {
          token,
          notification: {
            title,
            body,
          },
          data: {
            prayerName,
            prayerTime,
            nextPrayerName: nextPrayer.name,
            nextPrayerTime: nextPrayer.time,
            sound: userSettings.sound || "default",
          },
        };

        try {
          await admin.messaging().send(message);
          console.log(`✔ Sent notification for ${prayerName} to ${token}`);
        } catch (error) {
          console.error(`✖ Error sending to ${token}:`, error.message);
        }
      }
    }
  }
}


module.exports = { sendPrayerNotifications };
