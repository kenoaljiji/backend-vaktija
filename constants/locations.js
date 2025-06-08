// Mapping of Bosnian cities to their vaktija.ba IDs
const VAKTIJA_LOCATIONS_BOSNIA = {
    'Banja Luka': 1,
    'Bihać': 2,
    'Cazin': 19,
    'Bijeljina': 3,
    'Bileća': 4,
    'Bosanski Brod': 5,
    'Bosanska Dubica': 6,
    'Bosanska Gradiška': 7,
    'Bosansko Grahovo': 8,
    'Bosanska Krupa': 9,
    'Bosanski Novi': 10,
    'Bosanski Petrovac': 11,
    'Bosanski Šamac': 12,
    'Bratunac': 13,
    'Brčko': 14,
    'Breza': 15,
    'Bugojno': 16,
    'Busovača': 17,
    'Bužim': 18,
    'Čajniče': 20,
    'Čapljina': 21,
    'Čelić': 22,
    'Čelinac': 23,
    'Čitluk': 24,
    'Derventa': 25,
    'Doboj': 26,
    'Donji Vakuf': 27,
    'Drvar': 28,
    'Foča': 29,
    'Fojnica': 30,
    'Gacko': 31,
    'Glamoč': 32,
    'Goražde': 33,
    'Gornji Vakuf': 34,
    'Gračanica': 35,
    'Gradačac': 36,
    'Grude': 37,
    'Hadžići': 38,
    'Han-Pijesak': 39,
    'Hlivno': 40,
    'Ilijaš': 41,
    'Jablanica': 42,
    'Jajce': 43,
    'Kakanj': 44,
    'Kalesija': 45,
    'Kalinovik': 46,
    'Kiseljak': 47,
    'Kladanj': 48,
    'Ključ': 49,
    'Konjic': 50,
    'Kotor-Varoš': 51,
    'Kreševo': 52,
    'Kupres': 53,
    'Laktaši': 54,
    'Lopare': 55,
    'Lukavac': 56,
    'Ljubinje': 57,
    'Ljubuški': 58,
    'Maglaj': 59,
    'Modriča': 60,
    'Mostar': 61,
    'Mrkonjić-Grad': 62,
    'Neum': 63,
    'Nevesinje': 64,
    'Novi Travnik': 65,
    'Odžak': 66,
    'Olovo': 67,
    'Orašje': 68,
    'Pale': 69,
    'Posušje': 70,
    'Prijedor': 71,
    'Prnjavor': 72,
    'Prozor': 73,
    'Rogatica': 74,
    'Rudo': 75,
    'Sanski Most': 76,
    'Sarajevo': 77,
    'Skender-Vakuf': 78,
    'Sokolac': 79,
    'Srbac': 80,
    'Srebrenica': 81,
    'Srebrenik': 82,
    'Stolac': 83,
    'Šekovići': 84,
    'Šipovo': 85,
    'Široki Brijeg': 86,
    'Teslić': 87,
    'Tešanj': 88,
    'Tomislav-Grad': 89,
    'Travnik': 90,
    'Trebinje': 91,
    'Trnovo': 92,
    'Tuzla': 93,
    'Ugljevik': 94,
    'Vareš': 95,
    'Velika Kladuša': 96,
    'Visoko': 97,
    'Višegrad': 98,
    'Vitez': 99,
    'Vlasenica': 100,
    'Zavidovići': 101,
    'Zenica': 102,
    'Zvornik': 103,
    'Žepa': 104,
    'Žepče': 105,
    'Živinice': 106,
    'Bijelo Polje': 107,
    'Gusinje': 108,
    'Nova Varoš': 109,
    'Novi Pazar': 110,
    'Plav': 111,
    'Pljevlja': 112,
    'Priboj': 113,
    'Prijepolje': 114,
    'Rožaje': 115,
    'Sjenica': 116,
    'Tutin': 117
  };
  
  // List of all Bosnian cities (for search functionality)
  const BOSNIAN_CITIES = Object.keys(VAKTIJA_LOCATIONS_BOSNIA);
  
  // Popular Bosnian cities grouped by region
  const POPULAR_BOSNIAN_CITIES = [
    // Major cities
    "Sarajevo",
    "Banja Luka",
    "Tuzla",
    "Zenica",
    "Mostar",
    // Una-Sana Canton
    "Bihać",
    "Cazin",
    "Velika Kladuša",
    "Bosanska Krupa",
    "Sanski Most",
    // Tuzla Canton
    "Živinice",
    "Gračanica",
    "Lukavac",
    "Srebrenik",
    // Central Bosnia
    "Travnik",
    "Bugojno",
    "Jajce",
    "Vitez",
    "Novi Travnik",
    // Herzegovina
    "Trebinje",
    "Konjic",
    "Čapljina",
    "Stolac",
    // Northeast
    "Brčko",
    "Bijeljina",
    "Doboj",
    "Gradačac",
    // Other significant cities
    "Goražde",
    "Srebrenica",
    "Višegrad",
    "Prijedor",
    "Kakanj",
    "Visoko"
  ];
  
  // Example city lists for other countries
  
  const GERMAN_CITIES = [
    "Aachen",
    "Ahlen",
    "Augsburg",
    "Balingen",
    "Belzig",
    "Berlin",
    "Bielefeld",
    "Bochum",
    "Bonn",
    "Brandenburg",
    "Braunschweig",
    "Bremen",
    "Bremerhaven",
    "Calw",
    "Castrop-Rauxel",
    "Darmstadt",
    "Dortmund",
    "Dresden",
    "Duisburg",
    "Düsseldorf",
    "Eningen",
    "Essen",
    "Frankfurt",
    "Freiburg",
    "Füssen",
    "Gaggenau",
    "Hagen",
    "Halle",
    "Hamburg",
    "Hamm",
    "Hanau",
    "Hannover",
    "Heilbronn",
    "Immenstadt",
    "Ingolstadt",
    "Isny",
    "Kamenz",
    "Kamp-Lintfort",
    "Karlsruhe",
    "Kassel",
    "Kaufbeuren",
    "Kempten",
    "Kiel",
    "Kirchheim Teck",
    "Koblenz",
    "Köln",
    "Leipzig",
    "Löhne",
    "Ludwigsburg",
    "Mainz",
    "Mannheim",
    "Marktoberdorf",
    "Memmingen",
    "Mindelheim",
    "Mülheim",
    "München",
    "Münster",
    "Nesselwang",
    "Nürnberg",
    "Obergünzburg",
    "Oberhausen",
    "Oberstdorf",
    "Offenbach",
    "Osnabrück",
    "Paderborn",
    "Penzberg",
    "Pfalzgrafenweiler",
    "Pfronten",
    "Philippsburg",
    "Ravensburg",
    "Regensburg",
    "Reutlingen",
    "Rosenheim",
    "Saarbrücken",
    "Schongau",
    "Schüttorf",
    "Schwäbisch Gmünd",
    "Siegen",
    "Sindelfingen",
    "Sonthofen",
    "Stuttgart",
    "Tuttlingen",
    "Uhingen",
    "Ulm",
    "Velbert",
    "Waltenhofen",
    "Wiesbaden",
    "Witten",
    "Wuppertal",
    "Würzburg"
  ];
  
  
  const CROATIAN_CITIES = [
    "Zagreb",
    "Split",
    "Rijeka",
    "Osijek",
    "Zadar",
    "Dubrovnik",
    "Pula",
    "Karlovac",
    "Sisak",
    "Varaždin",
    "Vinkovci",
  ];
  
  const USA_CITIES = [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose"
  ];
  
  const SERBIAN_CITIES = [
    "Beograd",
    "Niš",
    "Nova Varoš",
    "Novi Pazar",
    "Novi Sad",
    "Priboj",
    "Prijepolje",
    "Sjenica",
    "Subotica",
  ]
  
  const AUSTRIAN_CITIES = [
    "Absam",
    "Ainring",
    "Altmunster",
    "Amstetten",
    "Andorf",
    "Bad Goisern",
    "Bad Hall",
    "Bad Ischl",
    "Bad Voslau",
    "Baden",
    "Badgastein",
    "Baierham",
    "Berndorf",
    "Biberwier",
    "Bischofshofen",
    "Bludenz",
    "Braunau am Inn",
    "Bregenz",
    "Bruck an der Leitha",
    "Deutschlandsberg",
    "Dornbirn",
    "Ebensee",
    "Eferding",
    "Ehrwald Oberdorf",
    "Eisenstadt",
    "Ellmau (S)",
    "Elmen",
    "Enns",
    "Erpfendorf",
    "Feldkirch",
    "Felixdorf",
    "Fieberbrunn",
    "Fohnsdorf",
    "Freistadt",
    "Fulpmes",
    "Fürstenfeld",
    "Furth",
    "Gänserndorf",
    "Gargellen",
    "Gaschurn",
    "Gerasdorf",
    "Gleisdorf",
    "Gmünd",
    "Gmunden",
    "Götzis",
    "Graz",
    "Grieswinkl",
    "Grieskirchen",
    "Griffen (K)",
    "Grossegg (K)",
    "Grunburg",
    "Haag (Amstetten)",
    "Hainburg A.d.",
    "Hall in Tirol",
    "Hallein",
    "Hard",
    "Hauzenödorf (K)",
    "Heidenreichstein",
    "Heiligenblut",
    "Hirschbach",
    "Hochegg",
    "Höchst",
    "Hohenems",
    "Hollabrunn",
    "Hörbranz",
    "Horn",
    "Imst",
    "Imsterau",
    "Imsterberg",
    "Innsbruck",
    "Jenbach",
    "Judenburg",
    "Kapfenberg",
    "Kaprun",
    "Kindberg",
    "Kitzbühel",
    "Klagenfurt",
    "Klosterneuburg",
    "Köflach",
    "Korneuburg",
    "Krems",
    "Kremsmünster",
    "Kufstein",
    "Lahn",
    "Landeck",
    "Laufen",
    "Lauterach",
    "Leibnitz",
    "Lend",
    "Leoben",
    "Leonding",
    "Liezen",
    "Lilienfeld",
    "Linz",
    "Lobenau",
    "Lustenau",
    "Marchtrenk",
    "Mattighofen",
    "Mauerkirchen",
    "Mauthausen",
    "Melk",
    "Micheldorf am Kierberge",
    "Mistelbach",
    "Mittersill",
    "Mödling",
    "Modriach",
    "Mondsee",
    "Moosburg in Kärnten",
    "Moschenitzen",
    "Mürzzuschlag",
    "Nenzing",
    "Neuschitz",
    "Oberpinswang",
    "Pessendellach",
    "Prutz",
    "Pusarnitz",
    "Rankweil",
    "Rattenberg",
    "Reutte",
    "Ried (S)",
    "Ried im Innkreis",
    "Rum",
    "Saalbach",
    "Saalfelden",
    "Salzburg",
    "Sankt Pölten",
    "Schruns",
    "Schwaz",
    "Seeboden",
    "Spittal an der Drau",
    "Spratzern",
    "St. Johan In Tirol",
    "St. Johann im Pongau",
    "St. Pölten",
    "St. Wolfgang",
    "Steyr",
    "Straßwalchen",
    "Telfs",
    "Ternitz (Flatz)",
    "Timmls",
    "Traun",
    "Tulln",
    "Villach",
    "Vöcklabruck",
    "Voitsberg",
    "Völkermarkt",
    "Vols",
    "Wassenbach",
    "Wattens",
    "Weitra",
    "Weiz",
    "Weis",
    "Wien",
    "Wiener Neustadt",
    "Wisperndorf",
    "Wolfsberg",
    "Wolfurt",
    "Wolkersdorf",
    "Wörgl",
    "Ypps an der Donau",
    "Zell am See",
    "Zeitweg",
    "Zirl",
    "Zürs",
    "Zwettl"
  ];
  
  
  const SWISS_CITIES = [
    "Aarau",
    "Appenzell",
    "Basel",
    "Bern",
    "Biel",
    "Bischofszell",
    "Buchs",
    "Chur",
    "Genf", // Geneva
    "Heiden",
    "Kreuzlingen",
    "Luzern", // Lucerne
    "Neuchâtel",
    "Ricken",
    "St. Gallen",
    "Wattwil",
    "Yverdon",
    "Zürich"
  ];
  
  const DUTCH_CITIES = [
    "Amsterdam",
    "Rotterdam",
    "Den Haag",
    "Utrecht",
    "Eindhoven",
    "Groningen",
    "Tilburg",
    "Almere",
    "Nijmegen"
  ];
  
  
  
  // Add more city lists as needed...
  
  // Available countries with their configurations
  const AVAILABLE_COUNTRIES = [
    {
      name: "Bosnia and Herzegovina",
      key: "BosniaAndHerzegovina",
      flag: "🇧🇦",
      timezone: "Europe/Sarajevo",
      enabled: true,
      api: "vaktija.ba",
      cities: BOSNIAN_CITIES
    },
    {
      name: "Croatia",
      key: "Croatia",
      flag: "🇭🇷",
      timezone: "Europe/Zagreb",
      enabled: true,
      api: "vaktija.eu",
      cities: CROATIAN_CITIES
    },
    {
      name: "Germany",
      key: "Germany",
      flag: "🇩🇪",
      timezone: "Europe/Berlin",
      enabled: true,
      api: "vaktija.eu",
      cities: GERMAN_CITIES
    },
    {
      name: "Austria",
      key: "Austria",
      flag: "🇦🇹",
      timezone: "Europe/Vienna",
      enabled: true,
      api: "vaktija.eu",
      cities: AUSTRIAN_CITIES
    },
    {
      name: "Switzerland",
      key: "Switzerland",
      flag: "🇨🇭",
      timezone: "Europe/Zurich",
      enabled: true,
      api: "vaktija.eu",
      cities: SWISS_CITIES
    },
    {
      name: "Netherlands",
      key: "Netherlands",
      flag: "🇳🇱",
      timezone: "Europe/Amsterdam",
      enabled: true,
      api: "vaktija.eu",
      cities: DUTCH_CITIES
    },
    /* {
      name: "Montenegro",
      flag: "🇲🇪",
      timezone: "Europe/Podgorica",
      enabled: true,
      api: "vaktija.ba",
      cities: MONTENEGRIN_CITIES
    }, */
    {
      name: "Serbia",
      key: "Serbia",
      flag: "🇷🇸",
      timezone: "Europe/Belgrade",
      enabled: true,
      api: "vaktija.eu",
      cities: SERBIAN_CITIES
    },
  ];
  
  const slugifyCityName = (city, country) => {
    const lowerCountry = country.toLowerCase();
    const lowerCity = city.toLowerCase();
  
    if (
      lowerCountry === 'germany' ||
      lowerCountry === 'austria' ||
      lowerCountry === 'switzerland' || lowerCountry === 'netherlands'
    ) {
      return lowerCity
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      // Remove dot if followed by a space (e.g., "St. Galen" → "St Galen")
      .replace(/\. (?=\w)/g, ' ')
      // Normalize and remove accents (French/Italian/etc.)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      // Replace (text) with -text
      .replace(/\s*\(\s*([^)]*?)\s*\)\s*/g, '-$1')
      // Replace spaces with dashes
      .replace(/\s+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-+|-+$/g, '')
      // Lowercase everything (optional)
      .toLowerCase()
    }
  
    if (lowerCountry === 'turkey') {
      return lowerCity
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u')
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-');
    }
    if (lowerCountry === 'croatia' ||lowerCountry === 'serbia') {
      return lowerCity
        .replace(/č/g, 'c')
        .replace(/ć/g, 'c')
        .replace(/đ/g, 'd')
        .replace(/ž/g, 'z')
        .replace(/š/g, 's')
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-');
    }
  
    return lowerCity;
  };

  module.exports = {
    VAKTIJA_LOCATIONS_BOSNIA,
    BOSNIAN_CITIES,
    POPULAR_BOSNIAN_CITIES,
    GERMAN_CITIES,
    CROATIAN_CITIES,
    USA_CITIES,
    SERBIAN_CITIES,
    AUSTRIAN_CITIES,
    SWISS_CITIES,
    DUTCH_CITIES,
    AVAILABLE_COUNTRIES,
    slugifyCityName
  };
   
  
  
  