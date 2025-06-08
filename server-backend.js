const express = require("express");
const compression = require("compression");
const path = require("path");
const port = process.env.PORT || 8080;
const vaktija = require("./data/vaktija.json");
const app = express();
const moment = require("moment");
const NodeCache = require("node-cache");
// Add a new function to scrape prayer times from vaktija.eu
const puppeteer = require('puppeteer');
const { savePrayerSettingsToFirebase, getAllUserPrayerSettings } = require("./services/firebaseService");
const { sendPrayerNotifications } = require("./services/firebaseMessagingService");
const { slugifyCityName } = require("./constants/locations");
const cron = require("node-cron");
const { VAKTIJA_LOCATIONS_BOSNIA } = require("./constants/locations");

require("moment-timezone");
require("moment-duration-format")(moment);
require("moment/locale/bs");

// Create a cache with TTL of 3600 seconds (1 hour)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

// Enable CORS for API requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(compression());
app.use(express.json());


// Global browser instance for reuse
let browser;

const initBrowser = async () => {
  if (browser) return browser;

  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  });

  return browser;
};

// Add a debug endpoint to check date calculations
app.get("/debug/date", (req, res) => {
  const currentDate = moment().tz("Europe/Sarajevo");
  const now = new Date();
  
  const response = {
    currentMomentDate: currentDate.format("YYYY-MM-DD HH:mm:ss"),
    currentMomentDay: currentDate.date(),
    currentMomentMonth: currentDate.month() + 1,
    currentMomentYear: currentDate.year(),
    jsDate: now.toISOString(),
    jsDateLocal: now.toString(),
    nodeEnv: process.env.NODE_ENV,
    timezone: process.env.TZ || 'not set'
  };
  
  res.json(response);

});

// Helper function to get location ID from city name
function getLocationId(cityOrId) {
  // If it's already a number or numeric string, convert to number
  if (!isNaN(cityOrId)) {
    return Number(cityOrId);
  }
  
  // If it's a city name, look up the ID
  if (typeof cityOrId === 'string') {
    // Try exact match first
    if (VAKTIJA_LOCATIONS_BOSNIA[cityOrId] !== undefined) {
      return VAKTIJA_LOCATIONS_BOSNIA[cityOrId];
    }
    
    // Try case-insensitive match
    const normalizedCity = cityOrId.toLowerCase();
    const found = Object.entries(VAKTIJA_LOCATIONS_BOSNIA).find(
      ([name]) => name.toLowerCase() === normalizedCity
    );
    
    if (found) {
      return found[1]; // Return the numeric ID
    }
  }
  
  return null; // Invalid input
}

