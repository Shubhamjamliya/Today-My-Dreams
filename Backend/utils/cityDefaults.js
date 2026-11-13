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

module.exports = { resolveCities };
