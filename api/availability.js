// Vercel Serverless Function: /api/availability?apt=apt1
// Тягне iCal-фіди з Airbnb/Booking (посилання в ical-urls.js) і повертає
// зайняті діапазони дат у форматі JSON. Тримає iCal-посилання лише на
// сервері, щоб не світити їх у браузері.

const ICAL_URLS = require("../ical-urls.js");

function parseICalDate(raw) {
  // Формати: 20260615 (весь день) або 20260615T140000Z
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

function parseEvents(icalText) {
  const events = [];
  const blocks = icalText.split("BEGIN:VEVENT").slice(1);
  for (const block of blocks) {
    const body = block.split("END:VEVENT")[0];
    const startMatch = body.match(/DTSTART[^:]*:(\S+)/);
    const endMatch = body.match(/DTEND[^:]*:(\S+)/);
    if (!startMatch || !endMatch) continue;
    const start = parseICalDate(startMatch[1]);
    const end = parseICalDate(endMatch[1]);
    if (start && end) events.push({ start, end });
  }
  return events;
}

function mergeRanges(ranges) {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= last.end) {
      if (cur.end > last.end) last.end = cur.end;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

module.exports = async (req, res) => {
  const apt = (req.query && req.query.apt) || "";
  const urls = (ICAL_URLS[apt] || []).filter(Boolean);

  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (!apt || !(apt in ICAL_URLS)) {
    res.status(400).json({ error: "unknown apartment", apt });
    return;
  }

  if (urls.length === 0) {
    // Посилання ще не додані власником — календар працює як "все вільно"
    res.status(200).json({ apt, blocked: [], configured: false });
    return;
  }

  let allEvents = [];
  const errors = [];

  await Promise.all(
    urls.map(async (url) => {
      try {
        const r = await fetch(url, { headers: { "User-Agent": "TownHouse99-availability/1.0" } });
        if (!r.ok) {
          errors.push(`${url}: HTTP ${r.status}`);
          return;
        }
        const text = await r.text();
        allEvents = allEvents.concat(parseEvents(text));
      } catch (e) {
        errors.push(`${url}: ${e.message}`);
      }
    })
  );

  const blocked = mergeRanges(allEvents);

  res.status(200).json({
    apt,
    blocked,
    configured: true,
    updated: new Date().toISOString(),
    ...(errors.length ? { warnings: errors } : {})
  });
};