// Helper function to calculate prayer times
const calculatePrayerTimes = (locationId, year, month, day) => {
  try {
    // Convert locationId to number using our helper
    const locationIndex = getLocationId(locationId);
    
    // Log the received parameters with types
    console.log('calculatePrayerTimes called with:', { 
      locationId, 
      locationIdType: typeof locationId,
      locationIndex,
      locationIndexType: typeof locationIndex,
      year, 
      month, 
      day 
    });
    
    // Access data through vaktija.vaktija
    const vaktijaData = vaktija.vaktija;
    const differencesData = vaktija.differences;
    const locationsData = vaktija.locations;
    
    // Log data structure info
    console.log('vaktija data structure:', {
      hasVaktija: !!vaktijaData,
      hasLocations: !!locationsData,
      locationsCount: locationsData?.length,
      hasMonths: !!(vaktijaData?.months),
      monthsCount: vaktijaData?.months?.length,
      hasDifferences: !!differencesData,
      differencesCount: differencesData?.length,
      locationIndexValid: locationIndex >= 0 && locationIndex < (differencesData?.length || 0)
    });
    
    // Validate location index is a valid number and within range
    if (locationIndex === null || isNaN(locationIndex) || locationIndex < 0 || locationIndex >= (differencesData?.length || 0)) {
      console.error('Invalid location index:', locationIndex, 
                   'Input was:', locationId,
                   'Type:', typeof locationId,
                   'Max index:', (differencesData?.length || 0) - 1,
                   'Locations count:', locationsData?.length,
                   'Differences count:', differencesData?.length);
      return null;
    }
    
    // Get current date if not provided
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = (month !== undefined ? month : now.getMonth() + 1) - 1; // Convert to 0-based for JS Date
    const targetDay = day || now.getDate();
    
    console.log(`Using date: ${targetYear}-${targetMonth + 1}-${targetDay} (0-based month: ${targetMonth})`);
    
    // Validate date
    const dateMoment = moment([targetYear, targetMonth, targetDay]);
    if (!dateMoment.isValid()) {
      console.error('Invalid date:', { year: targetYear, month: targetMonth, day: targetDay });
      return null;
    }
    
    // Log available months
    console.log('Available months in vaktija.vaktija.months:', vaktijaData?.months?.map((m, i) => ({
      monthIndex: i,
      monthName: moment().month(i).format('MMMM'),
      daysCount: m?.days?.length
    })));
    
    // Get prayer times from vaktija.json
    console.log('Trying to access month index:', targetMonth);
    const monthData = vaktijaData?.months?.[targetMonth];
    if (!monthData) {
      console.error('No data found for month index:', targetMonth);
      console.error('Available month indices:', vaktijaData?.months?.map((_, i) => i).filter(i => vaktijaData?.months?.[i]));
      return null;
    }
    
    // Get day data (days are 1-based in the data)
    const dayData = monthData?.days?.[targetDay - 1]; // Convert to 0-based index
    if (!dayData) {
      console.error('No data found for day:', targetDay, 'in month:', targetMonth + 1);
      console.error('Available days in month:', monthData.days?.length || 0);
      return null;
    }
    
    const rawTimes = dayData.vakat;
    if (!rawTimes) {
      console.error('No vakat data found for the specified day');
      return null;
    }
    
    // Get location differences
    const locationDiffs = differencesData?.[locationIndex];
    if (!locationDiffs) {
      console.error('No differences found for location index:', locationIndex);
      return null;
    }
    
    // Get month differences (0-based)
    const monthDiff = locationDiffs?.months?.[targetMonth];
    if (!monthDiff) {
      console.error('No month differences found for month index:', targetMonth);
      console.error('Available month differences:', Object.keys(locationDiffs.months || {}).map(Number).sort((a, b) => a - b));
      return null;
    }
    
    const diffs = monthDiff.vakat;
    if (!diffs) {
      console.error('No vakat differences found for the specified month');
      return null;
    }
    
    // Check for daylight saving time
    const isDST = dateMoment.tz("Europe/Sarajevo").isDST();
    
    // Format prayer times
    const formattedTimes = rawTimes.map((time, index) => {
      const diff = diffs && diffs[index] !== undefined ? diffs[index] : 0;
      const adjustedTime = isDST ? time + diff + 3600 : time + diff;
      
      // Convert seconds to hours and minutes
      const hours = Math.floor(adjustedTime / 3600) % 24;
      const minutes = Math.floor((adjustedTime % 3600) / 60);
      
      // Format as H:MM
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    });
    
    // Format dates
    const gregorianDate = dateMoment.format('dddd, D. MMMM YYYY');
    const hijriDate = dateMoment.format('D. MMMM YYYY');
    
    return {
      id: locationIndex,
      lokacija: locationsData[locationIndex],
      datum: [hijriDate, gregorianDate],
      vakat: formattedTimes
    };
  } catch (error) {
    console.error('Error in calculatePrayerTimes:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
    return null;
  }
};

app.get("/vaktija/ba/:lokacija/:godina", (req, res) => {
  const result = calculatePrayerTimes(
    req.params.lokacija,
    Number(req.params.godina)
  );
  if (!result) {
    return res.status(404).json({ error: "Invalid parameters" });
  }
  res.json(result);
});

app.get("/vaktija/ba/:lokacija/:godina/:mjesec", (req, res) => {
  const result = calculatePrayerTimes(
    req.params.lokacija,
    Number(req.params.godina),
    Number(req.params.mjesec)
  );
  if (!result) {
    return res.status(404).json({ error: "Invalid parameters" });
  }
  res.json(result);
});

app.get("/vaktija/ba/:lokacija/:godina/:mjesec/:dan", (req, res) => {
  const result = calculatePrayerTimes(
    req.params.lokacija,
    Number(req.params.godina),
    Number(req.params.mjesec),
    Number(req.params.dan)
  );
  if (!result) {
    return res.status(404).json({ error: "Invalid parameters" });
  }
  res.json(result);
});

// Get all available locations
app.get("/vaktija/ba/lokacije", (req, res) => {
  const locationsList = vaktija.locations.map((name, index) => ({
    id: index,
    lokacija: name
  }));
  res.json(locationsList);
});


// API endpoints
app.get("/vaktija/ba/:lokacija", (req, res) => {
  const result = calculatePrayerTimes(req.params.lokacija);
  if (!result) {
    return res.status(404).json({ error: "Location not found" });
  }
  res.json(result);
});

app.get("/api/vaktija/eu", async (req, res) => {
  if (!req.query.city) {
    return res.status(400).json({ 
      error: "City parameter is required",
      example: "/api/vaktija/eu?city=augsburg"
    });
  }

  const city = req.query.city.toLowerCase();
  const language = req.query.language || 'en';
  
  try {
    const result = await scrapePrayerTimes(language, city);
    
    // More flexible city validation
    if (result.data) {
      // Check if the returned city name contains our requested city (case insensitive)
      const returnedCity = result.data.meta.city.toLowerCase();
      if (!returnedCity.includes(city)) {
        return res.status(404).json({
          error: `Prayer times not found for ${req.query.city}`,
          returnedCity: result.data.meta.city,
          suggestion: "The city might have a different name in the system"
        });
      }
    }

    if (result.error) {
      return res.status(result.status || 500).json(result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

// Updated scrapePrayerTimes function
const scrapePrayerTimes = async (language, city) => {
  let page;
  try {
    const cacheKey = `${language}_${city}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    const startTime = Date.now();
    const url = `https://vaktija.eu/${language}/${city}`;
    
    const browser = await initBrowser();
    page = await browser.newPage();
    
    // Disable redirects to detect them
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Track redirects
    let finalUrl = url;
    page.on('response', response => {
      if (response.status() >= 300 && response.status() < 400) {
        finalUrl = response.headers().location;
      }
    });

    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });

    // Verify we're on the expected page
    finalUrl = page.url();
    if (!finalUrl.includes(city.toLowerCase())) {
      const redirectedCity = finalUrl.split('/').pop();
      return {
        error: `City '${city}' not found, redirected to '${redirectedCity}'`,
        status: 404,
        redirected: true,
        suggestedCity: redirectedCity
      };
    }

    // Rest of your scraping logic...
    await page.waitForSelector('.prayer-times', { timeout: 5000 });

    const timings = await page.evaluate(() => {
      const data = {};
      document.querySelectorAll('.prayer').forEach(prayer => {
        const name = prayer.querySelector('.type')?.innerText.trim();
        const time = prayer.querySelector('.time')?.innerText.trim();
        if (name && time) data[name] = time;
      });
      return data;
    });

    if (Object.keys(timings).length === 0) {
      throw new Error('No prayer times found on the page');
    }

    const nameMapping = {
      'Dawn Prayer': 'Fajr',
      'Sunrise': 'Sunrise',
      'Noon Prayer': 'Dhuhr',
      'Afternoon Prayer': 'Asr',
      'Evening Prayer': 'Maghrib',
      'Night Prayer': 'Isha'
    };

    const timingsMapped = {};
    for (const [key, value] of Object.entries(timings)) {
      timingsMapped[nameMapping[key] || key] = value;
    }


    const responseTime = (Date.now() - startTime) / 1000;
    console.log(`Scraped ${city} in ${responseTime.toFixed(2)}s`);
    console.log(finalUrl);
    // Extract the actual city name from the page
    const pageCity = typeof finalUrl === 'string' ? finalUrl.split('/').pop() : city;
    
    const result = {
      data: {
        timings: timingsMapped,
        date: moment().format('DD-MM-YYYY'),
        meta: {
          city: pageCity,
          language: language,
          source: 'vaktija.eu',
          response_time: `${responseTime.toFixed(2)}s`,
          requestedCity: city
        }
      }
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Error scraping ${city}:`, error);
    return { 
      error: `Failed to fetch prayer times for ${city}`,
      details: error.message,
      status: 404
    };
  } finally {
    if (page) await page.close();
  }
};

// NOVO: GET ruta za dohvat svih postavki
app.get('/prayer-settings', async (req, res) => {
  try {
    const allSettings = await getAllUserPrayerSettings();
    res.status(200).json(allSettings);
  } catch (error) {
    console.error('Failed to get prayer settings:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.post('/prayer-settings', async (req, res) => {
  const { token, deviceId, city, country, currentLanguage, notifications, translations } = req.body;

  try {

    let prayerTimes;

    if (country === 'Bosnia and Herzegovina') {
      const now = new Date();
      const result = calculatePrayerTimes(
        city, 
        now.getFullYear(), 
        now.getMonth() + 1, 
        now.getDate()
      );
    
      if (!result) throw new Error('Invalid city for BIH');
      prayerTimes = result;
    }
     else {
      const cityApi = slugifyCityName(city, country);
      const result = await scrapePrayerTimes(currentLanguage, cityApi);

      console.log("Scraper result:", result);

      if (!result || result.error) {
        console.error("EU scrape error:", result?.message || result);
        throw new Error('Failed to fetch EU data');
      }

      const returnedCity = result.data.meta.city.toLowerCase();
      if (!returnedCity.includes(city.toLowerCase())) {
        throw new Error(`Mismatch: requested city "${city}", but got "${returnedCity}"`);
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
      language: currentLanguage,
      notifications,
      prayerTimes,
      translations,
      lastUpdated: new Date()
    });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Failed to process settings:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});
// Posalji notifikacije
cron.schedule('* * * * *', async () => {
  console.log("Sending prayer notifications...");
  await sendPrayerNotifications();
});


// Pokreni svakog dana u 00:30 i 12:05
cron.schedule("30 0,12 * * *", async () => {
  console.log("⏰ Pokreće se ažuriranje namaskih vremena...");
  await updateAllPrayerTimes();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit();
});

app.get("*", (req, res) => {
  res.status(404).json({ error: "404 Endpoint not found" });
});

app.listen(port, () => {
  console.log(`Vaktija API server running on port ${port}`);
});

module.exports = { scrapePrayerTimes };