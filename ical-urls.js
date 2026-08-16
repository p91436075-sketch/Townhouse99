/*
  Посилання на iCal-експорт календарів зайнятості для кожного апартаменту.

  ЯК ОТРИМАТИ ПОСИЛАННЯ:

  Airbnb:
  1. Зайдіть у кабінет господаря на airbnb.com
  2. Відкрийте потрібне оголошення → "Календар" (Calendar)
  3. Натисніть "Доступність" → "Синхронізація календарів" (Sync calendars)
  4. Внизу буде посилання "Експорт календаря" (Export calendar) — скопіюйте його
     (виглядає як https://www.airbnb.com/calendar/ical/12345678.ics?s=xxxxxxxx)

  Booking.com:
  1. Зайдіть у Extranet (для господарів) на admin.booking.com
  2. Відкрийте об'єкт → "Календар та ціни" → "Синхронізація календарів"
  3. Скопіюйте посилання iCal-експорту для потрібного номера/об'єкта
     (виглядає як https://ical.booking.com/v1/export?t=xxxxxxxx)
     Увага: у House&House 84 в Booking один об'єкт на 4 номери — там може
     знадобитися окреме посилання для кожного номера (84/1, 84/2, 84/3, 84/4).
     Якщо Booking дає лише одне спільне посилання на весь об'єкт — впишіть
     його в усі 4 масиви apt1-apt4, це дасть трохи занижену точність
     (показуватиме зайнятим, навіть якщо зайнятий інший номер), але краще,
     ніж нічого.

  Після того як отримаєте посилання — вставте їх у масиви нижче замість
  порожніх рядків "" і залийте оновлений файл на GitHub. Більше нічого
  редагувати не потрібно — календарі на сайті запрацюють автоматично.
*/

const ICAL_URLS = {
  apt1: [ /* House&House 84/1 — Airbnb, потім Booking */
    "",
    "https://ical.booking.com/v1/export?t=0eea50cc-1c3e-4541-89bf-a4c3ed79fabd"
  ],
  apt2: [ /* House&House 84/2 */
    "",
    "https://ical.booking.com/v1/export?t=18b410f0-e71c-48fc-9039-8462680d0cba"
  ],
  apt3: [ /* House&House 84/3 */
    "",
    "https://ical.booking.com/v1/export?t=c016f323-bbfe-48af-9022-d4e4b5bf32cf"
  ],
  apt4: [ /* House&House 84/4 */
    "",
    "https://ical.booking.com/v1/export?t=bfe396a0-849d-4ee6-811a-10655fce24e9"
  ],
  apt5: [ /* Townhouse99 */
    "",
    "https://ical.booking.com/v1/export?t=3dea329b-9865-40e3-a825-f87a9c916e9e"
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = ICAL_URLS;
}
