/* ============================================================
   TractorMD — данные каталога (демо)
   В продакшене эти данные придут из WordPress (REST API), структура полей — 1:1.
   Даты считаются от сегодняшнего дня, чтобы демонстрация счётчиков
   всегда выглядела живой. В WordPress это будут реальные даты из админки.
   ============================================================ */
(function () {
  const DAY = 86400000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const plus = (n) => new Date(today.getTime() + n * DAY).toISOString().slice(0, 10);

  // ---- Контейнеры (партии поставки) ----
  const containers = [
    { code: 'T-S-O',    arrival: plus(9),  note_ru: 'уже в пути, разгрузка в Бельцах', note_ro: 'deja pe drum, descărcare la Bălți' },
    { code: 'IOM-146',  arrival: plus(16), note_ru: 'прошёл таможню порта Поти',       note_ro: 'a trecut vama portului Poti' },
    { code: 'WML38-894',arrival: plus(55), note_ru: 'загружен на складе в Осаке',       note_ro: 'încărcat în depozitul din Osaka' },
    { code: 'K2426',    arrival: plus(62), note_ru: 'формируется, добор позиций',       note_ro: 'se formează, completare poziții' },
    { code: 'DA-250117OI', arrival: plus(78), note_ru: 'закрытие контейнера — конец месяца', note_ro: 'închiderea containerului — sfârșit de lună' }
  ];

  // ---- Товары ----
  // status: stock | transit | reserved | sold
  // days   — срок поставки, который вводит менеджер (дней)
  // start  — дата постановки в поставку (дата добавления товара)
  // arrival— расчётная дата прибытия в Молдову
  // arrived— фактическая дата прибытия (для «в наличии»)
  const products = [
    {
      id: 1, slug: 'yanmar-ff205', brand: 'Yanmar', model: 'FF205',
      serial: '18E-11461', code: '#S02115', container: 'WML38-894',
      price: 4500, status: 'transit', days: 60, start: plus(-5), arrival: plus(55),
      power: '20–25 л.с.', cab: 'нет', hours: '1 240 м/ч', drive: '4WD',
      extras_ru: 'В комплекте фреза 1.3 м', extras_ro: 'În set: freză 1.3 m',
      images: ['img/tractor-yanmar.webp', 'img/tractor-in-container.webp', 'img/tractor-yard.webp'],
      desc_ru: 'Компактный трактор Yanmar FF205 в заводском состоянии, привезён из Японии. Подходит для работ в саду, на винограднике и небольшом хозяйстве. Проверен на месте в Японии, фотографии реальные — сделаны перед погрузкой в контейнер.',
      desc_ro: 'Tractor compact Yanmar FF205 în stare de fabrică, adus din Japonia. Potrivit pentru lucrări în grădină, vie și gospodărie mică. Verificat la fața locului în Japonia, fotografiile sunt reale — făcute înainte de încărcarea în container.'
    },
    {
      id: 2, slug: 'iseki-tf23', brand: 'Iseki', model: 'TF23',
      serial: '002606', code: '#I1180', container: 'T-S-O',
      price: 5500, status: 'transit', days: 14, start: plus(-45), arrival: plus(3),
      power: '20–25 л.с.', cab: 'нет', hours: '980 м/ч', drive: '4WD',
      extras_ru: 'Фреза 1.4 м, новый аккумулятор', extras_ro: 'Freză 1.4 m, baterie nouă',
      images: ['img/tractor-yard.webp', 'img/tractor-yanmar.webp'],
      desc_ru: 'Iseki TF23 — надёжная модель для междурядной обработки. Контейнер уже разгружается, машина будет в Молдове в течение недели. Можно забронировать до прибытия и получить скидку за предоплату.',
      desc_ro: 'Iseki TF23 — model fiabil pentru prelucrarea intervalului dintre rânduri. Containerul se descarcă deja, mașina va fi în Moldova în decurs de o săptămână. Poate fi rezervată înainte de sosire, cu reducere la avans.'
    },
    {
      id: 3, slug: 'hinomoto-n200', brand: 'Hinomoto', model: 'N200',
      serial: '00758', code: '#H2044', container: 'WML38-894',
      price: 4200, status: 'transit', days: 60, start: plus(-5), arrival: plus(55),
      power: '20–25 л.с.', cab: 'нет', hours: '1 510 м/ч', drive: '4WD',
      extras_ru: 'Без навесного оборудования', extras_ro: 'Fără echipament atașat',
      images: ['img/tractor-in-container.webp', 'img/tractor-yard.webp'],
      desc_ru: 'Hinomoto N200 — компактный трактор для сада и теплиц. Едет в контейнере WML38-894, прибытие в Молдову — примерно через два месяца. Бронь держит машину за вами до прибытия.',
      desc_ro: 'Hinomoto N200 — tractor compact pentru grădină și sere. Sosește în containerul WML38-894, în Moldova aproximativ peste două luni. Rezervarea ține mașina pentru dvs. până la sosire.'
    },
    {
      id: 4, slug: 'kubota-gb20', brand: 'Kubota', model: 'GB20',
      serial: '50389', code: '#K7712', container: 'IOM-146',
      price: 5400, status: 'transit', days: 30, start: plus(-45), arrival: plus(-6),
      power: '20–25 л.с.', cab: 'нет', hours: '1 120 м/ч', drive: '4WD',
      extras_ru: 'Ожидается задержка рейса — уточняйте у менеджера', extras_ro: 'Se așteaptă întârziere — verificați cu managerul',
      images: ['img/tractor-yanmar.webp'],
      desc_ru: 'Kubota GB20 — один из самых востребованных компактных тракторов. По контейнеру IOM-146 возникла задержка на таможне, точная дата подтверждается менеджером.',
      desc_ro: 'Kubota GB20 — unul dintre cele mai căutate tractoare compacte. Containerul IOM-146 are o întârziere la vamă, data exactă se confirmă de manager.'
    },
    {
      id: 5, slug: 'mitsubishi-mt205', brand: 'Mitsubishi', model: 'MT205',
      serial: '82270', code: '#M3301', container: 'IOM-146',
      price: 4500, status: 'reserved', days: 30, start: plus(-44), arrival: plus(16),
      power: '20–25 л.с.', cab: 'нет', hours: '1 300 м/ч', drive: '4WD',
      extras_ru: 'Забронирован: внесена предоплата', extras_ro: 'Rezervat: avans achitat',
      images: ['img/tractor-yard.webp', 'img/tractor-in-container.webp'],
      desc_ru: 'Mitsubishi MT205 — забронирован клиентом. Если бронь отменится, позиция снова появится в продаже — оставьте заявку, мы сообщим.',
      desc_ro: 'Mitsubishi MT205 — rezervat de un client. Dacă rezervarea se anulează, poziția revine în vânzare — lăsați o cerere și vă anunțăm.'
    },
    {
      id: 6, slug: 'yanmar-ke-60', brand: 'Yanmar', model: 'KE-60',
      serial: '13926', code: '#S01980', container: 'склад',
      price: 4400, status: 'stock', days: 0, start: plus(-70), arrival: plus(-12), arrived: plus(-12),
      power: '30+ л.с.', cab: 'есть', hours: '2 100 м/ч', drive: '4WD',
      extras_ru: 'В наличии на складе в Бельцах, можно смотреть', extras_ro: 'Disponibil în depozitul din Bălți, se poate vedea',
      images: ['img/tractor-yard.webp'],
      desc_ru: 'Yanmar KE-60 с кабиной — уже в Молдове, на складе. Можно приехать, посмотреть и забрать в день оплаты. Прошёл проверку в нашем сервисе, масла и фильтры заменены.',
      desc_ro: 'Yanmar KE-60 cu cabină — deja în Moldova, în depozit. Puteți veni, vedea și ridica în ziua plății. Verificat în service-ul nostru, uleiurile și filtrele schimbate.'
    },
    {
      id: 7, slug: 'shibaura-p15f', brand: 'Shibaura', model: 'P15F',
      serial: '20300', code: '#B5510', container: 'склад',
      price: 3200, status: 'stock', days: 0, start: plus(-64), arrival: plus(-16), arrived: plus(-16),
      power: '15–20 л.с.', cab: 'нет', hours: '1 640 м/ч', drive: '4WD',
      extras_ru: 'В наличии, состояние «как из контейнера»', extras_ro: 'Disponibil, stare „ca din container”',
      images: ['img/tractor-in-container.webp'],
      desc_ru: 'Shibaura P15F — недорогой вариант для небольшого участка. В наличии, без предпродажной подготовки — со скидкой 400 €.',
      desc_ro: 'Shibaura P15F — o variantă accesibilă pentru un teren mic. Disponibil, fără pregătire înainte de vânzare — cu reducere de 400 €.'
    },
    {
      id: 8, slug: 'yanmar-f14d', brand: 'Yanmar', model: 'F14D',
      serial: '05211', code: '#S01877', container: 'склад',
      price: 3200, status: 'sold', days: 0, start: plus(-90), arrival: plus(-40), arrived: plus(-40),
      power: '15–20 л.с.', cab: 'нет', hours: '1 780 м/ч', drive: '4WD',
      extras_ru: 'Продан 12.09.2026', extras_ro: 'Vândut 12.09.2026',
      images: ['img/tractor-yanmar.webp'],
      desc_ru: 'Yanmar F14D — продан. Оставьте заявку, мы сообщим о похожих машинах в следующих контейнерах.',
      desc_ro: 'Yanmar F14D — vândut. Lăsați o cerere și vă anunțăm despre utilaje similare în următoarele containere.'
    },
    {
      id: 9, slug: 'yanmar-ym1610d', brand: 'Yanmar', model: 'YM1610D',
      serial: '01714', code: '#S02006', container: 'K2426',
      price: 3400, status: 'transit', days: 62, start: plus(-3), arrival: plus(62),
      power: '15–20 л.с.', cab: 'нет', hours: '1 450 м/ч', drive: '4WD',
      extras_ru: 'В контейнере добираем позиции', extras_ro: 'Se completează pozițiile în container',
      images: ['img/tractor-yard.webp'],
      desc_ru: 'Yanmar YM1610D — проверенный рабочий трактор для хозяйства. Контейнер K2426 формируется, погрузка — в конце месяца.',
      desc_ro: 'Yanmar YM1610D — tractor de lucru verificat pentru gospodărie. Containerul K2426 se formează, încărcarea — la sfârșitul lunii.'
    },
    {
      id: 10, slug: 'iseki-tx1510', brand: 'Iseki', model: 'TX1510',
      serial: '005498', code: '#I1155', container: 'DA-250117OI',
      price: 3300, status: 'transit', days: 78, start: plus(-1), arrival: plus(78),
      power: '15–20 л.с.', cab: 'нет', hours: '1 900 м/ч', drive: '4WD',
      extras_ru: 'Свежая позиция из Японии', extras_ro: 'Poziție nouă din Japonia',
      images: ['img/tractor-in-container.webp'],
      desc_ru: 'Iseki TX1510 — только что добавлен, фотографии сделаны в Японии перед погрузкой. Бронь открыта заранее: чем раньше, тем больше выбор.',
      desc_ro: 'Iseki TX1510 — tocmai adăugat, fotografiile sunt făcute în Japonia înainte de încărcare. Rezervarea este deschisă din timp: cu cât mai devreme, cu atât mai multă alegere.'
    }
  ];

  // ---- Тексты интерфейса (RU / RO) ----
  const i18n = {
    'nav.catalog':      { ru: 'Каталог', ro: 'Catalog' },
    'bc.home':          { ru: 'Главная', ro: 'Acasă' },
    'nav.how':          { ru: 'Как купить', ro: 'Cum cumperi' },
    'nav.containers':   { ru: 'Контейнеры', ro: 'Containere' },
    'nav.contacts':     { ru: 'Контакты', ro: 'Contacte' },
    'nav.book':         { ru: 'Забронировать', ro: 'Rezervă' },

    'hero.kicker':      { ru: 'Импорт напрямую из Японии', ro: 'Import direct din Japonia' },
    'hero.title':       { ru: 'Японские тракторы <em>контейнер за контейнером</em>', ro: 'Tractoare japoneze, <em>container cu container</em>' },
    'hero.text':        { ru: 'Каждый трактор — конкретный экземпляр со своей серией, реальными фотографиями и ценой. Видно, что уже в Молдове, что ещё в пути и когда приезжает.', ro: 'Fiecare tractor este un exemplar anume, cu seria lui, pozele lui reale și prețul lui. Se vede ce e deja în Moldova, ce e pe drum și când sosește.' },
    'hero.btn.catalog': { ru: 'Смотреть каталог', ro: 'Vezi catalogul' },
    'hero.btn.how':     { ru: 'Как это работает', ro: 'Cum funcționează' },

    'stats.positions':  { ru: 'позиций в каталоге', ro: 'poziții în catalog' },
    'stats.intransit':  { ru: 'в пути', ro: 'pe drum' },
    'stats.next':       { ru: 'ближайшее прибытие', ro: 'următoarea sosire' },
    'stats.updated':    { ru: 'каталог обновлён', ro: 'catalog actualizat' },

    'how.title':        { ru: 'Как купить', ro: 'Cum cumperi' },
    'how.subtitle':     { ru: 'От страницы трактора — до вашего двора.', ro: 'De la pagina tractorului — până la curtea dvs.' },
    'how.1.t':          { ru: 'Выбираете', ro: 'Alegeți' },
    'how.1.d':          { ru: 'Фильтруете по марке, мощности и дате прибытия или ищете по серийному номеру.', ro: 'Filtrați după marcă, putere sau data sosirii, ori căutați după seria tractorului.' },
    'how.2.t':          { ru: 'Бронируете', ro: 'Rezervați' },
    'how.2.d':          { ru: 'Оставляете имя, фамилию и телефон — менеджер звонит и подтверждает наличие.', ro: 'Lăsați nume, prenume și telefon — managerul sună și confirmă disponibilitatea.' },
    'how.3.t':          { ru: 'Вносите предоплату', ro: 'Achitați avansul' },
    'how.3.d':          { ru: 'После предоплаты положение товара меняется на «Забронировано» — его никто больше не купит.', ro: 'După avans, poziția devine „Rezervat” — nimeni altcineva nu o mai poate cumpăra.' },
    'how.4.t':          { ru: 'Забираете', ro: 'Ridicați' },
    'how.4.d':          { ru: 'Когда трактор приходит в Молдову, менеджер сообщает дату выдачи. Доставку можем организовать.', ro: 'Când tractorul ajunge în Moldova, managerul anunță data predării. Livrarea o putem organiza noi.' },

    'containers.title': { ru: 'Контейнеры в пути', ro: 'Containere pe drum' },
    'containers.sub':   { ru: 'Нажмите на контейнер, чтобы посмотреть, что в нём едет.', ro: 'Apăsați pe container pentru a vedea ce sosește în el.' },
    'containers.units': { ru: 'позиций', ro: 'poziții' },
    'containers.arrive':{ ru: 'прибытие', ro: 'sosire' },

    'catalog.title':    { ru: 'Техника в наличии и в пути', ro: 'Utilaje disponibile și pe drum' },
    'catalog.search':   { ru: 'Поиск: марка, модель или серия...', ro: 'Căutare: marcă, model sau serie...' },
    'catalog.all':      { ru: 'Все', ro: 'Toate' },
    'catalog.fresh':    { ru: 'Свободные', ro: 'Libere' },
    'catalog.freeOnly': { ru: 'только не забронированные', ro: 'doar cele nerezervate' },
    'catalog.rules':    { ru: 'Сбросить фильтры', ro: 'Resetați filtrele' },
    'catalog.sort':     { ru: 'Сортировка', ro: 'Sortare' },
    'catalog.sort.arrival': { ru: 'по дате прибытия', ro: 'după data sosirii' },
    'catalog.sort.priceAsc':{ ru: 'цена: от дешёвых', ro: 'preț crescător' },
    'catalog.sort.priceDesc':{ ru: 'цена: от дорогих', ro: 'preț descrescător' },
    'catalog.sort.power':   { ru: 'по мощности', ro: 'după putere' },
    'catalog.shown':    { ru: 'показано', ro: 'afișate' },
    'catalog.of':       { ru: 'из', ro: 'din' },
    'catalog.reset':    { ru: 'Сбросить', ro: 'Resetare' },
    'catalog.nothing':  { ru: 'Ничего не найдено. Попробуйте другой фильтр или сбросьте поиск.', ro: 'Nimic găsit. Încercați alt filtru sau resetați căutarea.' },
    'catalog.fromCont': { ru: 'Контейнер', ro: 'Container' },

    'card.details':     { ru: 'Подробнее', ro: 'Detalii' },
    'card.reserve':     { ru: 'Забронировать', ro: 'Rezervă' },
    'card.inquiry':     { ru: 'Запросить цену', ro: 'Cereți prețul' },
    'card.reserved':    { ru: 'Забронировано', ro: 'Rezervat' },
    'card.sold':        { ru: 'Продан', ro: 'Vândut' },
    'card.ask':         { ru: 'Смотреть похожие', ro: 'Vezi similare' },

    'st.stock':         { ru: 'В наличии', ro: 'Disponibil' },
    'st.transit':       { ru: 'В дороге', ro: 'Pe drum' },
    'st.reserved':      { ru: 'Забронировано', ro: 'Rezervat' },
    'st.sold':          { ru: 'Продан', ro: 'Vândut' },

    'cnt.left':         { ru: 'До прибытия', ro: 'Până la sosire' },
    'cnt.days':         { ru: 'дн.', ro: 'zile' },
    'cnt.expected':     { ru: 'поставка ожидается', ro: 'sosire estimată' },
    'cnt.soon':         { ru: 'Ожидается со дня на день', ro: 'Se așteaptă în orice zi' },
    'cnt.calc':         { ru: 'расчётная дата', ro: 'data estimată' },
    'cnt.late':         { ru: 'Рейс задерживается', ro: 'Transportul întârzie' },
    'cnt.late.sub':     { ru: 'точную дату подтверждает менеджер', ro: 'data exactă o confirmă managerul' },
    'cnt.arrived':      { ru: 'В Молдове с', ro: 'În Moldova din' },
    'cnt.passed':       { ru: 'из', ro: 'din' },
    'cnt.passed2':      { ru: 'дней поставки прошло', ro: 'zile de livrare au trecut' },
    'cnt.res.days':     { ru: 'Забронирован, до прибытия', ro: 'Rezervat, până la sosire' },

    'p.specs':          { ru: 'Характеристики', ro: 'Caracteristici' },
    'p.power':          { ru: 'Мощность', ro: 'Putere' },
    'p.hours':          { ru: 'Наработка', ro: 'Ore de lucru' },
    'p.drive':          { ru: 'Привод', ro: 'Tracțiune' },
    'p.cab':            { ru: 'Кабина', ro: 'Cabină' },
    'p.serial':         { ru: 'Серия', ro: 'Serie' },
    'p.code':           { ru: 'Код позиции', ro: 'Cod poziție' },
    'p.container':      { ru: 'Контейнер', ro: 'Container' },
    'p.askprice':       { ru: 'По запросу', ro: 'La cerere' },
    'p.call':           { ru: 'Позвонить', ro: 'Sunați' },
    'p.similar':        { ru: 'Похожие позиции', ro: 'Poziții similare' },
    'p.description':    { ru: 'Описание', ro: 'Descriere' },
    'p.back':           { ru: 'Назад в каталог', ro: 'Înapoi la catalog' },
    'p.notfound':       { ru: 'Такой позиции нет — возможно, она уже продана.', ro: 'Această poziție nu există — poate a fost vândută.' },

    'disc.title':       { ru: 'Возможные скидки', ro: 'Reduceri posibile' },
    'disc.1':           { ru: '<b>−400 €</b>, если берёте как из контейнера, без предпродажной подготовки', ro: '<b>−400 €</b> dacă îl luați ca din container, fără pregătire înainte de vânzare' },
    'disc.2':           { ru: '<b>−200 €</b> при предоплате от 40 % не позже чем за две недели до прибытия', ro: '<b>−200 €</b> la avans de la 40 % cu cel puțin două săptămâni înainte de sosire' },

    'cta.title':        { ru: 'Не нашли нужную модель?', ro: 'Nu ați găsit modelul dorit?' },
    'cta.text':         { ru: 'Оставьте заявку — подберём трактор в следующем контейнере под ваши задачи и бюджет.', ro: 'Lăsați o cerere — vom găsi un tractor în următorul container, potrivit sarcinilor și bugetului dvs.' },
    'cta.submit':       { ru: 'Отправить заявку', ro: 'Trimiteți cererea' },

    'form.name':        { ru: 'Имя', ro: 'Nume' },
    'form.surname':     { ru: 'Фамилия', ro: 'Prenume' },
    'form.phone':       { ru: 'Телефон', ro: 'Telefon' },
    'form.comment':     { ru: 'Комментарий', ro: 'Comentariu' },
    'form.consent':     { ru: 'Согласен на обработку персональных данных для связи по заявке', ro: 'Sunt de acord cu prelucrarea datelor pentru a fi contactat' },
    'form.book.title':  { ru: 'Забронировать', ro: 'Rezervă' },
    'form.book.note':   { ru: 'Менеджер позвонит, подтвердит наличие и расскажет про предоплату.', ro: 'Managerul va suna, va confirma disponibilitatea și va explica despre avans.' },
    'form.ok.title':    { ru: 'Заявка принята!', ro: 'Cererea a fost primită!' },
    'form.ok.text':     { ru: 'Менеджер свяжется с вами в ближайшее время. Заявка уже ушла на почту менеджера.', ro: 'Managerul vă va contacta în curând. Cererea a fost trimisă pe e-mailul managerului.' },
    'form.close':       { ru: 'Закрыть', ro: 'Închide' },
    'form.cancel':      { ru: 'Отмена', ro: 'Anulare' },

    'adv.1.t':          { ru: 'Реальные фото', ro: 'Poze reale' },
    'adv.1.d':          { ru: 'Каждый трактор фотографируем до погрузки в контейнер — это тот самый экземпляр.', ro: 'Fiecare tractor este fotografiat înainte de încărcare — acesta este exact exemplarul.' },
    'adv.2.t':          { ru: 'Своя серия и код', ro: 'Serie și cod propriu' },
    'adv.2.d':          { ru: 'По серийному номеру находите машину в каталоге и проверяете её историю.', ro: 'După seria de șasiu găsiți utilajul în catalog și verificați istoricul.' },
    'adv.3.t':          { ru: 'Открытая дата прибытия', ro: 'Data sosirii transparentă' },
    'adv.3.d':          { ru: 'Видно, когда контейнер приходит в Молдову и сколько дней осталось.', ro: 'Se vede când sosește containerul în Moldova și câte zile au rămas.' },
    'adv.4.t':          { ru: 'Сервис и запчасти', ro: 'Service și piese' },
    'adv.4.d':          { ru: 'Готовим машину перед выдачей и обеспечиваем запчасти для японской техники.', ro: 'Pregătim utilajul înainte de predare și asigurăm piese pentru tehnica japoneză.' },

    'footer.tag':       { ru: 'Импорт японской техники с гарантией прозрачности: серия, фото, дата прибытия.', ro: 'Import de tehnică japoneză cu transparență: serie, poze, data sosirii.' },
    'footer.updated':   { ru: 'Каталог обновлён', ro: 'Catalog actualizat' },
    'footer.live':      { ru: 'Наличие проверяется в реальном времени', ro: 'Disponibilitatea se verifică în timp real' },
    'footer.rights':    { ru: 'Все права защищены.', ro: 'Toate drepturile rezervate.' },
    'footer.address':   { ru: 'г. Бельцы, ул. Индустриальная, 15', ro: 'or. Bălți, str. Industrială, 15' },
    'footer.work':      { ru: 'Пн–Пт 8:00–18:00, Сб 9:00–14:00', ro: 'Lun–Vin 8:00–18:00, Sâm 9:00–14:00' },
    'footer.demo.admin':{ ru: 'Демо-админка', ro: 'Demo admin' }
  };

  window.AGRO = {
    today, plus,
    phone: '+373 60 123 456',
    phoneRaw: '+37360123456',
    whatsapp: '37360123456',
    email: 'office@tractormd.md',
    containers, products, i18n
  };
})();
