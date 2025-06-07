const { getAllUserPrayerSettings, savePrayerSettingsToFirebase } = require("./firebaseService");
const { calculatePrayerTimes } = require("../server-backend");
const {scrapePrayerTimes} = require("../server-backend");
const { slugifyCityName } = require("./constants/locations");

async function updateAllPrayerTimes() {
  const users = await getAllUserPrayerSettings();

  for (const user of users) {
    const {
      token,
      deviceId,
      city,
      country,
      language,
      notifications,
      translations,
    } = user;

    let prayerTimes;

    try {
      if (country === 'Bosnia and Herzegovina') {
        const result = calculatePrayerTimes(city);
        if (!result) throw new Error('Invalid city for BIH');
        prayerTimes = result;
      } else {
        const cityApi = slugifyCityName(city, country);
        const result = await scrapePrayerTimes(language, cityApi);

        if (!result || result.error) {
          console.error(`✖ Failed scrape for ${city}:`, result?.message || result);
          continue;
        }

        const returnedCity = result.data.meta.city.toLowerCase();
        if (!returnedCity.includes(city.toLowerCase())) {
          console.warn(`⚠ Mismatch for ${token}: ${city} ≠ ${returnedCity}`);
          continue;
        }

        prayerTimes = {
          fajr: result.data.timings.Fajr,
          sunrise: result.data.timings.Sunrise,
          dhuhr: result.data.timings.Dhuhr,
          asr: result.data.timings.Asr,
          maghrib: result.data.timings.Maghrib,
          isha: result.data.timings.Isha,
          date: result.data.date,
        };
      }

      await savePrayerSettingsToFirebase({
        token,
        deviceId,
        city,
        country,
        language,
        notifications,
        prayerTimes,
        translations,
        lastUpdated: new Date()
      });

      console.log(`✔ Updated prayer times for ${token}`);

    } catch (error) {
      console.error(`✖ Error updating ${token}:`, error.message);
    }
  }
}

module.exports = { updateAllPrayerTimes };
