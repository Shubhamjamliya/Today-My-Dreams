const City = require('../models/City');

// If no cities are explicitly assigned, default to every active city instead of
// leaving the item assigned to none — an empty cities array makes the item
// invisible everywhere on the city-filtered storefront, which looks like the
// image/content "disappeared" even though it's still saved correctly.
async function resolveCities(cities) {
  if (Array.isArray(cities) && cities.length > 0) {
    return cities;
  }
  const activeCities = await City.find({ isActive: { $ne: false } }).select('_id');
  return activeCities.map((c) => c._id);
}

// Safely parses a "cities" value that may arrive as a JSON array string,
// a malformed non-JSON string (e.g. a client bug that sent a plain
// comma-joined list), undefined, or already-parsed array. Never throws.
// Returns null when the value is missing or unparseable, so callers can
// tell "nothing valid was sent, leave cities alone" apart from
// "an empty list was sent on purpose, apply the all-cities default".
function parseCities(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (err) {
    return null;
  }
}

module.exports = { resolveCities, parseCities };
