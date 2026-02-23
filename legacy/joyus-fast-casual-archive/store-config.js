'use strict';

(function storeConfigModule() {
  const STORAGE_KEY = 'joyus_fast_casual_store_schema_v1';
  const DEFAULT_TIMEZONE = 'America/New_York';
  const DEFAULT_STORES = [
    {
      code: 'EP',
      name: 'Harbor Point',
      active: true,
      squareLocationId: 'DEMO_LOC_A',
      timezone: DEFAULT_TIMEZONE,
      weather: { lat: 39.9332, lon: -75.1648 },
      isDefault: true,
    },
    {
      code: 'NL',
      name: 'Riverview Commons',
      active: true,
      squareLocationId: 'DEMO_LOC_B',
      timezone: DEFAULT_TIMEZONE,
      weather: { lat: 39.9671, lon: -75.1355 },
      isDefault: true,
    },
  ];

  const DEFAULT_BY_CODE = Object.fromEntries(DEFAULT_STORES.map((store) => [store.code, store]));

  function sanitizeCode(raw) {
    const candidate = String(raw || '')
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '')
      .slice(0, 16);
    return candidate;
  }

  function normalizeName(rawName, fallbackCode) {
    const name = String(rawName || '').trim();
    if (name) return name;
    if (DEFAULT_BY_CODE[fallbackCode]) return DEFAULT_BY_CODE[fallbackCode].name;
    return `Store ${fallbackCode}`;
  }

  function normalizeNumber(raw, fallback = null) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function baseStoreForCode(code) {
    const base = DEFAULT_BY_CODE[code];
    if (base) {
      return {
        code,
        name: base.name,
        active: true,
        squareLocationId: base.squareLocationId,
        timezone: base.timezone || DEFAULT_TIMEZONE,
        weather: {
          lat: normalizeNumber(base.weather?.lat, null),
          lon: normalizeNumber(base.weather?.lon, null),
        },
        isDefault: true,
      };
    }

    return {
      code,
      name: `Store ${code}`,
      active: true,
      squareLocationId: '',
      timezone: DEFAULT_TIMEZONE,
      weather: { lat: null, lon: null },
      isDefault: false,
    };
  }

  function normalizeStore(raw, fallbackCode = '') {
    const code = sanitizeCode(raw?.code || fallbackCode);
    if (!code) return null;

    const base = baseStoreForCode(code);
    const weatherRaw = raw?.weather && typeof raw.weather === 'object' ? raw.weather : {};

    return {
      code,
      name: normalizeName(raw?.name, code),
      active: typeof raw?.active === 'boolean' ? raw.active : base.active,
      squareLocationId: String(raw?.squareLocationId || raw?.square_location_id || base.squareLocationId || '').trim(),
      timezone: String(raw?.timezone || base.timezone || DEFAULT_TIMEZONE).trim() || DEFAULT_TIMEZONE,
      weather: {
        lat: normalizeNumber(weatherRaw.lat, base.weather.lat),
        lon: normalizeNumber(weatherRaw.lon, base.weather.lon),
      },
      isDefault: typeof raw?.isDefault === 'boolean' ? raw.isDefault : base.isDefault,
    };
  }

  function sortStores(a, b) {
    return String(a.name || a.code).localeCompare(String(b.name || b.code));
  }

  function normalizedSeedCodes(seedCodes = []) {
    const codes = new Set(DEFAULT_STORES.map((store) => store.code));
    (seedCodes || []).forEach((code) => {
      const normalized = sanitizeCode(code);
      if (normalized && normalized !== 'BOTH') codes.add(normalized);
    });
    return Array.from(codes);
  }

  function normalize(schema, seedCodes = []) {
    const stores = Array.isArray(schema?.stores) ? schema.stores : [];
    const byCode = new Map();

    stores.forEach((store) => {
      const normalized = normalizeStore(store);
      if (!normalized) return;
      byCode.set(normalized.code, normalized);
    });

    normalizedSeedCodes(seedCodes).forEach((code) => {
      if (!byCode.has(code)) {
        byCode.set(code, baseStoreForCode(code));
      } else {
        byCode.set(code, normalizeStore(byCode.get(code), code));
      }
    });

    const normalizedStores = Array.from(byCode.values()).sort(sortStores);
    if (!normalizedStores.some((store) => store.active) && normalizedStores[0]) {
      normalizedStores[0].active = true;
    }

    return {
      version: 1,
      stores: normalizedStores,
    };
  }

  function load(seedCodes = []) {
    let parsed = null;
    try {
      parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (_err) {
      parsed = null;
    }

    const normalized = normalize(parsed, seedCodes);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (_err) {
      // Ignore storage write failures.
    }

    return normalized;
  }

  function save(schema, seedCodes = []) {
    const normalized = normalize(schema, seedCodes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (_err) {
      // Ignore storage write failures.
    }
    return normalized;
  }

  function listStores(schema, { activeOnly = false } = {}) {
    const normalized = normalize(schema || {}, []);
    const stores = normalized.stores.slice();
    return activeOnly ? stores.filter((store) => store.active) : stores;
  }

  function codes(schema, { activeOnly = false } = {}) {
    return listStores(schema, { activeOnly }).map((store) => store.code);
  }

  function getStore(schema, code) {
    const normalizedCode = sanitizeCode(code);
    if (!normalizedCode) return null;
    return listStores(schema, { activeOnly: false }).find((store) => store.code === normalizedCode) || null;
  }

  function getLabel(schema, code) {
    const store = getStore(schema, code);
    if (store) return store.name;
    return sanitizeCode(code) || String(code || 'Store');
  }

  window.JoyusStoreConfig = {
    STORAGE_KEY,
    DEFAULT_TIMEZONE,
    DEFAULT_STORES,
    sanitizeCode,
    normalize,
    load,
    save,
    listStores,
    codes,
    getStore,
    getLabel,
  };
})();
