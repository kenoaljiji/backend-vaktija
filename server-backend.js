const express = require("express");
const compression = require("compression");
const port = process.env.PORT || 8080;
const vaktija = require("./data/vaktija.json");
const app = express();
const moment = require("moment");
const NodeCache = require("node-cache");
// Add a new function to scrape prayer times from vaktija.eu
/* const puppeteer = require('puppeteer'); */

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
/*let browser;

const initBrowser = async () => {
  if (browser) return browser;

  browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  });

  return browser;
};*/

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

const calculatePrayerTimes = (locationId, year, month, day) => {
  // Convert locationId to number
  const locationIndex = Number(locationId);
  
  // Validate location
  if (locationIndex < 0 || locationIndex >= vaktija.locations.length) {
    return null;
  }

  // Get current time in Sarajevo timezone (Europe/Sarajevo)
  const now = moment().tz("Europe/Sarajevo");
  
  // Use provided date or default to today (Sarajevo time)
  const targetYear = year || now.year();
  const targetMonth = month || now.month() + 1; // Months are 0-indexed in Moment.js
  const targetDay = day || now.date();

  console.log(`Using Sarajevo date: ${targetYear}-${targetMonth}-${targetDay}`);
  
  // Validate date
  if (!moment.tz([targetYear, targetMonth - 1, targetDay], "Europe/Sarajevo").isValid()) {
    return null;
  }
  
  // Get prayer times from vaktija.json
  const monthIndex = targetMonth - 1;
  const dayIndex = targetDay - 1;
  
  // Ensure the indices are valid
  if (monthIndex < 0 || monthIndex >= vaktija.vaktija.months.length ||
      dayIndex < 0 || dayIndex >= vaktija.vaktija.months[monthIndex].days.length) {
    return null;
  }
  
  // Get raw prayer times
  const rawTimes = vaktija.vaktija.months[monthIndex].days[dayIndex].vakat;
  
  // Apply location-specific differences
  const locationDiffs = vaktija.differences[locationIndex].months[monthIndex].vakat;
  
  // Check for daylight saving time (DST) in Sarajevo
  const isDST = moment.tz([targetYear, targetMonth - 1, targetDay], "Europe/Sarajevo").isDST();
  
  // Format prayer times
  const formattedTimes = rawTimes.map((time, index) => {
    const adjustedTime = isDST
      ? time + locationDiffs[index] + 3600
      : time + locationDiffs[index];
    
    // Convert seconds to hours and minutes
    const hours = Math.floor(adjustedTime / 3600);
    const minutes = Math.floor((adjustedTime % 3600) / 60);
    
    // Format as H:MM
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  });
  
  // Get dynamic Gregorian and Hijri dates in Bosnian (Sarajevo time)
  const gregorianDate = moment.tz([targetYear, targetMonth - 1, targetDay], "Europe/Sarajevo")
    .locale("bs")
    .format("dddd, D. MMMM YYYY");
  
  const hijriDate = new Intl.DateTimeFormat("bs-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Sarajevo"
  }).format(new Date(targetYear, targetMonth - 1, targetDay));
  
  return {
    id: locationIndex,
    lokacija: vaktija.locations[locationIndex],
    datum: [hijriDate, gregorianDate],
    vakat: formattedTimes
  };
};

// API endpoints
app.get("/vaktija/ba/:lokacija", (req, res) => {
  const result = calculatePrayerTimes(req.params.lokacija);
  if (!result) {
    return res.status(404).json({ error: "Location not found" });
  }
  res.json(result);
});

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

app.get("/vaktija/eu", async (req, res) => {
  if (!req.query.city) {
    return res.status(400).json({ 
      error: "City parameter is required",
      example: "/vaktija/eu?city=augsburg"
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

    // Extract the actual city name from the page
    const pageCity = finalUrl.split('/').pop();
    
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
