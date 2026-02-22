import Specialty from "../models/Specialty.js";

const CACHE_TTL_MS =
  Number(process.env.SPECIALTY_CACHE_TTL_MS) || 5 * 60 * 1000;

let specialtyNameCache = [];
let cacheExpiresAt = 0;
let inFlightLoad = null;

const loadSpecialtyNamesFromDb = async () => {
  const rows = await Specialty.find({}, "name").lean();
  return rows
    .map((item) => (typeof item?.name === "string" ? item.name.trim() : ""))
    .filter(Boolean);
};

export const getCachedSpecialtyNames = async ({
  forceRefresh = false,
} = {}) => {
  const now = Date.now();
  if (!forceRefresh && specialtyNameCache.length > 0 && now < cacheExpiresAt) {
    console.log("Returning specialties from cache");
    return specialtyNameCache;
  }

  if (inFlightLoad) {
    return inFlightLoad;
  }

  inFlightLoad = (async () => {
    try {
      const names = await loadSpecialtyNamesFromDb();
      specialtyNameCache = names;
      cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return names;
    } catch (error) {
      if (specialtyNameCache.length > 0) {
        console.warn(
          "Specialty cache refresh failed; using stale cache for continuity.",
          error?.message || error,
        );
        return specialtyNameCache;
      }
      throw error;
    } finally {
      inFlightLoad = null;
    }
  })();

  return inFlightLoad;
};

export const invalidateSpecialtyCache = () => {
  specialtyNameCache = [];
  cacheExpiresAt = 0;
};
