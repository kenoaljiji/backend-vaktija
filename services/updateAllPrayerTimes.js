const { getAllUserPrayerSettings, savePrayerSettingsToFirebase } = require("./firebaseService");
const { calculatePrayerTimes, scrapePrayerTimes } = require("../server-backend");
const { slugifyCityName, VAKTIJA_LOCATIONS_BOSNIA } = require("./constants/locations");
const vaktija = require("../data/vaktija.json");
const moment = require('moment');

// Make vaktija available globally for calculatePrayerTimes
if (!global.vaktija) {
  global.vaktija = vaktija;
}

// Helper function to get location ID from city name for BIH
function getLocationIdForCity(city, country) {
  if (country !== 'Bosnia and Herzegovina') return null;
  
  // Try exact match first
  if (VAKTIJA_LOCATIONS_BOSNIA[city] !== undefined) {
    return VAKTIJA_LOCATIONS_BOSNIA[city];
  }
  
  // Try case-insensitive match
  const normalizedCity = city.toLowerCase().trim();
  const foundEntry = Object.entries(VAKTIJA_LOCATIONS_BOSNIA).find(
    ([cityName]) => cityName.toLowerCase().trim() === normalizedCity
  );
  
  return foundEntry ? foundEntry[1] : null;
}

// Helper function to format BIH prayer times from array to object
function formatBihPrayerTimes(timesArray) {
  if (!Array.isArray(timesArray) || timesArray.length < 6) {
    console.error('❌ Invalid BIH prayer times array:', timesArray);
    return null;
  }
  
  // Ensure times are properly formatted as strings in 24-hour format (HH:mm)
  const formatTime = (time) => {
    if (!time) return '';
    // If time is a number, convert it to HH:mm format
    if (typeof time === 'number') {
      const hours = Math.floor(time);
      const minutes = Math.round((time - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    // If time is already a string, ensure it's in HH:mm format
    if (typeof time === 'string') {
      // Handle cases like '2:49' -> '02:49'
      const [h, m] = time.split(':');
      if (h && m) {
        return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
      }
    }
    return time || '';
  };

  const formattedTimes = {
    fajr: formatTime(timesArray[0]),
    sunrise: formatTime(timesArray[1]),
    dhuhr: formatTime(timesArray[2]),
    asr: formatTime(timesArray[3]),
    maghrib: formatTime(timesArray[4]),
    isha: formatTime(timesArray[5]),
    date: moment().format('DD-MM-YYYY')
  };

  console.log('🔄 Converted BIH prayer times:', {
    input: timesArray,
    output: formattedTimes
  });

  return formattedTimes;
}

// Helper function to format non-BIH prayer times
function formatNonBihPrayerTimes(result) {
  if (!result?.data?.timings) {
    console.error('Invalid prayer times format for non-BIH country:', result);
    return null;
  }
  
  const { timings, date } = result.data;
  return {
    fajr: timings.Fajr || '',
    sunrise: timings.Sunrise || '',
    dhuhr: timings.Dhuhr || '',
    asr: timings.Asr || '',
    maghrib: timings.Maghrib || '',
    isha: timings.Isha || '',
    date: date || moment().format('DD-MM-YYYY')
  };
}

async function updateAllPrayerTimes() {
  const users = await getAllUserPrayerSettings();
  const now = new Date();

  for (const user of users) {
    const { token, deviceId, city, country, language, notifications, translations } = user;
    
    try {
      console.log(`\nProcessing user: ${city}, ${country} (${token})`);
      
      let prayerTimes;
      
      // Handle Bosnia and Herzegovina
      if (country === 'Bosnia and Herzegovina') {
        const locationId = getLocationIdForCity(city, country);
        if (locationId === null) {
          console.error(`❌ Failed to find location ID for city: ${city}`);
          continue;
        }
        
        console.log(`Fetching prayer times for ${city} (ID: ${locationId})`);
        const result = calculatePrayerTimes(
          locationId,
          now.getFullYear(),
          now.getMonth() + 1,
          now.getDate()
        );
        
        if (!result?.vakat) {
          console.error(`❌ Failed to get prayer times for ${city} (ID: ${locationId})`);
          continue;
        }
        
        prayerTimes = formatBihPrayerTimes(result.vakat);
      } 
      // Handle other countries
      else {
        const cityApi = slugifyCityName(city, country);
        console.log(`Scraping prayer times for ${city}, ${country}`);
        
        try {
          const result = await scrapePrayerTimes(language || 'bs', cityApi);
          prayerTimes = formatNonBihPrayerTimes(result);
        } catch (error) {
          console.error(`❌ Error scraping prayer times for ${city}, ${country}:`, error.message);
          continue;
        }
      }
      
      if (!prayerTimes) {
        console.error(`❌ Failed to format prayer times for ${city}, ${country}`);
        continue;
      }
      
      console.log(`✅ Successfully retrieved prayer times for ${city}, ${country}`);
      
      // Debug: Log the prayer times before saving
      console.log('📝 Prayer times to be saved:', {
        city,
        country,
        prayerTimes: JSON.stringify(prayerTimes, null, 2),
        hasFajr: !!prayerTimes.fajr,
        hasDhuhr: !!prayerTimes.dhuhr,
        hasAsr: !!prayerTimes.asr,
        hasMaghrib: !!prayerTimes.maghrib,
        hasIsha: !!prayerTimes.isha,
        prayerTimeKeys: Object.keys(prayerTimes || {})
      });
      
      // Save to Firebase
      await savePrayerSettingsToFirebase({
        token,
        deviceId,
        city,
        country,
        language: language || 'bs',
        prayerTimes,
        notifications: notifications || {},
        translations: translations || {},
        lastUpdated: new Date().toISOString()
      });
      
      console.log(`✅ Updated prayer times for ${city}, ${country}`);
      
    } catch (error) {
      console.error(`❌ Error processing ${city}, ${country}:`, error.message);
    }
  }
  
  console.log('\n✅ Completed updating all prayer times');
}

module.exports = { updateAllPrayerTimes };
