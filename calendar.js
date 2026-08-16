/* Календар вільних дат — читає /api/availability?apt=... і дає обрати
   дати заїзду/виїзду. Після вибору формує посилання в Telegram з готовим
   текстом повідомлення (бронювання підтверджує господар вручну). */

(function () {
  const root = document.getElementById("bookingCalendar");
  if (!root) return;

  const apt = root.dataset.apt;
  const aptName = root.dataset.aptName || "";
  const telegramUser = root.dataset.telegram || "svitlanka46";

  const MONTHS_UA = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
  const WEEKDAYS_UA = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"];

  let blocked = [];
  let configured = true;
  let viewYear, viewMonth; // місяць що показуємо першим (0-based)
  let selStart = null, selEnd = null;

  const today = new Date();
  today.setHours(0,0,0,0);
  viewYear = today.getFullYear();
  viewMonth = today.getMonth();

  function toISO(d){
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  }
  function toUA(d){
    return String(d.getDate()).padStart(2,"0") + "." + String(d.getMonth()+1).padStart(2,"0") + "." + d.getFullYear();
  }
  function isBlocked(iso){
    return blocked.some(r => iso >= r.start && iso < r.end);
  }
  function rangeHasBlocked(startIso, endIso){
    let d = new Date(startIso);
    const end = new Date(endIso);
    while (d < end) {
      if (isBlocked(toISO(d))) return true;
      d.setDate(d.getDate()+1);
    }
    return false;
  }

  function renderSkeleton(){
    root.innerHTML = `
      <div class="cal-head">
        <button type="button" class="cal-nav-btn" id="calPrev">‹</button>
        <div class="cal-months" id="calMonths"></div>
        <button type="button" class="cal-nav-btn" id="calNext">›</button>
      </div>
      <div class="cal-grids" id="calGrids"></div>
      <div class="cal-legend">
        <span><i class="cal-dot cal-dot-free"></i>Вільно</span>
        <span><i class="cal-dot cal-dot-busy"></i>Зайнято</span>
        <span><i class="cal-dot cal-dot-sel"></i>Обрано</span>
      </div>
      <div class="cal-summary" id="calSummary">Оберіть дату заїзду та виїзду</div>
      <a href="#" target="_blank" rel="noopener" class="btn btn-primary cal-book-btn hidden" id="calBookBtn">Забронювати ці дати в Telegram</a>
      <div class="cal-note" id="calNote"></div>
    `;
    document.getElementById("calPrev").onclick = () => { shiftMonth(-1); renderGrids(); };
    document.getElementById("calNext").onclick = () => { shiftMonth(1); renderGrids(); };
  }

  function shiftMonth(delta){
    viewMonth += delta;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  }

  function buildMonthGrid(year, month){
    const first = new Date(year, month, 1);
    const startWeekday = (first.getDay() + 6) % 7; // Пн=0
    const daysInMonth = new Date(year, month+1, 0).getDate();

    let cells = "";
    for (let i=0;i<startWeekday;i++) cells += `<div class="cal-day cal-day-empty"></div>`;
    for (let day=1; day<=daysInMonth; day++){
      const d = new Date(year, month, day);
      const iso = toISO(d);
      const isPast = d < today;
      const busy = isBlocked(iso);
      let cls = "cal-day";
      if (isPast) cls += " cal-day-past";
      else if (busy) cls += " cal-day-busy";
      else cls += " cal-day-free";
      if (selStart === iso) cls += " cal-day-sel-start";
      if (selEnd === iso) cls += " cal-day-sel-end";
      if (selStart && selEnd && iso > selStart && iso < selEnd) cls += " cal-day-in-range";
      const disabled = isPast || busy;
      cells += `<div class="${cls}" ${disabled?'':`data-iso="${iso}"`}>${day}</div>`;
    }
    return `
      <div class="cal-month">
        <div class="cal-month-title">${MONTHS_UA[month]} ${year}</div>
        <div class="cal-weekdays">${WEEKDAYS_UA.map(w=>`<div>${w}</div>`).join("")}</div>
        <div class="cal-days">${cells}</div>
      </div>
    `;
  }

  function renderGrids(){
    document.getElementById("calMonths").textContent = "";
    const grids = document.getElementById("calGrids");
    let m1 = viewMonth, y1 = viewYear;
    let m2 = m1+1, y2 = y1;
    if (m2 > 11) { m2 = 0; y2++; }
    grids.innerHTML = buildMonthGrid(y1, m1) + buildMonthGrid(y2, m2);
    grids.querySelectorAll("[data-iso]").forEach(el=>{
      el.addEventListener("click", () => onDayClick(el.dataset.iso));
    });
    updateSummary();
  }

  function onDayClick(iso){
    if (!selStart || (selStart && selEnd)) {
      selStart = iso; selEnd = null;
    } else {
      if (iso <= selStart) { selStart = iso; selEnd = null; }
      else if (rangeHasBlocked(selStart, iso)) {
        selStart = iso; selEnd = null;
      } else {
        selEnd = iso;
      }
    }
    renderGrids();
  }

  function updateSummary(){
    const summary = document.getElementById("calSummary");
    const btn = document.getElementById("calBookBtn");
    if (selStart && selEnd) {
      const nights = Math.round((new Date(selEnd) - new Date(selStart)) / 86400000);
      summary.innerHTML = `Заїзд: <b>${toUA(new Date(selStart))}</b> → Виїзд: <b>${toUA(new Date(selEnd))}</b> (${nights} ${nights===1?"ніч":(nights<5?"ночі":"ночей")})`;
      const text = encodeURIComponent(`Вітаю! Хочу забронювати ${aptName || apt} з ${toUA(new Date(selStart))} по ${toUA(new Date(selEnd))} (${nights} ${nights===1?"ніч":(nights<5?"ночі":"ночей")}). Підкажіть, будь ласка, чи вільні ці дати?`);
      btn.href = `https://t.me/${telegramUser}?text=${text}`;
      btn.classList.remove("hidden");
    } else if (selStart) {
      summary.innerHTML = `Заїзд: <b>${toUA(new Date(selStart))}</b> — тепер оберіть дату виїзду`;
      btn.classList.add("hidden");
    } else {
      summary.textContent = "Оберіть дату заїзду та виїзду";
      btn.classList.add("hidden");
    }
  }

  async function load(){
    renderSkeleton();
    try {
      const r = await fetch(`/api/availability?apt=${encodeURIComponent(apt)}`);
      const data = await r.json();
      blocked = data.blocked || [];
      configured = data.configured !== false;
      if (!configured) {
        document.getElementById("calNote").textContent = "Календар синхронізується — поки що показуємо всі дати вільними. Актуальність уточнюйте у господаря.";
      }
    } catch (e) {
      document.getElementById("calNote").textContent = "Не вдалося завантажити календар зайнятості. Зв'яжіться з нами напряму, щоб уточнити дати.";
    }
    renderGrids();
  }

  load();
})();
