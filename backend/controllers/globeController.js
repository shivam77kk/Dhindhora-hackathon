import { apiSuccess, apiError } from '../utils/apiResponse.js';
import VisitorLog from '../models/VisitorLog.js';

// Helper: get geolocation from IP using ip-api.com (free, no key needed)
async function geolocateIP(ip) {
  try {
    // Skip localhost/private IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
      // Return random world coordinates for demo/dev
      const demoLocations = [
        { country: 'India',          countryCode: 'IN', city: 'Mumbai',     lat: 19.0760,  lng: 72.8777  },
        { country: 'United States',  countryCode: 'US', city: 'New York',   lat: 40.7128,  lng: -74.0060 },
        { country: 'Japan',          countryCode: 'JP', city: 'Tokyo',      lat: 35.6762,  lng: 139.6503 },
        { country: 'Germany',        countryCode: 'DE', city: 'Berlin',     lat: 52.5200,  lng: 13.4050  },
        { country: 'Brazil',         countryCode: 'BR', city: 'São Paulo',  lat: -23.5505, lng: -46.6333 },
        { country: 'Australia',      countryCode: 'AU', city: 'Sydney',     lat: -33.8688, lng: 151.2093 },
        { country: 'United Kingdom', countryCode: 'GB', city: 'London',     lat: 51.5074,  lng: -0.1278  },
        { country: 'South Korea',    countryCode: 'KR', city: 'Seoul',      lat: 37.5665,  lng: 126.9780 },
        { country: 'France',         countryCode: 'FR', city: 'Paris',      lat: 48.8566,  lng: 2.3522   },
        { country: 'Canada',         countryCode: 'CA', city: 'Toronto',    lat: 43.6532,  lng: -79.3832 },
      ];
      return demoLocations[Math.floor(Math.random() * demoLocations.length)];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,countryCode,city,lat,lon,status`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('ip-api request failed');
    const data = await res.json();

    if (data.status !== 'success') throw new Error('ip-api returned fail status');
    return { country: data.country, countryCode: data.countryCode, city: data.city, lat: data.lat, lng: data.lon };
  } catch {
    return { country: 'Unknown', countryCode: 'XX', city: '', lat: 0, lng: 0 };
  }
}

// GET /api/globe/visitors/:webreelId
export const getVisitors = async (req, res) => {
  try {
    const { webreelId } = req.params;
    if (!webreelId) return res.status(400).json(apiError('webreelId is required'));

    const visitors = await VisitorLog.find({ webreelId })
      .sort({ createdAt: -1 })
      .limit(200)
      .select('country countryCode city lat lng createdAt socketId')
      .lean();

    // Country summary for sidebar
    const countryCounts = {};
    visitors.forEach(v => {
      const key = v.countryCode;
      if (!countryCounts[key]) countryCounts[key] = { country: v.country, countryCode: v.countryCode, count: 0 };
      countryCounts[key].count++;
    });

    const topCountries = Object.values(countryCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return res.json(apiSuccess({
      visitors,
      total: visitors.length,
      topCountries,
    }, 'Visitors fetched'));
  } catch (err) {
    console.error('getVisitors error:', err.message);
    return res.status(500).json(apiError(err.message));
  }
};

// POST /api/globe/track — called when a visitor lands on a webreel
export const trackVisitor = async (req, res) => {
  try {
    const { webreelId, socketId } = req.body;
    if (!webreelId) return res.status(400).json(apiError('webreelId is required'));

    // Get real IP (handle proxies)
    const ip = (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );

    const geo = await geolocateIP(ip);

    const visitor = await VisitorLog.create({
      webreelId,
      ip,
      socketId: socketId || '',
      ...geo,
    });

    // Broadcast to all viewers of this globe
    if (req.io) {
      req.io.emit(`globe:visitor-arrived:${webreelId}`, {
        _id:         visitor._id,
        country:     visitor.country,
        countryCode: visitor.countryCode,
        city:        visitor.city,
        lat:         visitor.lat,
        lng:         visitor.lng,
        createdAt:   visitor.createdAt,
      });
    }

    return res.json(apiSuccess({ tracked: true, geo }, 'Visitor tracked'));
  } catch (err) {
    console.error('trackVisitor error:', err.message);
    return res.status(500).json(apiError(err.message));
  }
};

// GET /api/globe/stats
export const getGlobalStats = async (req, res) => {
  try {
    const totalToday = await VisitorLog.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    const uniqueCountries = await VisitorLog.distinct('countryCode');
    return res.json(apiSuccess({ totalToday, uniqueCountries: uniqueCountries.length }));
  } catch (err) {
    return res.status(500).json(apiError(err.message));
  }
};
