/* ЗКО Онлайн-записи — клиентская часть (PWA). Номер версии берётся из config.json (единый источник). Секретов в файле нет; адрес шлюза берётся из config.json, адрес самого сайта — из браузера. */
(function () {
'use strict';
var CFG = {}, TOKEN = '', APP = document.getElementById('app'), TIMER = null, VERSION = '', DEMO = false, MEM = {};
var ERR = {
  bad_instagram: 'Укажите ссылку на Instagram или имя вида @name.', ig_premium: 'Ссылка на Instagram доступна на тарифе VIP Premium.', no_photo: 'Фото не найдено.', photo_unavailable: 'Фото сейчас недоступно.',
  auth_required: 'Нужно войти.', pin_required: 'Введите ПИН-код.', not_master: 'Этот номер не зарегистрирован как мастер.', blocked: 'Кабинет заблокирован администратором.',
  bad_code: 'Неверный код.', code_dead: 'Код сгорел после 3 ошибок. Получите новый.', code_expired: 'Код устарел. Получите новый.', code_not_sent: 'Сначала откройте бота и поделитесь номером.',
  bad_pin: 'Неверный ПИН-код.', pin_locked: 'Слишком много ошибок. Подождите 15 минут.', bad_pin_format: 'ПИН — ровно 4 цифры.', bad_name: 'Введите имя (от 2 букв).', bad_slug: 'Адрес: 3–30 символов, латиница, цифры и «_». Это слово занято системой или не подходит.',
  slug_taken: 'Такой адрес уже занят.', already_master: 'Вы уже зарегистрированы как мастер.', no_master: 'Мастер не найден.', slot_taken: 'Это время уже занято. Выберите другое.', self_booking: 'Нельзя записаться к самому себе.',
  cloud_ban: 'Запись недоступна: номер заблокирован платформой.', master_ban: 'Мастер не принимает запись с этого номера.', bad_services: 'Выбранные услуги недоступны.', too_many: 'Слишком много активных записей или запросов. Подождите.',
  overlap: 'У вас уже есть запись на это время.', no_booking: 'Запись не найдена.', forbidden: 'Недостаточно прав.', bad_status: 'Так отметить нельзя.', not_yet: 'Визит ещё не начался.', not_done: 'Оценить можно после завершённого визита.',
  bad_card: 'Номер карточки: от 2 до 40 символов (буквы, цифры, дефис).', card_taken: 'Эта карточка уже привязана к другому мастеру.', bad_stars: 'Поставьте от 1 до 5 звёзд.', limit_free: 'Бесплатный старт: до 3 услуг. Подключите VIP Light или VIP Premium, чтобы добавить больше.', day_limit: 'У мастера на этот день набрано максимум онлайн-записей. Выберите другой день.', need_addr: 'Укажите адрес, куда приехать (улица и дом).', no_card: 'VIP доступен только мастерам с карточкой в Картотеке ЗКО. Привяжите карточку в профиле.', bad_category: 'Выберите категорию из списка.', bad_mode: 'Выберите формат приёма.', bad_title: 'Введите название услуги.', bad_price: 'Цена указана неверно.', bad_minutes: 'Длительность: от 30 минут, шаг 30.',
  no_service: 'Услуга не найдена.', bad_schedule: 'Проверьте часы: конец позже начала, перерыв внутри рабочего времени.', bad_date: 'Неверная дата.', no_history: 'В чёрный список можно добавить только того, кто записывался к вам.', bad_phone: 'Неверный номер.',
  bot_not_set: 'Сервис ещё не настроен (нет бота).', busy: 'Сервер занят, повторите через минуту.', bad_key: 'Ошибка сеанса, обновите страницу.', server_error: 'Ошибка сервера. Повторите позже.', net: 'Нет связи. Проверьте интернет.', no_gateway: 'Сервис ещё не подключён (не указан адрес шлюза в config.json).'
};
ERR.owner_bad_pass = 'Пароль неверный.';
ERR.owner_pass_none = 'Постоянный пароль ещё не передан в настройки шлюза.';
ERR.owner_no_tg = 'Telegram владельца ещё не привязан: откройте бота и нажмите «Старт».';
ERR.owner_code_limit = 'Слишком много запросов кода. Попробуйте через час.';
ERR.tg_failed = 'Не удалось отправить код в Telegram. Проверьте, что бот подключён.';
ERR.promo_locked = 'Эта акция откроется на более высоком тарифе.';
ERR.promo_empty = 'Впишите текст условий для включённой акции.';
ERR.pin_not_set = 'ПИН-код ещё не задан.';
ERR.no_review = 'Отзыв не найден.'; ERR.no_ban = 'Бан не найден.'; ERR.bad_level = 'Неизвестный тариф.';
ERR.nocard = 'У мастера не привязана карточка Картотеки — платный тариф недоступен.';
ERR.ad_empty = 'Текст объявления — от 3 знаков.'; ERR.bad_audience = 'Неизвестная аудитория объявления.';
ERR.net = 'Нет связи с сервисом — похоже, пропал интернет. Проверьте связь и попробуйте ещё раз.';
ERR.timeout = 'Сервер долго не отвечает. Проверьте интернет и нажмите «Повторить».';
ERR.bad_response = 'Сервис сейчас отвечает не так, как обычно — возможно, идёт обновление. Подождите минуту и повторите.';
ERR.server_error = 'Что-то пошло не так на нашей стороне. Подождите минуту и повторите.';
ERR.no_gateway = 'Сервис ещё настраивается. Загляните чуть позже.';
ERR.bot_not_set = 'Вход по коду пока недоступен — сервис ещё настраивается. Загляните чуть позже.';
ERR.owner_bad_code = 'Код неверный. Проверьте цифры или запросите новый.';
ERR.owner_code_none = 'Код не найден или устарел. Запросите новый код.';
ERR.owner_locked = 'Слишком много неверных попыток. Запросите резервный код из Telegram — вход снова откроется.';
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function ls(k, v) { if (DEMO && k !== 'zk_theme') { if (v === undefined) return MEM[k] === undefined ? null : MEM[k]; if (v === null) delete MEM[k]; else MEM[k] = String(v); return null; } try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
function toast(t) { var el = document.getElementById('toast'); el.textContent = t; el.className = 'show'; clearTimeout(toast.t); toast.t = setTimeout(function () { el.className = ''; }, 3200); }
function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₸'; }
function dur(m) { var h = Math.floor(m / 60), r = m % 60; return (h ? h + ' ч' : '') + (h && r ? ' ' : '') + (r ? r + ' мин' : ''); }
function stars(n) { n = Math.round(n); return '<span class="stars">' + '★'.repeat(n) + '☆'.repeat(5 - n) + '</span>'; }
function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
/* config.json — русские ключи (старые английские тоже принимаются) */
function normCfg(c) {
  var m = { 'адресКартотеки': 'cartUrl', 'версия': 'version', 'среда': 'env', 'адресШлюза': 'gatewayUrl', 'имяБота': 'botUsername', 'адресСайта': 'siteUrl', 'ватсапАдмина': 'adminWhatsApp' };
  Object.keys(m).forEach(function (k) { if (c[k] !== undefined && c[k] !== '') c[m[k]] = c[k]; });
  if (c.env === 'тест') c.env = 'test';
  return c;
}
function tzH() { var v = parseFloat(CFG && CFG['часовойПояс']); return isNaN(v) ? 5 : v; }
function zkoToday() { var d = new Date(Date.now() + tzH() * 3600000); return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
function addDay(s, n) { var p = s.split('-'); var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n)); return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
function ruDate(s) { var p = s.split('-'), dn = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'], d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); return dn[d.getUTCDay()] + ', ' + p[2] + '.' + p[1] + '.' + p[0]; }
function rndKey() { var a = new Uint8Array(16); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.floor(Math.random() * 256); }); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
var API_TIMEOUT = 20000;   /* ни один запрос не висит молча: через 20 секунд — понятный ответ и кнопка «Повторить» */
function apiErr(code, action) { var er = new Error(code); er.zk = 1; er.action = action; return er; }
function api(action, data) {
  var body = Object.assign({ action: action }, data || {}); if (TOKEN && body.token === undefined) body.token = TOKEN;
  var done = function (j) { if (!j || !j.ok) { j = j || {}; if (j.error === 'auth_required' && TOKEN && !DEMO) { setToken(''); } var er = apiErr(j.error || 'server_error', action); er.data = j; throw er; } return j; };
  /* ДЕМО: запрос выполняется в самой странице (demo.js), в сеть не уходит НИЧЕГО */
  if (DEMO) return window.ZKDemo.call(body).then(done);
  if (!CFG.gatewayUrl) return Promise.reject(apiErr('no_gateway', action));
  var ctl = window.AbortController ? new AbortController() : null, timedOut = false, tm = null;
  var req = fetch(CFG.gatewayUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
    .then(function (r) { return r.text(); })
    .then(function (t) { try { return JSON.parse(t); } catch (e) { throw apiErr('bad_response', action); } })
    .catch(function (e) { if (e && e.zk) throw e; throw apiErr(timedOut ? 'timeout' : 'net', action); });
  var limit = new Promise(function (_, rej) { tm = setTimeout(function () { timedOut = true; if (ctl) { try { ctl.abort(); } catch (e) {} } rej(apiErr('timeout', action)); }, API_TIMEOUT); });
  return Promise.race([req, limit]).then(function (j) { clearTimeout(tm); return done(j); }, function (e) { clearTimeout(tm); throw e; });
}
function errText(e) { var c = e && e.message; if (c === 'cloud_ban' && e.data && e.data.ban) return 'Запись закрыта' + (e.data.ban.until ? ' до ' + dmy(e.data.ban.until) : '') + '. Причина: ' + e.data.ban.reason + '.'; return ERR[c] || 'Не получилось выполнить действие. Попробуйте ещё раз.'; }
function setToken(t) { TOKEN = t || ''; if (!DEMO) ls('zk_token', t || null); if (!t) { ls('zk_role', null); ls('zk_cmode', null); navPaint(); } }
function verTxt() { return VERSION || '—'; }
function paintVer() { Array.prototype.forEach.call(document.querySelectorAll('.js-ver'), function (e) { e.textContent = verTxt(); }); var v = document.getElementById('ver'); if (v) v.textContent = verTxt(); }
function isMasterRole() { return ls('zk_role') === 'master'; }
function inClientMode() { return isMasterRole() && ls('zk_cmode') === '1'; }
function setRole(isMaster, cmode) { ls('zk_role', isMaster ? 'master' : null); ls('zk_cmode', isMaster && cmode ? '1' : null); navPaint(); }
function navPaint() { var b = document.querySelector('#nav [data-n="mid"]'); if (!b) return; var m = isMasterRole() && !inClientMode(); b.innerHTML = m ? '✂️<span>Мастер</span>' : '📋<span>Мои записи</span>'; b.setAttribute('data-r', m ? 'cab' : 'my'); }
function dlg(id) { var old = document.getElementById(id); if (old) old.remove(); var b = document.createElement('div'); b.id = id; b.className = 'wn-back'; document.body.appendChild(b); b.onclick = function (e) { if (e.target === b) b.remove(); }; return b; }
function view(html) { stopTimer(); APP.innerHTML = html; window.scrollTo(0, 0); }
function stopTimer() { if (TIMER) { clearInterval(TIMER); TIMER = null; } }
function $(s, r) { return (r || APP).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || APP).querySelectorAll(s)); }
function go(h) { location.hash = h; }
function load(fn) { APP.insertAdjacentHTML('beforeend', '<p class="muted center" id="ld">…</p>'); return fn().then(function (x) { var l = $('#ld'); if (l) l.remove(); return x; }, function (e) { var l = $('#ld'); if (l) l.remove(); toast(errText(e)); throw e; }); }

/* ---------- тарифы, категории, подсказки, навигация, статистика ---------- */
var CART = 'https://zko-spravochnik.github.io/cartoteka/';
function cartUrl() { return CFG.cartUrl || CART; }
function dmy(x) { return String(x || '').split('-').reverse().join('.'); }
var CATS = [['beauty', '✂️ Парикмахеры и красота'], ['massage', '💆‍♂️ Массаж, бани и сауны'], ['auto', '🚗 Автосервис и шиномонтаж'], ['health', '🦷 Стоматология и здоровье'], ['septic', '🚛 Септик и спецтехника'], ['home', '🔧 Мастера на дом и ремонт'], ['photo', '📸 Фото, видео и праздники'], ['edu', '🎓 Репетиторы и обучение'], ['other', '📦 Другие услуги']];
var MODEL = { home: 'Приём у мастера', visit: 'Выезд на дом', both: 'У мастера или выезд на дом' };
function catLabel(k) { for (var i = 0; i < CATS.length; i++) if (CATS[i][0] === k) return CATS[i][1]; return ''; }
function catOptions(sel, blank) { return (blank ? '<option value="">' + blank + '</option>' : '') + CATS.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === sel ? ' selected' : '') + '>' + c[1] + '</option>'; }).join(''); }
function tgNotice() { return '<div class="notice">⚠️ <b>Обязательное условие для записи и работы:</b> установленный Telegram на телефоне, привязанный именно к тому номеру, который вы указываете на сайте (туда приходят бесплатные коды входа, заявки и напоминания).</div>'; }
function tierBadge(t) { return t === 'premium' ? '<span class="badge gold">👑 VIP Premium</span>' : (t === 'light' ? '<span class="badge teal">💎 VIP Light</span>' : ''); }
function subBadge(s) { return s.level === 'premium' ? '<span class="badge gold">👑 VIP Premium</span>' : (s.level === 'light' ? '<span class="badge teal">💎 VIP Light</span>' : (s.paused ? '<span class="badge">⏸ Light на паузе</span>' : '<span class="badge">Бесплатный старт</span>')); }
function masterMeta(m) { var a = [catLabel(m.category), m.village ? '📍 с. ' + m.village : '', MODEL[m.mode] || '', (m.address && m.mode !== 'visit') ? 'адрес: ' + m.address : ''].filter(Boolean); return a.length ? '<div class="muted small">' + a.map(esc).join(' · ') + '</div>' : ''; }
function modal(title, body) {
  var old = document.getElementById('mdBox'); if (old) old.remove();
  var box = document.createElement('div'); box.id = 'mdBox'; box.className = 'wn-back';
  box.innerHTML = '<div class="wn-card" role="dialog" aria-modal="true"><h2>' + esc(title) + '</h2>' + body + '<button class="btn" id="mdOk">[ Понятно, закрыть ]</button></div>';
  document.body.appendChild(box); document.getElementById('mdOk').onclick = function () { box.remove(); }; box.onclick = function (e) { if (e.target === box) box.remove(); };
}
function copyText(t, ok) {
  function fb() { try { var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'; document.body.appendChild(ta); ta.select(); var r = document.execCommand('copy'); ta.remove(); if (r) { toast(ok || 'Скопировано'); return; } } catch (e) {} toast('Не удалось скопировать — выделите текст вручную'); }
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(function () { toast(ok || 'Скопировано'); }, fb); return; } } catch (e) {}
  fb();
}
function navShow(on, act) { var n = document.getElementById('nav'); if (!n) return; navPaint(); if (act === 'my' || act === 'cab') act = 'mid'; n.hidden = !on; document.body.classList.toggle('hasnav', !!on); $$('button', n).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-n') === act); }); }
function navGo(h) { if ((location.hash || '#/') === h) route(); else go(h); }
function devId() { var d = ls('zk_dev'); if (!d || d.length < 8) { d = rndKey().slice(0, 24); ls('zk_dev', d); } return d; }
function ping(kind) { if (DEMO || ls('zk_owner') === '1' || !CFG.gatewayUrl) return; api('statPing', { dev: devId(), kind: kind }).catch(function () {}); }
var DEFERRED = null;

/* ---------- согласие на обработку данных и «Условия и политика конфиденциальности» ---------- */
var POLICY = [
  ['Что это за сервис', 'ЗКО Онлайн-записи — сайт, где можно записаться к мастеру на удобное время. Услугу оказывает сам мастер, сервис только соединяет вас и помогает не перепутать время. Оплата — между вами и мастером на месте.'],
  ['Какие данные мы получаем', 'Клиент: номер телефона, имя, которое вы сами вводите, ваши записи (дата, время, услуги, сумма) и оценки. Мастер: имя или название, адрес личной страницы, описание, услуги, график. Для входа через Телеграм бот видит ваш номер и ваш номер аккаунта в Телеграме. ПИН-код мы не храним: сохраняется только его зашифрованный отпечаток.'],
  ['Зачем нужны эти данные', 'Чтобы записать вас и показать мастеру, кто придёт; прислать код входа, подтверждение и напоминание; показать оценки; защитить сервис от злоупотреблений (ложные записи, спам, оскорбления). Ни для чего другого данные не используются.'],
  ['Кто их видит', 'Мастер видит имя и номер телефона тех, кто записался именно к нему. Клиенты видят только публичную страницу мастера: имя, услуги, цены, свободное время, оценки. Администратор сервиса видит данные для поддержки и борьбы с нарушителями. Мы не продаём данные и не передаём их рекламным компаниям.'],
  ['Где хранятся', 'Данные лежат в закрытой Google-таблице сервиса. Для работы используются Телеграм (доставка кодов и уведомлений), Google (хранение) и GitHub Pages (показ сайта). Эти площадки работают по своим правилам.'],
  ['Сколько хранятся', 'Пока вы пользуетесь сервисом. По вашей просьбе данные удаляются в течение 30 дней. Исключение — запись в списке заблокированных: она нужна, чтобы нарушитель не вернулся под тем же номером.'],
  ['Ваши права', 'Вы можете в любой момент отозвать согласие, узнать, какие данные о вас хранятся, исправить или удалить их. Для этого напишите администратору сервиса (контакты — в карточке или у мастера, который вам дал ссылку). После отзыва согласия запись и вход по этому номеру станут недоступны.'],
  ['Правила пользования', 'Записывайтесь только на себя и только с настоящим номером. Не можете прийти — отмените запись заранее. Мастер указывает честные цены и вовремя отмечает визиты. Нельзя спамить, оскорблять, оставлять заведомо ложные оценки. За нарушения номер и страницу могут заблокировать.'],
  ['Безопасность', 'Код из Телеграма и ПИН-код никому не сообщайте — ни мастеру, ни «сотруднику сервиса». Мы никогда не просим их.'],
  ['Память устройства', 'Чтобы вам не вводить код каждый раз, сайт запоминает вход и выбранную тему на вашем телефоне. Выход из кабинета стирает вход.'],
  ['Изменения', 'Если правила изменятся, новая версия появится здесь. Продолжая пользоваться сервисом, вы соглашаетесь с актуальной версией.']
];
function consentHtml() { return '<label class="consent"><input type="checkbox" class="cons" checked><span>Нажимая кнопку, я даю согласие на обработку номера телефона для записи и связи с мастером. <a href="#" class="polLink">Условия и политика конфиденциальности</a></span></label>'; }
function policyOpen() {
  if (document.getElementById('polBox')) return;
  var box = document.createElement('div'); box.id = 'polBox'; box.className = 'wn-back';
  box.innerHTML = '<div class="wn-card" role="dialog" aria-modal="true"><h2>Условия и политика конфиденциальности</h2>' + POLICY.map(function (x, i) { return '<h3>' + (i + 1) + '. ' + esc(x[0]) + '</h3><p>' + esc(x[1]) + '</p>'; }).join('') + '<button class="btn" id="polOk">[ Понятно, закрыть ]</button></div>';
  document.body.appendChild(box);
  document.getElementById('polOk').onclick = function () { box.remove(); };
  box.onclick = function (e) { if (e.target === box) box.remove(); };
}
function consentBind(root) {
  $$('.polLink', root).forEach(function (a) { a.onclick = function (e) { e.preventDefault(); policyOpen(); }; });
}
function consentOn(root) { var c = $('.cons', root); return !c || c.checked; }
var CONSENT_ERR = 'Поставьте галочку согласия на обработку номера телефона.';

/* ---------- вход через Телеграм-бота (общий блок) ---------- */
function loginBlock(onDone, opts) {
  opts = opts || {};
  var box = document.createElement('div'); box.className = 'card';
  box.innerHTML = (opts.noBack ? '' : '<button class="back" id="lgBack">⬅️ Назад на главную</button>') + tgNotice() + '<b>' + esc(opts.title || 'Вход по номеру телефона') + '</b><p class="muted small">Нажмите кнопку — откроется наш Телеграм-бот. Поделитесь номером, бот сразу пришлёт 4 цифры. Вернитесь сюда и введите их.</p>' + consentHtml() + '<button class="btn" id="lgGet">✈️ Получить код в Телеграм</button><div id="lgCode" hidden><input class="code" id="lgIn" inputmode="numeric" maxlength="4" placeholder="••••" autocomplete="one-time-code"><button class="btn ok" id="lgOk">Подтвердить код</button><p class="muted small center">Бот открылся без кода? Нажмите в нём «Старт» или кнопку «🔑 Код для входа на сайт» (в течение 3 минут после нажатия здесь).</p></div><div id="lgErr"></div>';
  var req = ''; consentBind(box); var lb = box.querySelector('#lgBack'); if (lb) lb.onclick = function () { go('#/'); route(); };
  function err(t) { box.querySelector('#lgErr').innerHTML = t ? '<div class="err">' + esc(t) + '</div>' : ''; }
  box.querySelector('#lgGet').onclick = function () {
    err(''); if (!consentOn(box)) { err(CONSENT_ERR); return; } api('authStart', { token: '' }).then(function (j) {
      req = j.req; box.querySelector('#lgCode').hidden = false; window.open(j.link, '_blank'); box.querySelector('#lgIn').focus();
      box.querySelector('#lgGet').textContent = '✈️ Открыть бота ещё раз'; box.querySelector('#lgGet').onclick = function () { window.open(j.link, '_blank'); };
    }).catch(function (e) { err(errText(e)); });
  };
  box.querySelector('#lgOk').onclick = function () {
    var c = box.querySelector('#lgIn').value.replace(/\D/g, ''); if (c.length !== 4) { err('Введите 4 цифры.'); return; }
    api('authVerify', Object.assign({ req: req, code: c, token: '' }, opts.recover ? { recover: 1 } : {})).then(function (j) { setToken(j.token); if (j.isOwner) ls('zk_owner', '1'); setRole(!!j.isMaster, !opts.recover); onDone(j); }).catch(function (e) { err(errText(e)); });
  };
  return box;
}

/* ---------- разовые объявления владельца: баннер сверху, ровно 60 секунд, один раз (номер объявления запоминается) ---------- */
var ADS = { t: 0, j: null }, AD_MS = 60000;
function adShow(kind) {
  if (DEMO || !CFG.gatewayUrl || OWN.token) return;
  function use(j) { var x = j && j[kind]; if (!x || !x.id || ls('zk_ad_' + kind) === x.id) return; ls('zk_ad_' + kind, x.id); adBanner(x); }
  if (ADS.j && Date.now() - ADS.t < 20000) return use(ADS.j);
  api('adsGet', { token: '' }).then(function (j) { ADS = { t: Date.now(), j: j }; use(j); }).catch(function () {});
}
function adBanner(x) {
  var old = document.getElementById('adBanner'); if (old) { clearTimeout(old._t); old.remove(); }
  var b = document.createElement('div'); b.id = 'adBanner'; b.setAttribute('role', 'status');
  b.innerHTML = '<span class="adi">📢</span><p>' + esc(x.text) + '</p><button type="button" aria-label="Закрыть объявление">✕</button>';
  document.body.appendChild(b);
  function hide() { clearTimeout(b._t); b.classList.add('out'); setTimeout(function () { b.remove(); }, 300); }
  b._t = setTimeout(hide, AD_MS); b.querySelector('button').onclick = hide;
  var x0 = 0, y0 = 0;
  b.addEventListener('touchstart', function (e) { var t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
  b.addEventListener('touchend', function (e) { var t = e.changedTouches[0]; if (Math.abs(t.clientX - x0) > 50 || t.clientY - y0 < -30) hide(); }, { passive: true });
}
/* ---------- акции мастеров на витрине ---------- */
function promoHtml(a) { return (a || []).map(function (x) { return x.locked ? '<span class="promo lock">🔒 Спецпредложение для постоянных клиентов</span>' : '<span class="promo' + (x.aud === 'loyal' ? ' vip' : '') + '">' + (x.aud === 'loyal' ? '💎 Для постоянных клиентов: ' : '🎁 ') + esc(x.text) + '</span>'; }).join(''); }

/* ---------- главная ---------- */
/* ---------- окно «Что нового?» (текст — в файле novosti.json, пункт = строка списка, свежее сверху) ---------- */
var NOVOSTI_BAD = /(https?:\/\/|github|token|токен|парол|пароль|секрет|\.(?:txt|json|js|gs|py|html|css)\b|\bapi\b|[{}<>`]|\bsheet|лист\s+«)/i;
function loadNovosti() {
  return fetch('novosti.json?v=' + encodeURIComponent(VERSION), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
   .then(function (a) { return (Array.isArray(a) ? a : []).map(function (x) { return String(x || '').trim(); }).filter(function (x) { return x && !NOVOSTI_BAD.test(x); }).slice(0, 30); });
}
function whatsNew(force) {
  if (DEMO) return;
  if (!force && ls('zk_whatsnew_ver') === VERSION) return;
  if (document.getElementById('wnBox')) return;
  loadNovosti().then(function (items) {
    if (!items.length) { if (force) toast('Список новостей пока недоступен'); else ls('zk_whatsnew_ver', VERSION); return; }
    var box = document.createElement('div'); box.id = 'wnBox'; box.className = 'wn-back';
    box.innerHTML = '<div class="wn-card" role="dialog" aria-modal="true"><h2>✨ Что нового</h2><ul>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><button class="btn" id="wnOk">[ Отлично, понятно! ]</button></div>';
    document.body.appendChild(box);
    document.getElementById('wnOk').onclick = function () { ls('zk_whatsnew_ver', VERSION); box.remove(); };
  });
}
/* ---------- Область ➡️ Район ➡️ Село (справочник Картотеки ЗКО, только названия) ---------- */
var GEOIDX = null;
function geoIdx() { if (GEOIDX) return GEOIDX; GEOIDX = {}; ((typeof ZKGEO !== 'undefined' && ZKGEO.r) || []).forEach(function (r) { r.d.forEach(function (d) { d.v.forEach(function (v) { if (!GEOIDX[v]) GEOIDX[v] = { r: r.n, d: d.n }; }); }); }); return GEOIDX; }
function mGeo(m) { var g = m.village && geoIdx()[m.village]; return { r: m.region || (g ? g.r : ''), d: m.district || (g ? g.d : ''), v: m.village || '' }; }
function geoPick(root, st, o) {
  var ms = o.ms ? o.ms.map(mGeo) : null, pk = false, lastKey = '', adding = false;
  function cnt(l, n) { return ms.filter(function (g) { return l === 0 ? g.r === n : (l === 1 ? g.r === st.r && g.d === n : g.r === st.r && g.d === st.d && g.v === n); }).length; }
  function names(l) {
    var R = (typeof ZKGEO !== 'undefined' && ZKGEO.r) || [], a = [];
    if (l === 0) a = R.map(function (r) { return r.n; });
    else R.forEach(function (r) { if (r.n !== st.r) return; r.d.forEach(function (d) { if (l === 1) a.push(d.n); else if (d.n === st.d) a = a.concat(d.v); }); });
    if (ms) ms.forEach(function (g) { var n = l === 0 ? g.r : (l === 1 ? (g.r === st.r ? g.d : '') : (g.r === st.r && g.d === st.d ? g.v : '')); if (n && a.indexOf(n) < 0) a.push(n); });
    return a;
  }
  function draw() {
    var l = !st.r ? 0 : (!st.d ? 1 : 2), key = l + '|' + st.r + '|' + st.d; if (key !== lastKey) { pk = false; adding = false; lastKey = key; }
    var all = names(l), vis = [], hid = [];
    all.forEach(function (n) { var c = ms ? cnt(l, n) : 1; (c > 0 ? vis : hid).push([n, c]); });
    vis.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; }); hid.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    var path = [st.r, st.d, st.v].filter(Boolean), h = '<div class="geo-bar"><span class="muted small">' + (path.length ? '📍 ' + esc(path.join(' › ')) : '📍 ' + (['Выберите область', 'Выберите район', 'Выберите село'][l])) + '</span>' + (path.length ? '<span><button class="btn sec sm" data-g="up">↩ Назад</button><button class="btn sec sm" data-g="clr">✖ Сбросить</button></span>' : '') + '</div>';
    function item(x, i, isHid) { var sel = (l === 2 && st.v === x[0]); return '<button class="geo' + (sel ? ' on' : '') + '" data-n="' + esc(x[0]) + '"><span>' + esc(x[0]) + '</span>' + (ms ? '<span class="cnt">' + x[1] + '</span>' : '') + '</button>'; }
    h += vis.map(item).join('');
    if (ms && !vis.length) h += '<div class="muted small center">Здесь пока нет мастеров.</div>';
    if (ms && hid.length) h += '<button class="btn sec sm geo-pk" data-g="pk">' + (pk ? '[ – Скрыть остальные ]' : '[ + Показать остальные... ]') + '</button>' + (pk ? '<div>' + hid.map(item).join('') + '</div>' : '');
    if (o.add && l === 2) h += (adding ? '<div class="card"><label>Название нового посёлка</label><input id="gNew" maxlength="40" placeholder="например Новый посёлок"><button class="btn ok sm" data-g="addok">Добавить</button></div>' : '<button class="btn sec sm" data-g="add">[ + Добавить новый посёлок... ]</button>');
    if (o.add && l === 2 && st.v && all.indexOf(st.v) < 0) h += '<div class="muted small">Выбрано: с. ' + esc(st.v) + ' (новый)</div>';
    root.innerHTML = h;
    $$('[data-n]', root).forEach(function (b) { b.onclick = function () { var n = b.getAttribute('data-n'); if (l === 0) { st.r = n; st.d = ''; st.v = ''; } else if (l === 1) { st.d = n; st.v = ''; } else st.v = (st.v === n && !o.add) ? '' : n; draw(); o.onChange && o.onChange(st); }; });
    $$('[data-g]', root).forEach(function (b) { b.onclick = function () { var g = b.getAttribute('data-g'); if (g === 'up') { if (st.v) st.v = ''; else if (st.d) st.d = ''; else st.r = ''; } else if (g === 'clr') { st.r = st.d = st.v = ''; } else if (g === 'pk') { pk = !pk; draw(); return; } else if (g === 'add') { adding = true; draw(); return; } else if (g === 'addok') { var nv = ($('#gNew', root).value || '').trim().slice(0, 40); if (nv.length < 2) { toast('Введите название посёлка'); return; } st.v = nv; adding = false; } draw(); o.onChange && o.onChange(st); }; });
  }
  draw();
}
var HS = { r: '', d: '', v: '', category: '' };
function home() {
  navShow(true, 'home');
  view('<h1>Онлайн-запись к мастерам ЗКО</h1><p class="muted">Выберите мастера и время — он получит уведомление в Телеграме.</p>' + tgNotice() + '<div class="btnrow"><button class="btn" id="hMy">📋 Мои записи</button><button class="btn sec" id="hCab">✂️ Кабинет мастера / Регистрация</button></div><div class="card"><h3>Найти мастера</h3><hr class="sep"><div id="hGeo"></div><hr class="sep"><label>Категория</label><select id="hCat">' + catOptions(HS.category, 'Все категории') + '</select></div><div id="hList"><p class="muted center">Загрузка мастеров…</p></div><button class="btn demo" id="hDemo">🎮 Попробовать демо (без регистрации)</button><div class="card"><b>Как записаться?</b><p class="muted small">Выберите мастера в списке выше, откройте ссылку, которую вам прислал мастер, или нажмите «Записаться онлайн» в карточке мастера в «Картотеке ЗКО». Отметьте услуги и время, подтвердите номер кодом из Телеграма — и запись готова.</p></div><button class="btn sec" id="hCart">📖 Вернуться в Картотеку ЗКО</button><p class="muted small center">' + VERSION + '</p>');
  $('#hMy').onclick = function () { go('#/my'); };
  $('#hCab').onclick = function () { go('#/cab'); };
  $('#hDemo').onclick = function () { enterDemo(); };
  $('#hCart').onclick = function () { window.open(cartUrl(), '_blank'); };
  var ALLM = [];
  function drawList() {
    var f = ALLM.filter(function (m) { var g = mGeo(m); return (!HS.r || g.r === HS.r) && (!HS.d || g.d === HS.d) && (!HS.v || g.v === HS.v); });
    $('#hList').innerHTML = f.length ? f.map(function (m) { return '<button class="mcard' + (m.tier !== 'free' ? ' ' + m.tier : '') + '" data-s="' + esc(m.slug) + '"><b>' + esc(m.name) + '</b> ' + tierBadge(m.tier) + '<br><span class="muted small">' + esc([catLabel(m.category), m.village ? 'с. ' + m.village : '', MODEL[m.mode] || '', m.count ? '★ ' + m.rating + ' (' + m.count + ')' : ''].filter(Boolean).join(' · ')) + '</span>' + promoHtml(m.promos) + '</button>'; }).join('') : '<div class="card muted center">Мастеров по этим условиям пока нет.</div>';
    $$('.mcard').forEach(function (b) { b.onclick = function () { masterPage(b.getAttribute('data-s'), '', [], ''); }; });
  }
  function load() {
    api('masters', { category: HS.category, token: TOKEN }).then(function (j) {
      if (!$('#hGeo')) return; ALLM = j.masters;
      geoPick($('#hGeo'), HS, { ms: ALLM, onChange: drawList }); drawList();
    }).catch(function (e) { var l = $('#hList'); if (l) { l.innerHTML = e.message === 'no_gateway' ? '<div class="card muted small center">Список мастеров появится чуть позже — сервис ещё настраивается.</div>' : failHtml(e, 'список мастеров'); bindRetry(l, load); } });
  }
  $('#hCat').onchange = function () { HS.category = this.value; load(); };
  load(); adShow('clients');
}
/* ---------- вкладка «Ещё» ---------- */
function morePage() {
  navShow(true, 'more');
  view('<h1>☰ Ещё</h1><div class="verplate" id="vPlate">Версия приложения: <b class="js-ver">' + esc(verTxt()) + '</b></div>' + (inClientMode() ? '<button class="btn" id="mBackCab">🔐 Вернуться в кабинет мастера</button>' : '') + '<button class="btn help" id="mHelp">📖 Как пользоваться сайтом (инструкция)</button><button class="btn sec" id="mAbout">ℹ️ О сервисе</button><button class="btn sec" id="mNews">✨ Что нового в версии</button><button class="btn sec" id="mShare">📲 Поделиться ссылкой</button><button class="btn sec" id="mPwa">📲 Установка приложения (PWA)</button><button class="btn sec" id="mRef">🔄 Обновить данные</button><a class="btn sec" target="_blank" rel="noopener" href="' + esc(cartUrl()) + '">📖 Перейти в Картотеку ЗКО</a><a class="btn" target="_blank" rel="noopener" href="' + esc(cartUrl()) + '">➕ Добавить себя в Картотеку ЗКО</a><div class="card" id="mStat"><b>📊 Статистика платформы</b><p class="muted center">Загрузка…</p></div><div class="card" id="mProj"><b>🌐 Другие проекты ГИНЦ ЗКО</b>' + projectsHtml() + '</div>');
  $('#mHelp').onclick = function () { helpOpen('cl'); }; ownerHoldBind($('#vPlate')); if ($('#mBackCab')) $('#mBackCab').onclick = pinReturn;
  $('#mAbout').onclick = function () { modal('ℹ️ О сервисе', '<p>«ЗКО Онлайн-записи» — бесплатный сервис записи к мастерам Западно-Казахстанской области. Клиент выбирает услугу и время, мастер сразу получает уведомление в Телеграме.</p><p>Мастера из «Картотеки ЗКО» могут подключить кнопку «Записаться онлайн» прямо в своей карточке.</p><p class="muted small">Версия ' + esc(VERSION) + '</p>'); };
  $('#mNews').onclick = function () { whatsNew(true); };
  $('#mShare').onclick = function () { var u = siteBase(); if (navigator.share) navigator.share({ title: 'ЗКО Онлайн-записи', text: 'Онлайн-запись к мастерам ЗКО', url: u }).catch(function () {}); else copyText(u, 'Ссылка скопирована'); };
  $('#mPwa').onclick = function () {
    if (DEFERRED) { DEFERRED.prompt(); DEFERRED.userChoice.then(function (r) { if (r && r.outcome === 'accepted') ping('pwa'); DEFERRED = null; }); return; }
    modal('📲 Установка приложения', '<p><b>Android (Chrome):</b> меню ⋮ → «Установить приложение» или «Добавить на главный экран».</p><p><b>iPhone (Safari):</b> кнопка «Поделиться» → «На экран Домой».</p><p class="muted small">Если приложение уже установлено, эта подсказка не нужна.</p>');
  };
  $('#mRef').onclick = function () {
    if (DEMO) { toast('В демо обновлять нечего'); return; }
    toast('Обновляю…'); var jobs = [];
    if (window.caches) jobs.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }));
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) jobs.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.update().catch(function () {}); })); }));
    Promise.all(jobs).catch(function () {}).then(function () { location.reload(); });
  };
  api('statsPublic', { token: '' }).then(function (j) {
    var el = $('#mStat'); if (!el) return;
    el.innerHTML = '<b>📊 Статистика платформы</b><div class="row"><span>Уникальных устройств</span><b>' + j.devices + '</b></div><div class="row"><span>Установок на экран</span><b>' + j.installs + '</b></div><div class="row"><span>Просмотров сегодня</span><b>' + j.today + '</b></div><div class="row"><span>Просмотров за месяц</span><b>' + j.month + '</b></div><div class="row"><span>Просмотров всего</span><b>' + j.total + '</b></div><p class="muted small center">Данные анонимны: без IP и номеров. Визиты Владельца не учитываются.</p>';
  }).catch(function () { var el = $('#mStat'); if (el) el.innerHTML = '<b>📊 Статистика платформы</b><p class="muted small center">Появится после подключения сервиса.</p>'; });
}

/* ---------- ДЕМО-песочница: всё в памяти страницы, в Google Таблицу и Телеграм ничего не уходит ---------- */
function enterDemo(then) {
  var go1 = function () { DEMO = true; TOKEN = ''; window.ZKDemo.start(); showBar(); (then || demoHome)(); };
  if (window.ZKDemo) return go1();
  var sc = document.createElement('script'); sc.src = 'demo.js?v=' + encodeURIComponent(VERSION); sc.onload = go1; sc.onerror = function () { toast('Не удалось загрузить демо. Проверьте интернет.'); }; document.head.appendChild(sc);
}
function showBar() {
  var et = document.getElementById('envtag'); if (et) et.hidden = false;
  var b = document.getElementById('demoBar');
  if (!b) { b = document.createElement('div'); b.id = 'demoBar'; document.body.insertBefore(b, document.body.firstChild); document.body.classList.add('demo-on'); }
  b.innerHTML = '<b>🎮 ДЕМО-РЕЖИМ — данные не сохраняются</b><span><button id="dbRole">Сменить роль</button><button id="dbOut">Выйти из демо</button></span>';
  document.getElementById('dbRole').onclick = function () { TOKEN = ''; go('#/'); demoHome(); };
  var lg = document.getElementById('logo'); if (lg && !lg.getAttribute('data-d')) { lg.setAttribute('data-d', '1'); lg.addEventListener('click', function (e) { if (DEMO) { e.preventDefault(); TOKEN = ''; go('#/'); demoHome(); } }); }
  document.getElementById('dbOut').onclick = function () { location.href = location.pathname; };
}
function demoHome() {
  TOKEN = ''; stopTimer(); navShow(true, 'home');
  view('<h1>🎮 Демо-песочница</h1><p class="muted">Попробуйте сервис по-настоящему — без регистрации и кодов. Ничего не сохраняется: когда закроете вкладку или нажмёте «Выйти из демо», всё исчезнет.</p><div class="card"><b>Войти как тестовый Мастер</b><p class="muted small">Парикмахер-универсал Айгуль, с. Дарьинское. Добавляйте услуги, меняйте график, ставьте выходные, смотрите записи.</p><button class="btn ok" id="dM">💈 Я мастер</button></div><div class="card"><b>Войти как тестовый Клиент</b><p class="muted small">Запись к Айгуль: выберите услуги и время, отмените запись, поставьте оценку за прошлый визит.</p><button class="btn" id="dC">🙋 Я клиент</button></div><p class="muted small center">Если мастер и клиент пользуются одной демо-базой, запись клиента сразу видна в кабинете мастера — переключайтесь кнопкой «Сменить роль».</p>');
  $('#dM').onclick = function () { TOKEN = window.ZKDemo.token('master'); CAB = null; go('#/cab'); cabEntry(); };
  $('#dC').onclick = function () { TOKEN = window.ZKDemo.token('client'); go('#/'); masterPage(window.ZKDemo.slug, '', [], ''); };
}

/* ---------- страница мастера для клиента ---------- */
var P = null;
var EM = ['✂️', '💅', '💇', '🧖', '💆', '🎨', '👁️', '🧴', '💈', '🌿'];
function masterPage(slug, tel, pre, card) {
  navShow(false);
  P = { slug: slug || '', pre: pre || [], sel: {}, cat: null, date: zkoToday(), key: ls('zk_hold') || (function () { var k = rndKey(); ls('zk_hold', k); return k; })(), slot: null, exp: 0 };
  view('<p class="muted center">Загрузка…</p>');
  api('master', Object.assign({ token: TOKEN }, slug ? { slug: slug } : {}, card ? { card: card } : {}, tel ? { tel: tel } : {})).then(function (j) { P.d = j; P.slug = j.master.slug; P.pre.forEach(function (id) { if (j.services.some(function (x) { return String(x.id) === id; })) P.sel[id] = 1; }); renderMaster(); }).catch(function (e) { view(failHtml(e, 'страницу специалиста') + '<button class="btn sec" onclick="location.hash=\'#/\'">На главную</button>'); bindRetry(APP, function () { masterPage(slug, tel, pre, card); }); });
}
function cats() { var m = {}, o = []; P.d.services.forEach(function (s) { if (!m[s.category]) { m[s.category] = []; o.push(s.category); } m[s.category].push(s); }); return { map: m, order: o }; }
function sumSel() { var n = 0, t = 0, m = 0; P.d.services.forEach(function (s) { if (P.sel[s.id]) { n++; t += s.price; m += s.minutes; } }); return { n: n, t: t, m: m }; }
function renderMaster() {
  var d = P.d, c = cats(), r = d.rating, s = sumSel();
  var h = '<div class="card"><h1>' + esc(d.master.name) + ' ' + tierBadge(d.master.tier) + '</h1>' + masterMeta(d.master) + (r.count ? '<div>' + stars(r.avg) + ' <b>' + r.avg + '</b> <span class="muted">· оценок: ' + r.count + '</span></div>' : '<div class="muted small">Оценок пока нет</div>') + (d.master.about ? '<p class="muted">' + esc(d.master.about) + '</p>' : '') + promoHtml(d.master.promos) + '<button class="btn sec sm" id="mRev">⭐ Отзывы</button><button class="btn sec sm" id="mShr">📤 Поделиться</button>' + helpBtn('cl', '📖 Как записаться — подсказка') + '</div>' + galleryHtml(d.master.photos || [], d.master.instagram || '') + (d.master.card ? '<div class="card"><a class="btn sec" target="_blank" rel="noopener" href="' + esc(cartUrl() + (cartUrl().indexOf('?') < 0 ? '?' : '&') + 'card=' + encodeURIComponent(d.master.card)) + '">📖 Карточка в Картотеке ЗКО</a></div>' : '');
  if (!d.services.length) h += '<div class="card muted">У мастера пока нет услуг.</div>';
  else if (P.cat === null && c.order.length > 1) {
    h += '<h2>Выберите раздел</h2><div class="tiles">' + c.order.map(function (k, i) { var cnt = c.map[k].filter(function (x) { return P.sel[x.id]; }).length; return '<button class="tile' + (cnt ? ' on' : '') + '" data-c="' + esc(k) + '"><span class="em">' + EM[i % EM.length] + '</span>' + esc(k) + '<span class="n">' + c.map[k].length + ' усл.' + (cnt ? ' · выбрано ' + cnt : '') + '</span></button>'; }).join('') + '</div>';
  } else {
    var key = P.cat === null ? c.order[0] : P.cat;
    h += (c.order.length > 1 ? '<button class="back" id="mBack">⬅️ Назад к разделам</button>' : '') + '<h2>' + esc(key) + '</h2>' + c.map[key].map(function (x) { return '<button class="svc' + (P.sel[x.id] ? ' on' : '') + '" data-s="' + esc(x.id) + '"><span class="chk">' + (P.sel[x.id] ? '✓' : '') + '</span><span class="t">' + esc(x.title) + '<br><span class="m">' + dur(x.minutes) + '</span></span><span class="p">' + money(x.price) + '</span></button>'; }).join('');
  }
  h += '<div class="bar"><div class="in">' + (s.n ? '<div class="row"><b>Выбрано: ' + s.n + '</b><span style="text-align:right"><b>' + money(s.t) + '</b> · ' + dur(s.m) + '</span></div>' : '<div class="muted center small">Отметьте одну или несколько услуг</div>') + '<button class="btn" id="mNext"' + (s.n ? '' : ' disabled') + '>🕒 Выбрать время</button></div></div>';
  view(h); galleryBind();
  $$('.tile').forEach(function (b) { b.onclick = function () { P.cat = b.getAttribute('data-c'); renderMaster(); }; });
  $$('.svc').forEach(function (b) { b.onclick = function () { var id = b.getAttribute('data-s'); if (P.sel[id]) delete P.sel[id]; else P.sel[id] = 1; var y = window.scrollY; renderMaster(); window.scrollTo(0, y); }; });
  var bk = $('#mBack'); if (bk) bk.onclick = function () { P.cat = null; renderMaster(); };
  $('#mNext').onclick = function () { P.date = zkoToday(); timePage(); };
  $('#mRev').onclick = reviewsPage;
  $('#mShr').onclick = function () { shareProfile(P.slug, d.master.name, false); };
}
function reviewsPage() {
  view('<button class="back" id="bk">⬅️ Назад</button><h2>Отзывы</h2><p class="muted center">Загрузка…</p>');
  $('#bk').onclick = renderMaster;
  api('reviews', { slug: P.slug, token: '' }).then(function (j) {
    view('<button class="back" id="bk">⬅️ Назад</button><h2>Отзывы · ' + (j.rating.count ? j.rating.avg + ' из 5' : 'пока нет') + '</h2>' + (j.reviews.length ? j.reviews.map(function (r) { return '<div class="card">' + stars(r.stars) + ' <b>' + esc(r.name) + '</b> <span class="muted small">' + esc(r.date) + '</span><p>' + esc(r.comment || '') + '</p></div>'; }).join('') : '<p class="muted">Отзывы появляются только после состоявшихся визитов.</p>'));
    $('#bk').onclick = renderMaster;
  }).catch(function (e) { view('<button class="back" id="bk">⬅️ Назад</button><h2>Отзывы</h2>' + failHtml(e, 'отзывы')); $('#bk').onclick = renderMaster; bindRetry(APP, reviewsPage); });
}
function selIds() { return Object.keys(P.sel); }
function timePage() {
  var t = zkoToday(), tm = addDay(t, 1), s = sumSel();
  var h = '<button class="back" id="bk">⬅️ Назад к услугам</button>' + helpBtn('cl', '📖 Подсказка: как выбрать время') + '<div class="card"><b>' + esc(P.d.master.name) + '</b><div class="muted small">' + s.n + ' усл. · ' + dur(s.m) + ' · ' + money(s.t) + '</div></div><h2>Дата</h2><div class="chips"><button class="chip' + (P.date === t ? ' on' : '') + '" data-d="' + t + '">Сегодня</button><button class="chip' + (P.date === tm ? ' on' : '') + '" data-d="' + tm + '">Завтра</button><button class="chip' + (P.date !== t && P.date !== tm ? ' on' : '') + '" id="dOther">📅 ' + (P.date !== t && P.date !== tm ? ruDate(P.date) : 'Другая дата') + '</button></div><input type="date" id="dPick" min="' + t + '" max="' + addDay(t, 30) + '" hidden><h2>' + ruDate(P.date) + '</h2><div id="sl"><p class="muted center">Загрузка…</p></div>';
  view(h);
  $('#bk').onclick = function () { api('unhold', { key: P.key, token: '' }).catch(function () {}); renderMaster(); };
  $$('.chip[data-d]').forEach(function (b) { b.onclick = function () { P.date = b.getAttribute('data-d'); timePage(); }; });
  $('#dOther').onclick = function () { var i = $('#dPick'); i.hidden = false; try { i.showPicker(); } catch (e) { i.focus(); } };
  $('#dPick').onchange = function () { if (this.value) { P.date = this.value; timePage(); } };
  api('slots', { slug: P.slug, date: P.date, minutes: s.m, key: P.key, token: '' }).then(function (j) {
    var el = $('#sl'); if (!el) return;
    el.innerHTML = j.slots.length ? '<div class="slots">' + j.slots.map(function (x) { return '<button class="slot" data-t="' + x + '">' + x + '</button>'; }).join('') + '</div>' : '<div class="card muted center">На этот день свободного времени нет. Выберите другую дату.</div>';
    $$('.slot').forEach(function (b) { b.onclick = function () { holdSlot(b.getAttribute('data-t')); }; });
  }).catch(function (e) { var sl = $('#sl'); if (!sl) return; sl.innerHTML = failHtml(e, 'свободное время'); bindRetry(sl, timePage); });
}
function holdSlot(start) {
  api('hold', { slug: P.slug, date: P.date, start: start, serviceIds: selIds(), key: P.key, token: '' }).then(function (j) {
    P.slot = start; P.exp = Date.now() + j.seconds * 1000; confirmPage();
  }).catch(function (e) { toast(errText(e)); timePage(); });
}
function confirmPage() {
  var s = sumSel(), names = P.d.services.filter(function (x) { return P.sel[x.id]; }).map(function (x) { return x.title; }).join(', ');
  view('<button class="back" id="bk">⬅️ Другое время</button><div class="timer" id="tm"></div><div class="card"><b>' + esc(P.d.master.name) + '</b><br>📅 ' + ruDate(P.date) + ' в <b>' + P.slot + '</b><br>💈 ' + esc(names) + '<br>💰 ' + money(s.t) + ' · ' + dur(s.m) + '</div><label>Ваше имя</label><input id="cName" maxlength="50" placeholder="Как к вам обращаться" value="' + esc(ls('zk_name') || '') + '"><div id="cAuth"></div><div id="cErr"></div>');
  var mdl = P.d.master.mode, ph = '';
  if (mdl === 'visit') ph = '<p class="muted small">🚗 Мастер выезжает на дом.</p><label>Ваш адрес</label><input id="cAddr" maxlength="120" placeholder="Село, улица, дом">';
  else if (mdl === 'both') ph = '<label>Где принять?</label><select id="cPl"><option value="s">У мастера' + (P.d.master.address ? ' (' + esc(P.d.master.address) + ')' : '') + '</option><option value="c">Выезд ко мне</option></select><div id="cAW" hidden><label>Ваш адрес</label><input id="cAddr" maxlength="120" placeholder="Село, улица, дом"></div>';
  else if (P.d.master.address) ph = '<p class="muted small">📍 Адрес мастера: ' + esc(P.d.master.address) + '</p>';
  $('#cAuth').insertAdjacentHTML('beforebegin', ph);
  if ($('#cPl')) $('#cPl').onchange = function () { $('#cAW').hidden = this.value !== 'c'; };
  $('#bk').onclick = function () { api('unhold', { key: P.key, token: '' }).catch(function () {}); timePage(); };
  function tick() {
    var left = Math.max(0, Math.round((P.exp - Date.now()) / 1000)), el = $('#tm'); if (!el) return;
    el.textContent = '🔒 Время удержано для вас: ' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2); el.className = 'timer' + (left < 60 ? ' low' : '');
    if (left <= 0) { stopTimer(); toast('Время удержания вышло. Выберите слот заново.'); timePage(); }
  }
  tick(); TIMER = setInterval(tick, 1000);
  function doBook() {
    var nm = ($('#cName').value || '').trim(); if (nm.length < 2) { $('#cErr').innerHTML = '<div class="err">Введите имя.</div>'; return; } ls('zk_name', nm);
    api('book', { slug: P.slug, date: P.date, start: P.slot, serviceIds: selIds(), name: nm, holdKey: P.key, place: mdl === 'visit' ? 'c' : ($('#cPl') ? $('#cPl').value : 's'), addr: $('#cAddr') ? $('#cAddr').value : '' }).then(function (j) { done(j.booking); })
      .catch(function (e) { $('#cErr').innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; if (e.message === 'slot_taken') setTimeout(timePage, 1500); });
  }
  var a = $('#cAuth');
  if (TOKEN) { a.innerHTML = consentHtml() + '<button class="btn ok" id="cBook">✅ Записаться</button>'; consentBind(a); $('#cBook').onclick = function () { if (!consentOn(a)) { $('#cErr').innerHTML = '<div class="err">' + CONSENT_ERR + '</div>'; return; } doBook(); }; }
  else { a.appendChild(loginBlock(function () { doBook(); }, { title: 'Подтвердите номер телефона', noBack: true })); }
}
function done(b) {
  view('<div class="card center"><div style="font-size:48px">✅</div><h1>Вы записаны!</h1><p>' + esc(b.master) + '<br>📅 ' + ruDate(b.date) + ' в <b>' + esc(b.start) + '</b><br>' + '<br>' + esc(b.services) + '<br>' + money(b.total) + (b.place === 'c' ? '<br>🚗 Мастер приедет: ' + esc(b.addr) : (b.masterAddress ? '<br>📍 ' + esc(b.masterAddress) : '')) + '</p><p class="muted small">Подтверждение придёт в Телеграм' + (P && P.d && P.d.master.tier !== 'free' ? ', а за 2 часа до визита — напоминание.' : '.') + '</p></div><button class="btn" id="dMy">📋 Мои записи</button><button class="btn sec" id="dHome">На главную</button>');
  $('#dMy').onclick = function () { go('#/my'); }; $('#dHome').onclick = function () { go('#/'); };
}

/* ---------- мои записи ---------- */
function banHtml(j) {
  if (j.ban) return '<div class="err"><b>🚫 Запись закрыта' + (j.ban.until ? ' до ' + dmy(j.ban.until) : '') + '</b><br>Причина: ' + esc(j.ban.reason) + '.' + (j.ban.until ? '<br>Доступ вернётся автоматически в этот день.' : '') + '</div>';
  if (j.noshows > 0) return '<div class="notice">⚠️ Неявок: <b>' + j.noshows + ' из 3</b>. После третьей неявки запись закрывается на 14 дней. Если не можете прийти — отмените запись заранее.</div>';
  return '';
}
function myPage() {
  navShow(true, 'my');
  if (DEMO && !TOKEN) return demoHome();
  var top = '<h1>Мои записи</h1>' + helpBtn('cl', '📖 Как записаться — инструкция для клиента') + (inClientMode() ? '<button class="btn" id="myBackCab">🔐 Вернуться в кабинет мастера</button>' : '');
  if (!(isMasterRole() && !inClientMode())) adShow('clients');
  if (!TOKEN) { view(top); APP.appendChild(loginBlock(myPage)); return; }
  view(top + '<p class="muted center">Загрузка…</p>'); if ($('#myBackCab')) $('#myBackCab').onclick = pinReturn;
  api('myBookings').then(function (j) {
    var stl = { booked: ['Запись активна', 'ok'], done: ['Визит состоялся', ''], noshow: ['Не пришёл', 'red'], cancelled: ['Отменена', 'red'] };
    view(top + banHtml(j) + (j.bookings.length ? j.bookings.map(function (b) { var st = stl[b.status] || [b.status, '']; return '<div class="card"><b>' + esc(b.master) + '</b> <span class="badge ' + st[1] + '">' + st[0] + '</span><br>📅 ' + ruDate(b.date) + ' в ' + esc(b.start) + '<br>💈 ' + esc(b.services) + ' · ' + money(b.total) + (b.place === 'c' ? '<br>🚗 Выезд: ' + esc(b.addr) : (b.masterAddress ? '<br>📍 ' + esc(b.masterAddress) : '')) + '<div>' + (b.status === 'booked' ? '<button class="btn sec sm" data-c="' + b.id + '">❌ Отменить</button>' : '') + (b.canRate ? '<button class="btn sm" data-r="' + b.id + '">⭐ Оценить</button>' : '') + (b.slug ? '<button class="btn sec sm" data-a="' + esc(b.slug) + '">🔄 Записаться снова</button>' : '') + '</div></div>'; }).join('') : '<div class="card muted">Записей пока нет.</div>') + (j.promoHints || []).map(function (x) { return '<div class="card"><b>💎 Спецпредложение для постоянных клиентов</b><br>' + esc(x.master) + (x.open ? x.texts.map(function (t) { return '<span class="promo vip">' + esc(t) + '</span>'; }).join('') : '<br><span class="muted small">🔒 Откроется после первого состоявшегося визита к этому мастеру.</span>') + '</div>'; }).join('') + '<button class="btn sec" id="myOut">Выйти</button>');
    if ($('#myBackCab')) $('#myBackCab').onclick = pinReturn;
    $$('[data-c]').forEach(function (b) { b.onclick = function () { if (confirm('Отменить запись?')) api('cancelBooking', { id: b.getAttribute('data-c') }).then(function () { toast('Запись отменена'); myPage(); }).catch(function (e) { toast(errText(e)); }); }; });
    $$('[data-r]').forEach(function (b) { b.onclick = function () { ratePage(b.getAttribute('data-r')); }; });
    $$('[data-a]').forEach(function (b) { b.onclick = function () { masterPage(b.getAttribute('data-a'), '', [], ''); }; });
    $('#myOut').onclick = function () { if (DEMO) { TOKEN = ''; go('#/'); demoHome(); return; } api('logout').catch(function () {}); setToken(''); go('#/'); route(); };
  }).catch(function (e) { if (e.message === 'auth_required') myPage(); else { view(top + failHtml(e, 'ваши записи')); bindRetry(APP, myPage); } });
}
function ratePage(id) {
  var st = 0;
  view('<button class="back" id="bk">⬅️ Назад</button><h1>Оцените визит</h1><div class="card center"><div id="rs" style="font-size:40px"></div></div><label>Комментарий (по желанию)</label><textarea id="rc" rows="3" maxlength="300"></textarea><p class="muted small">Одна оценка на одного мастера. Новая оценка заменяет прежнюю.</p><button class="btn ok" id="rOk">Отправить</button><div id="rE"></div>');
  function draw() { $('#rs').innerHTML = [1, 2, 3, 4, 5].map(function (i) { return '<span data-i="' + i + '" class="stars" style="cursor:pointer">' + (i <= st ? '★' : '☆') + '</span>'; }).join(''); $$('#rs span').forEach(function (s) { s.onclick = function () { st = +s.getAttribute('data-i'); draw(); }; }); }
  draw(); $('#bk').onclick = myPage;
  $('#rOk').onclick = function () { api('rate', { bookingId: id, stars: st, comment: $('#rc').value }).then(function () { toast('Спасибо за оценку!'); myPage(); }).catch(function (e) { $('#rE').innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; }); };
}

/* ---------- мастер: вход / регистрация / ПИН ---------- */
function cabEntry() {
  navShow(true, 'cab'); adShow('masters');
  if (DEMO && !TOKEN) return demoHome();
  if (!TOKEN) { view('<h1>Кабинет мастера</h1><p class="muted">Вход по номеру телефона. Новый мастер регистрируется после подтверждения номера.</p>' + helpBtn('ms', '📖 Как вести запись — инструкция для мастера')); APP.appendChild(loginBlock(function () { cabEntry(); })); return; }
  api('me').then(function (j) {
    if (!j.isMaster) { setRole(false); return regPage(); }
    if (j.needPin) return pinPage();
    setRole(true, false); CAB = j; if (j.owner) ls('zk_owner', '1'); ping('master'); cab(ls('zk_tab') || 'rec');
  }).catch(function (e) { if (e.message === 'auth_required') cabEntry(); else { view('<h1>Кабинет мастера</h1>' + failHtml(e, 'кабинет')); bindRetry(APP, cabEntry); } });
}
function regPage() {
  view('<h1>Регистрация мастера</h1>' + helpBtn('ms', '📖 Подсказка для мастера') + tgNotice() + '<div class="card"><label>Ваше имя или название</label><input id="rn" maxlength="60" placeholder="Анара · Красота"><label>Категория (по ней создаётся адрес вашей страницы)</label><select id="rc">' + catOptions('', '— выберите —') + '</select><label>Где вы принимаете: область ➡️ район ➡️ село</label><div id="rGeo"></div><label>Формат приёма</label><select id="rm"><option value="home">Приём у себя (с адресом)</option><option value="visit">Выезд на дом</option><option value="both">Оба варианта</option></select><label>Ваш адрес (для приёма у себя)</label><input id="rd" maxlength="100" placeholder="ул. Центральная, 1"><label>О себе (по желанию)</label><textarea id="ra" rows="3" maxlength="400"></textarea><label>Придумайте ПИН-код (4 цифры)</label><input id="rp" inputmode="numeric" maxlength="4" type="password" placeholder="••••"><p class="muted small">ПИН защищает кабинет на новом устройстве. Запомните его: восстановить может только администратор.</p>' + consentHtml() + '<button class="btn ok" id="rOk">Создать кабинет</button><div id="rE"></div></div>');
  consentBind(APP);
  var RG = { r: '', d: '', v: '' }; geoPick($('#rGeo'), RG, { add: true });
  $('#rOk').onclick = function () { if (!$('#rc').value) { $('#rE').innerHTML = '<div class="err">Выберите категорию — по ней мастеру выдаётся адрес страницы.</div>'; return; } if (!consentOn(APP)) { $('#rE').innerHTML = '<div class="err">' + CONSENT_ERR + '</div>'; return; } api('masterRegister', { name: $('#rn').value, about: $('#ra').value, pin: $('#rp').value, category: $('#rc').value, region: RG.r, district: RG.d, village: RG.v, mode: $('#rm').value, address: $('#rd').value }).then(function () { toast('Кабинет создан!'); cabEntry(); }).catch(function (e) { $('#rE').innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; }); };
}
function pinPage() {
  var v = '';
  view('<h1>Введите ПИН-код</h1><div class="dots" id="dt"></div><div class="pin">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(function (k) { return '<button data-k="' + k + '">' + k + '</button>'; }).join('') + '</div><div id="pE"></div><button class="btn sec" id="pOut">Выйти</button><p class="center small"><a href="#" id="pForgot">Забыли ПИН-код? Войти через одноразовый код из Telegram</a></p>');
  $('#pForgot').onclick = function (e) { e.preventDefault(); recoverPin(); };
  function draw() { $('#dt').textContent = '●'.repeat(v.length) + '○'.repeat(4 - v.length); }
  draw();
  function submit() { api('pinLogin', { pin: v }).then(function () { cabEntry(); }).catch(function (e) { v = ''; draw(); $('#pE').innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; }); }
  $$('.pin button').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-k'); if (k === '⌫') v = v.slice(0, -1); else if (k === '✓') { if (v.length === 4) submit(); } else if (v.length < 4) { v += k; if (v.length === 4) { draw(); submit(); return; } } draw(); }; });
  $('#pOut').onclick = function () { api('logout').catch(function () {}); setToken(''); cabEntry(); };
}

/* ---------- кабинет мастера ---------- */
var CAB = null;
var TABS = [['rec', '📋 Записи'], ['svc', '💈 Услуги'], ['wk', '🕒 График'], ['cl', '🚫 Клиенты'], ['rv', '⭐ Отзывы'], ['promo', '🎁 Мои акции'], ['ph', '📸 Фото работ'], ['bal', '💎 Тарифы']];
function cab(tab) {
  navShow(true, 'cab');
  ls('zk_tab', tab);
  var m = CAB.master, link = siteBase() + '?m=' + m.slug; if (DEMO) link = 'В демо ссылка не создаётся';
  view('<div class="card"><b>' + esc(m.name) + '</b> ' + subBadge(CAB.sub) + '<div class="muted small">Ваша ссылка для клиентов:</div><input readonly id="lnk" value="' + esc(link) + '" onclick="this.select()"><button class="btn sm" id="cShare">📤 Поделиться моим профилем</button><button class="btn sec sm" id="cp">📋 Копировать ссылку</button><button class="btn sec sm" data-help="ms">📖 Инструкция для мастера</button><button class="btn sec sm" id="cNews">✨ Что нового в версии</button><button class="btn sec sm" id="cRef">🔄 Обновить статус и баланс</button><button class="btn sec sm" id="cClient">👤 Записаться как клиент</button><button class="btn sec sm" id="cOut">Выйти</button></div><div class="tabs">' + TABS.map(function (t) { return '<button class="tab' + (t[0] === tab ? ' on' : '') + '" data-t="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '<button class="tab' + (tab === 'pf' ? ' on' : '') + '" data-t="pf">⚙️ Профиль</button></div><div id="tb"></div>');
  $$('.tab').forEach(function (b) { b.onclick = function () { cab(b.getAttribute('data-t')); }; });
  $('#cp').onclick = function () { if (DEMO) { toast('В демо ссылка не создаётся'); return; } copyText(link, 'Ссылка скопирована'); };
  $('#cShare').onclick = function () { if (DEMO) { toast('В демо «Поделиться» не работает — в настоящем кабинете откроется меню телефона'); return; } shareProfile(m.slug, m.name, true); };
  $('#cNews').onclick = function () { whatsNew(true); };
  $('#cClient').onclick = clientModeAsk;
  $('#cRef').onclick = function () { refreshCab(tab); toast('Статус и баланс обновлены'); };
  $('#cOut').onclick = function () { if (DEMO) { TOKEN = ''; go('#/'); demoHome(); return; } api('logout').catch(function () {}); setToken(''); go('#/'); route(); };
  ({ rec: tRec, svc: tSvc, wk: tWk, cl: tCl, rv: tRv, bal: tBal, pf: tPf, ph: tPh, promo: tPromo })[tab]($('#tb'));
}
function refreshCab(tab) { api('me').then(function (j) { CAB = j; cab(tab); }).catch(function (e) { toast(errText(e)); if (e.message === 'pin_required' || e.message === 'auth_required') cabEntry(); }); }
function tRec(el) {
  var from = zkoToday(), to = addDay(from, 14);
  el.innerHTML = '<p class="muted center">Загрузка…</p>';
  api('masterBookings', { from: from, to: to }).then(function (j) {
    var stl = { booked: ['Ожидается', ''], done: ['Состоялся', 'ok'], noshow: ['Не пришёл', 'red'], cancelled: ['Отменена', 'red'] };
    el.innerHTML = '<h2>Записи на 14 дней</h2>' + (j.bookings.length ? j.bookings.map(function (b) { var st = stl[b.status] || [b.status, '']; return '<div class="card"><b>' + ruDate(b.date) + ' · ' + esc(b.start) + '</b> <span class="badge ' + st[1] + '">' + st[0] + '</span><br>👤 ' + esc(b.name) + ' · +' + esc(b.client) + (b.place === 'c' ? '<br>🚗 Выезд: ' + esc(b.addr) : '') + '<br>💈 ' + esc(b.services) + ' · ' + money(b.total) + '<div>' + (b.status === 'booked' ? '<button class="btn ok sm" data-s="done" data-i="' + b.id + '">✔ Визит завершён</button><button class="btn sec sm" data-s="noshow" data-i="' + b.id + '">❌ Клиент не пришёл</button><button class="btn red sm" data-s="cancelled" data-i="' + b.id + '">❌ Отменить</button>' : '') + (b.status === 'noshow' || b.status === 'done' ? '<button class="btn sec sm" data-bl="' + b.id + '">🚫 В чёрный список</button>' : '') + '</div></div>'; }).join('') : '<div class="card muted">Записей пока нет.</div>');
    $$('[data-s]', el).forEach(function (b) { b.onclick = function () { var s = b.getAttribute('data-s'); if (s === 'cancelled' && !confirm('Отменить запись? Клиент получит уведомление.')) return; if (s === 'noshow' && !confirm('Отметить: клиент не пришёл? 100 ₸ с баланса не спишутся. После 3 неявок клиент получит бан на 14 дней.')) return; api('bookingMark', { id: b.getAttribute('data-i'), status: s }).then(function () { toast('Готово'); tRec(el); }).catch(function (e) { toast(errText(e)); }); }; });
    $$('[data-bl]', el).forEach(function (b) { b.onclick = function () { if (confirm('Добавить клиента в ваш чёрный список?')) api('blAdd', { bookingId: b.getAttribute('data-bl') }).then(function () { toast('Клиент в чёрном списке'); }).catch(function (e) { toast(errText(e)); }); }; });
  }).catch(function (e) { el.innerHTML = failHtml(e, 'записи'); bindRetry(el, function () { tRec(el); }); });
}
function visitFee(v) { var n = Math.round(+String(v).replace(/\s/g, '')) || 0; return n >= 1 && n < 1000 ? 50 : (n >= 1000 && n <= 10000 ? 100 : 200); }
var SEC = { beauty: ['Стрижки', 'Окрашивание', 'Укладки', 'Маникюр и педикюр', 'Брови и ресницы'], massage: ['Массаж', 'Баня', 'Сауна'], auto: ['Диагностика', 'Шиномонтаж', 'Ремонт', 'Техобслуживание'], health: ['Приём и консультация', 'Лечение', 'Гигиена и профилактика'], septic: ['Откачка', 'Вывоз', 'Аренда техники'], home: ['Сантехника', 'Электрика', 'Отделка', 'Мелкий ремонт'], photo: ['Фотосъёмка', 'Видеосъёмка', 'Праздники'], edu: ['Школьная программа', 'Иностранные языки', 'Подготовка к экзаменам'], other: ['Разное'] };
function secSelect(cur, used) {
  var list = ['Общий прайс'].concat(SEC[(CAB.master && CAB.master.category) || ''] || []);
  (used || []).forEach(function (c) { if (c && list.indexOf(c) < 0) list.push(c); });
  var c0 = cur || 'Общий прайс', inList = list.indexOf(c0) >= 0, o = list.map(function (c) { return '<option' + ((inList && c === c0) ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
  if (!inList) list.push(c0), o += '<option selected>' + esc(c0) + '</option>';
  return '<select id="fc">' + o + '<option value="__c">✏️ Свой вариант…</option></select>';
}
function tSvc(el) {
  var act = CAB.services.filter(function (s) { return s.status !== 'off'; });
  el.innerHTML = '<h2>Мой прайс-лист</h2><div class="muted small">' + (CAB.sub.tariff ? 'VIP: услуг без ограничений (сейчас ' + CAB.services.length + ')' : 'Бесплатный тариф: ' + CAB.services.length + ' из ' + CAB.freeLimit + ' услуг') + '</div>' + CAB.services.map(function (s) { return '<div class="card"><b>' + esc(s.title) + '</b><br><span class="muted">' + esc(s.category) + ' · ' + dur(s.minutes) + '</span> · <b>' + money(s.price) + '</b><div><button class="btn sec sm" data-e="' + s.id + '">✏️ Изменить</button><button class="btn red sm" data-d="' + s.id + '">🗑</button></div></div>'; }).join('') + '<button class="btn" id="sAdd">➕ Добавить услугу</button><div id="sf"></div>';
  function form(s) {
    s = s || { title: '', category: '', price: '', minutes: 60 };
    var opts = ''; for (var m = 30; m <= 480; m += 30) opts += '<option value="' + m + '"' + (+s.minutes === m ? ' selected' : '') + '>' + dur(m) + '</option>';
    var cl = Array.from(new Set(CAB.services.map(function (x) { return x.category; })));
    $('#sf', el).innerHTML = '<div class="card"><h2>' + (s.id ? 'Изменить услугу' : 'Новая услуга') + '</h2><label>Раздел (категория)</label>' + secSelect(s.category, cl) + '<input id="fc2" maxlength="40" placeholder="Впишите свой раздел" style="display:none" value="">' + '<label>Название</label><input id="ft" maxlength="60" value="' + esc(s.title) + '"><label>Цена, ₸</label><input id="fp" inputmode="numeric" value="' + esc(s.price) + '"><div class="muted small" id="fh"></div><label>Длительность</label><select id="fm">' + opts + '</select><button class="btn ok" id="fOk">Сохранить</button><div id="fE"></div></div>';
    var fcs = $('#fc', el), fp = $('#fp', el);
    fcs.onchange = function () { $('#fc2', el).style.display = fcs.value === '__c' ? '' : 'none'; };
    function fh() { $('#fh', el).textContent = 'Комиссия VIP Light за этот визит: ' + visitFee(fp.value) + ' ₸ (50 / 100 / 200 ₸ в зависимости от суммы чека)'; }
    fp.oninput = fh; fh();
    $('#fOk', el).onclick = function () { api('serviceSave', { id: s.id || '', category: $('#fc').value === '__c' ? $('#fc2').value : $('#fc').value, title: $('#ft').value, price: $('#fp').value, minutes: $('#fm').value }).then(function () { toast('Сохранено'); refreshCab('svc'); }).catch(function (e) { $('#fE', el).innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; }); };
  }
  $('#sAdd', el).onclick = function () { form(); };
  $$('[data-e]', el).forEach(function (b) { b.onclick = function () { form(CAB.services.filter(function (s) { return s.id === b.getAttribute('data-e'); })[0]); }; });
  $$('[data-d]', el).forEach(function (b) { b.onclick = function () { if (confirm('Удалить услугу?')) api('serviceDelete', { id: b.getAttribute('data-d') }).then(function () { refreshCab('svc'); }).catch(function (e) { toast(errText(e)); }); }; });
}
function timeOpts(sel, blank) { if (sel === '24:00') sel = '00:00'; var o = blank ? '<option value="">—</option>' : ''; for (var m = 0; m < 1440; m += 30) { var v = ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); o += '<option' + (v === sel ? ' selected' : '') + '>' + v + '</option>'; } return o; }
function tWk(el) {
  var dn = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  el.innerHTML = '<h2>Рабочие часы</h2><p class="muted small">Шаг записи — 30 минут. Перерыв необязателен.</p>' + CAB.week.map(function (d, i) { return '<div class="card"><label style="display:flex;gap:8px;align-items:center;color:var(--tx);font-weight:700"><input type="checkbox" style="width:auto;margin:0" data-on="' + i + '"' + (d.on ? ' checked' : '') + '> ' + dn[i] + '</label><div class="tm"><div><label>С</label><select data-s="' + i + '">' + timeOpts(d.start, 1) + '</select></div><div><label>До (00:00 — до полуночи)</label><select data-e="' + i + '">' + timeOpts(d.end, 1) + '</select></div><div><label>Перерыв с</label><select data-bs="' + i + '">' + timeOpts(d.bs, 1) + '</select></div><div><label>Перерыв до</label><select data-be="' + i + '">' + timeOpts(d.be, 1) + '</select></div></div></div>' + (i === 0 ? '<div class="btnrow"><button class="btn sec sm" id="wAll">📋 Скопировать график Пн на всю неделю</button><button class="btn sec sm" id="w5">📋 Скопировать график Пн на Пн–Пт</button></div>' : ''); }).join('') + '<button class="btn ok" id="wSave">💾 Сохранить график</button><div id="wE"></div><h2>Выходные даты</h2><div class="row"><input type="date" id="oDate" min="' + zkoToday() + '"><button class="btn sec sm" id="oAdd" style="flex:none">Сделать выходным</button></div>' + (CAB.offDays.length ? CAB.offDays.map(function (d) { return '<span class="badge red" style="margin:4px 4px 0 0">' + ruDate(d) + ' <a href="#" data-x="' + d + '" style="color:inherit">✕</a></span>'; }).join('') : '<p class="muted small">Исключений нет.</p>');
  function monday() { return { s: $('[data-s="0"]', el).value, e: $('[data-e="0"]', el).value, bs: $('[data-bs="0"]', el).value, be: $('[data-be="0"]', el).value }; }
  function fillDay(i, mo) { $('[data-on="' + i + '"]', el).checked = true; $('[data-s="' + i + '"]', el).value = mo.s; $('[data-e="' + i + '"]', el).value = mo.e; $('[data-bs="' + i + '"]', el).value = mo.bs; $('[data-be="' + i + '"]', el).value = mo.be; }
  function copyMon(last) { var mo = monday(); if (!mo.s || !mo.e) { toast('Сначала задайте часы в понедельнике'); return; } for (var i = 1; i <= last; i++) fillDay(i, mo); toast('График понедельника скопирован'); }
  $('#wAll', el).onclick = function () { copyMon(6); };
  $('#w5', el).onclick = function () { copyMon(4); };
  $$('[data-on]', el).forEach(function (cb) { cb.onchange = function () { var i = +cb.getAttribute('data-on'); if (!cb.checked || i === 0) return; var mo = monday(); if (mo.s && mo.e && !$('[data-s="' + i + '"]', el).value && !$('[data-e="' + i + '"]', el).value) fillDay(i, mo); }; });
  $('#wSave', el).onclick = function () {
    var week = CAB.week.map(function (d, i) { return { d: i + 1, on: $('[data-on="' + i + '"]', el).checked, start: $('[data-s="' + i + '"]', el).value, end: $('[data-e="' + i + '"]', el).value, bs: $('[data-bs="' + i + '"]', el).value, be: $('[data-be="' + i + '"]', el).value }; });
    api('scheduleSave', { week: week }).then(function () { toast('График сохранён'); refreshCab('wk'); }).catch(function (e) { $('#wE', el).innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; });
  };
  $('#oAdd', el).onclick = function () { var v = $('#oDate', el).value; if (v) api('offDay', { date: v, off: true }).then(function () { refreshCab('wk'); }).catch(function (e) { toast(errText(e)); }); };
  $$('[data-x]', el).forEach(function (a) { a.onclick = function (ev) { ev.preventDefault(); api('offDay', { date: a.getAttribute('data-x'), off: false }).then(function () { refreshCab('wk'); }); }; });
}
function tCl(el) {
  el.innerHTML = '<h2>Мой чёрный список</h2><p class="muted small">Заблокированный клиент не сможет записаться к вам. Если один номер получит блокировки от 3 разных мастеров, он блокируется на всей платформе.</p><p class="muted center">Загрузка…</p>';
  api('blList').then(function (j) {
    el.innerHTML = '<h2>Мой чёрный список</h2><p class="muted small">Заблокированный клиент не сможет записаться к вам. Если один номер получит блокировки от 3 разных мастеров, он блокируется на всей платформе.</p>' + (j.list.length ? j.list.map(function (c) { return '<div class="card">👤 ' + esc(c.name || 'Клиент') + ' · +' + esc(c.phone) + '<div><button class="btn sec sm" data-u="' + esc(c.phone) + '">♻️ Убрать</button></div></div>'; }).join('') : '<div class="card muted">Список пуст. Добавить клиента можно во вкладке «Записи» (после визита или неявки).</div>');
    $$('[data-u]', el).forEach(function (b) { b.onclick = function () { api('blRemove', { phone: b.getAttribute('data-u') }).then(function () { tCl(el); }); }; });
  }).catch(function (e) { el.innerHTML = failHtml(e, 'чёрный список'); bindRetry(el, function () { tCl(el); }); });
}
function tRv(el) {
  el.innerHTML = '<p class="muted center">Загрузка…</p>';
  api('reviews', { slug: CAB.master.slug, token: '' }).then(function (j) {
    el.innerHTML = '<h2>Мой рейтинг: ' + (j.rating.count ? j.rating.avg + ' ★ (' + j.rating.count + ')' : 'пока нет') + '</h2>' + (j.reviews.length ? j.reviews.map(function (r) { return '<div class="card">' + stars(r.stars) + ' <b>' + esc(r.name) + '</b> <span class="muted small">' + esc(r.date) + '</span><p>' + esc(r.comment || '') + '</p></div>'; }).join('') : '<div class="card muted">Оценки приходят только после завершённых визитов. Отмечайте визиты кнопкой «✔ Визит завершён».</div>');
  });
}
/* ---------- фото работ ---------- */
var PHC = {};
function photoSrc(id, img) { if (PHC[id]) { img.src = PHC[id]; return; } api('photoData', { id: id, token: '' }).then(function (j) { PHC[id] = j.data; img.src = j.data; }).catch(function () { img.alt = '—'; }); }
function galleryHtml(ph, ig) {
  if (!ph.length && !ig) return '';
  return '<div class="card"><b>📸 Работы мастера</b>' + (ph.length ? '<div class="gal">' + ph.map(function (id) { return '<img data-p="' + esc(id) + '" alt="Фото работы" loading="lazy">'; }).join('') + '</div>' : '') + (ig ? '<a class="btn sec sm" target="_blank" rel="noopener" href="' + esc(ig) + '">📷 Смотреть работы в Instagram</a>' : '') + '</div>';
}
function galleryBind() {
  $$('.gal img').forEach(function (im) { photoSrc(im.getAttribute('data-p'), im); im.onclick = function () { if (!im.src) return; var lb = document.createElement('div'); lb.className = 'lb'; lb.innerHTML = '<img src="' + im.src + '" alt="">'; lb.onclick = function () { lb.remove(); }; document.body.appendChild(lb); }; });
}
function tPh(el) {
  el.innerHTML = '<p class="muted center">Загрузка…</p>';
  api('photoList').then(function (j) {
    var prem = j.level === 'premium', h = '<h2>📸 Фото работ</h2>';
    if (!j.limit) {
      el.innerHTML = h + '<div class="card"><p>🔒 <b>Фото работ доступны на тарифах VIP Light и VIP Premium.</b></p><p class="muted small">VIP Light — до 3 фото, VIP Premium — до 15 фото и ссылка на ваш Instagram. Фото в карточке мастера привлекают больше клиентов.</p><button class="btn" id="phT">💎 Выбрать тариф</button></div>';
      $('#phT', el).onclick = function () { cab('bal'); }; return;
    }
    h += '<div class="muted small">Загружено ' + j.photos.length + ' из ' + j.limit + '. Фото добавляются через нашего Телеграм-бота: нажмите кнопку, отправьте боту фото (как обычное фото) — оно появится здесь.</div>';
    h += '<div class="gal">' + j.photos.map(function (x) { return '<div class="ph"><img data-p="' + esc(x.id) + '" alt="Фото работы"><button class="btn red sm" data-x="' + esc(x.id) + '">🗑 Удалить</button></div>'; }).join('') + '</div>';
    h += (DEMO ? '<p class="muted small">В демо фото загружаются через бота, поэтому здесь показаны примеры работ.</p>' : '<a class="btn" target="_blank" rel="noopener" href="https://t.me/' + esc(j.bot || 'zko_onlayn_zapis_bot') + '">➕ Загрузить фото в Telegram</a><button class="btn sec sm" id="phR">🔄 Обновить список</button>');
    h += prem ? '<div class="card"><h3>Instagram</h3><hr class="sep"><p class="muted small">Кнопка «📷 Смотреть работы в Instagram» появится в вашей карточке.</p><input id="phIg" maxlength="100" placeholder="@ваш_аккаунт или ссылка" value="' + esc((j.instagram || '').replace('https://instagram.com/', '@')) + '"><button class="btn ok sm" id="phIgS">Сохранить ссылку</button></div>' : '<p class="muted small">🔒 Ссылка на Instagram доступна на тарифе VIP Premium.</p>';
    h += '<div id="phE"></div>';
    el.innerHTML = h;
    $$('.gal img', el).forEach(function (im) { photoSrc(im.getAttribute('data-p'), im); });
    $$('[data-x]', el).forEach(function (b) { b.onclick = function () { if (!confirm('Удалить это фото?')) return; api('photoDelete', { id: b.getAttribute('data-x') }).then(function () { toast('Фото удалено'); tPh(el); }).catch(function (e) { toast(errText(e)); }); }; });
    var r = $('#phR', el); if (r) r.onclick = function () { tPh(el); };
    var sv = $('#phIgS', el); if (sv) sv.onclick = function () { api('profileSave', { name: CAB.master.name, about: CAB.master.about, instagram: $('#phIg').value }).then(function () { toast('Сохранено'); }).catch(function (e) { $('#phE', el).innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; }); };
  }).catch(function (e) { el.innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; });
}
function tBal(el) {
  var s = CAB.sub, k = CAB.kaspi || {}, ok = !s.needCard, pr = CAB.premium || [];
  var st = s.level === 'premium' ? '👑 VIP Premium ' + (s.forever ? 'навсегда' : 'до <b>' + dmy(s.until) + '</b> (осталось ' + s.daysLeft + ' дн.)') : (s.level === 'light' ? '💎 VIP Light · баланс <b>' + money(s.balance) + '</b>' : (s.paused ? '⏸ VIP Light на паузе · баланс ' + money(s.balance) + ' (нужно от 100 ₸)' : '🆓 Бесплатный старт'));
  var h = '<h2>Тарифы и пополнение</h2><div class="card"><b>Сейчас:</b> ' + st + '</div>';
  if (!ok) h += '<div class="notice">⚠️ <b>VIP Light и VIP Premium доступны только мастерам с карточкой в Картотеке ЗКО.</b> Добавьте себя в Картотеку и впишите номер карточки в «Профиле». На «Бесплатном старте» карточка не обязательна.</div><a class="btn" target="_blank" rel="noopener" href="' + esc(cartUrl()) + '">➕ Добавить себя в Картотеку ЗКО</a><button class="btn sec" id="bPf">⚙️ Открыть профиль</button>';
  h += '<div class="card"><b>🆓 Бесплатный старт</b> — 0 ₸ навсегда<br><span class="muted small">Без плашки · до 3 онлайн-записей в сутки · до 3 услуг · 1 акция в разделе «🎁 Мои акции» · без кнопки в Картотеке · без авто-напоминаний клиенту за 2 часа</span></div>' +
    '<div class="card tier light"><b>💎 VIP Light</b> <span class="badge teal">бирюзовая плашка</span><br>Оплата по факту: <b>50 / 100 / 200 ₸ за каждый состоявшийся визит</b> в зависимости от суммы чека (до 999 ₸ — 50 ₸; от 1 000 до 10 000 ₸ — 100 ₸; свыше 10 000 ₸ или «договорная» — 200 ₸). При отмене или неявке клиента комиссия не списывается. Пополняйте баланс на любую сумму через Kaspi.<br><span class="muted small">Безлимит записей и услуг · 2 акции в разделе «🎁 Мои акции» · кнопка в Картотеке · авто-напоминания клиенту за 2 часа. Если баланс меньше 100 ₸ — плашка и кнопка на паузе.</span></div>' +
    '<div class="card tier gold"><b>👑 VIP Premium</b> <span class="badge gold">золотая плашка</span><br>Подписка без списаний с баланса:<br>' + pr.map(function (x) { return '• ' + esc(x.label) + ' — <b>' + money(x.price) + '</b>'; }).join('<br>') + '<br><span class="muted small">Первые места в списке · безлимит записей и услуг · 3 акции в разделе «🎁 Мои акции» · кнопка в Картотеке · авто-напоминания · приоритетная помощь Владельца в настройке.</span></div>';
  if (ok) {
    var cmt = 'VIP ' + CAB.master.name + ' +' + CAB.phone;
    h += '<div class="card" id="kaspi"><b>💳 Оплата через Kaspi</b><div class="row"><span>Номер Kaspi</span><b>' + esc(k.phone) + '</b></div><button class="btn sec sm" id="kNum">📋 Скопировать номер Kaspi</button><div class="row"><span>Получатель</span><b>' + esc(k.name) + '</b></div><button class="btn sec sm" id="kNm">📋 Скопировать имя получателя</button><hr class="sep"><label>Что оплачиваете</label><select id="kWhat"><option value="light">VIP Light — пополнение баланса</option>' + pr.map(function (x) { return '<option value="' + x.key + '">VIP Premium — ' + esc(x.label) + ' (' + money(x.price) + ')</option>'; }).join('') + '</select><div id="kAmW"><hr class="sep"><label>Сумма пополнения, ₸</label><input id="kAm" inputmode="numeric" value="1000"></div><label>Комментарий к переводу (вставьте при оплате)</label><input id="kCm" readonly value="' + esc(cmt) + '" onclick="this.select()"><button class="btn sec sm" id="kCp">📋 Скопировать комментарий</button><button class="btn ok" id="kSend">✅ Отправить чек Владельцу в Telegram</button><p class="muted small">Переведите деньги на Kaspi, затем нажмите кнопку: откроется чат с Владельцем с готовым текстом — прикрепите чек из Kaspi. После проверки Владелец зачислит оплату, а бот пришлёт вам уведомление.</p></div>';
  }
  if ((CAB.ledger || []).length) h += '<div class="card"><b>История баланса</b>' + CAB.ledger.map(function (x) { return '<div class="row"><span class="small">' + esc(String(x.date).slice(0, 16)) + ' · ' + esc(x.note) + '</span><b class="' + (x.delta < 0 ? 'neg' : 'pos') + '">' + (x.delta > 0 ? '+' : '') + x.delta + ' ₸</b></div>'; }).join('') + '</div>';
  h += '<p class="muted small">Указанные расценки могут обновляться по мере развития сервиса. Однако для всех уже оплаченных и активированных пакетов VIP Light и VIP Premium условия и стоимость фиксируются на весь оплаченный период (а для тарифа «Навсегда» — бессрочно) и изменению не подлежат.</p>';
  el.innerHTML = h;
  if ($('#bPf', el)) $('#bPf', el).onclick = function () { cab('pf'); };
  if (!ok) return;
  var amW = $('#kAmW', el), what = $('#kWhat', el);
  what.onchange = function () { amW.hidden = what.value !== 'light'; };
  $('#kNum', el).onclick = function () { copyText(k.phone, 'Номер Kaspi скопирован'); };
  $('#kNm', el).onclick = function () { copyText(k.name, 'Имя получателя скопировано'); };
  $('#kCp', el).onclick = function () { copyText($('#kCm', el).value, 'Комментарий скопирован'); };
  $('#kSend', el).onclick = function () {
    var w = what.value, amt = w === 'light' ? Math.max(0, parseInt($('#kAm', el).value, 10) || 0) : 0, label = w === 'light' ? 'пополнение VIP Light на ' + amt + ' ₸' : 'VIP Premium (' + (pr.filter(function (x) { return x.key === w; })[0] || {}).label + ')';
    var text = 'Здравствуйте! Оплатил(а) через Kaspi: ' + label + '. Мастер: ' + CAB.master.name + ' (' + CAB.master.slug + '), телефон +' + CAB.phone + '. Комментарий к переводу: ' + $('#kCm', el).value + '. Прикрепляю чек из Kaspi. Прошу зачислить.';
    if (DEMO) { toast('В демо ничего не отправляется'); return; }
    var u = k.tg ? 'https://t.me/' + encodeURIComponent(k.tg) + '?text=' + encodeURIComponent(text) : 'https://t.me/share/url?url=' + encodeURIComponent(siteBase()) + '&text=' + encodeURIComponent(text);
    window.open(u, '_blank');
    api('topupRequest', { amount: amt }).then(function () { toast('Владельцу отправлено уведомление. Пришлите чек в чат.'); }).catch(function (e) { toast(errText(e)); });
  };
}
function tPf(el) {
  var m = CAB.master;
  el.innerHTML = '<h2>Профиль</h2><div class="card"><label>Имя / название</label><input id="pn" maxlength="60" value="' + esc(m.name) + '"><label>О себе</label><textarea id="pa" rows="3" maxlength="400">' + esc(m.about) + '</textarea><label>Категория</label><select id="pcat">' + catOptions(m.category, '— не выбрана —') + '</select><label>Где вы принимаете: область ➡️ район ➡️ село</label><div id="pGeo"></div><label>Формат приёма</label><select id="pm"><option value="home"' + (m.mode === 'home' ? ' selected' : '') + '>Приём у себя (с адресом)</option><option value="visit"' + (m.mode === 'visit' ? ' selected' : '') + '>Выезд на дом</option><option value="both"' + (m.mode === 'both' ? ' selected' : '') + '>Оба варианта</option></select><label>Ваш адрес (для приёма у себя)</label><input id="pad" maxlength="100" placeholder="ул. Центральная, 1" value="' + esc(m.address || '') + '"><label>Номер карточки в Картотеке ЗКО</label><input id="pc" maxlength="40" placeholder="например daryinskoe-1101" value="' + esc(m.card || '') + '"><p class="muted small">Карточка нужна для VIP Light и VIP Premium (на «Бесплатном старте» не обязательна). Кнопка «Записаться онлайн» в справочнике откроет именно вашу страницу — даже если телефон в карточке записан иначе.</p>' + (m.card ? '' : '<a class="btn sec sm" target="_blank" rel="noopener" href="' + esc(cartUrl()) + '">➕ Добавить себя в Картотеку ЗКО</a>') + '<button class="btn ok" id="pSave">Сохранить</button></div><div class="card"><h3>Сменить ПИН-код</h3><hr class="sep"><label>Старый ПИН</label><input id="po" inputmode="numeric" maxlength="4" type="password"><label>Новый ПИН</label><input id="pw" inputmode="numeric" maxlength="4" type="password"><button class="btn sec" id="pPin">Сменить ПИН</button></div><div id="pE"></div>';
  var PG = mGeo(m); geoPick($('#pGeo', el), PG, { add: true });
  $('#pSave', el).onclick = function () { api('profileSave', { name: $('#pn').value, about: $('#pa').value, category: $('#pcat').value, region: PG.r, district: PG.d, village: PG.v, mode: $('#pm').value, address: $('#pad').value, card: $('#pc').value }).then(function () { toast('Сохранено'); refreshCab('pf'); }).catch(function (e) { $('#pE', el).innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; }); };
  $('#pPin', el).onclick = function () { api('pinChange', { oldPin: $('#po').value, newPin: $('#pw').value }).then(function () { toast('ПИН изменён'); }).catch(function (e) { $('#pE', el).innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; }); };
}

/* ---------- адрес сайта из браузера, «Поделиться», инструкция, ошибки двух уровней, кабинет владельца ---------- */
/* Адрес сайта определяется динамически (origin + папка без index.html): при переезде на свой домен код менять не нужно.
   «адресСайта» из config.json — только резерв (например, если страница открыта как файл). */
function siteBase() {
  var base = '';
  try { if (/^https?:$/.test(location.protocol)) base = location.origin + location.pathname.replace(/[^\/]*$/, ''); } catch (e) {}
  if (!base) { base = String(CFG.siteUrl || '').replace(/[?#].*$/, ''); if (base && base.slice(-1) !== '/') base += '/'; }
  return base || './';
}
var PROJECTS = [['🎈 Миллион шаров • Уральск', 'https://gints-zko.github.io/shar/']];
function projectsHtml() {
  return PROJECTS.map(function (x) { return '<a class="btn sec" target="_blank" rel="noopener" href="' + esc(x[1]) + '">' + esc(x[0]) + '</a>'; }).join('') + '<a class="btn sec" target="_blank" rel="noopener" href="' + esc(cartUrl()) + '">📖 Картотека ЗКО</a>';
}
/* «📤 Поделиться»: системное меню телефона; если его нет — текст и ссылка копируются в буфер */
function shareProfile(slug, name, own) {
  var link = siteBase() + '?m=' + encodeURIComponent(slug);
  var text = own ? 'Здравствуйте! Записывайтесь ко мне онлайн — выберите услугу и удобное время в пару нажатий, без звонков и переписки.' : 'Рекомендую специалиста «' + name + '». Записаться можно онлайн — выберите услугу и удобное время:';
  var full = text + '\n' + link;
  if (navigator.share) {
    navigator.share({ title: own ? 'Запись онлайн — ' + name : name + ' — запись онлайн', text: text, url: link }).catch(function (e) { if (e && e.name === 'AbortError') return; copyText(full, 'Ссылка на профиль скопирована'); });
  } else copyText(full, 'Ссылка на профиль скопирована');
}
/* Уровень 1 (обычные посетители): только спокойный человеческий текст и кнопка «Повторить» */
var NETC = { net: 1, timeout: 1, bad_response: 1, server_error: 1, busy: 1 };
function failHtml(e, what) {
  var c = e && e.message;
  var t = NETC[c] ? 'Не удалось загрузить ' + what + ' — похоже, пропал интернет или сервер долго отвечает. Проверьте связь и нажмите «Повторить».' : errText(e);
  return '<div class="err">' + esc(t) + '</div><button class="btn sec js-retry">🔄 Повторить</button>';
}
function bindRetry(root, fn) { $$('.js-retry', root).forEach(function (b) { b.onclick = fn; }); }
/* инструкция */
var HELP_NAV = false;
function helpBtn(tab, label) { return '<button class="helpbtn" data-help="' + tab + '">' + (label || '📖 Подсказка: как это работает') + '</button>'; }
function helpOpen(tab) { HELP_NAV = true; go('#/help/' + tab); }
function helpPage(tab) {
  tab = tab === 'ms' ? 'ms' : 'cl'; navShow(true, 'more');
  var H = window.ZKHELP || { cl: [], ms: [], intro: {} }, L = H[tab] || [];
  view('<button class="back" id="hBk">⬅️ Назад</button><h1>📖 Как пользоваться сайтом</h1><div class="tabs help-tabs"><button class="tab' + (tab === 'cl' ? ' on' : '') + '" data-ht="cl">👤 Для клиентов (как записаться к специалисту)</button><button class="tab' + (tab === 'ms' ? ' on' : '') + '" data-ht="ms">💼 Для мастеров и специалистов (как вести запись)</button></div>' + (H.intro && H.intro[tab] ? '<p class="muted">' + H.intro[tab] + '</p>' : '') + L.map(function (x, i) { return '<details class="hp"' + (i === 0 ? ' open' : '') + '><summary>' + x[0] + '</summary><div class="hb">' + x[1] + '</div></details>'; }).join('') + '<button class="btn sec" id="hBk2">⬅️ Назад</button>');
  function back() { if (HELP_NAV) { HELP_NAV = false; history.back(); } else go('#/more'); }
  $('#hBk').onclick = back; $('#hBk2').onclick = back;
  $$('[data-ht]').forEach(function (b) { b.onclick = function () { try { history.replaceState(null, '', '#/help/' + b.getAttribute('data-ht')); } catch (e) {} helpPage(b.getAttribute('data-ht')); }; });
}
/* ---------- «🎁 Мои акции»: 3 слота по тарифам (Бесплатный — 1, VIP Light — 2, VIP Premium — 3) ---------- */
function tPromo(el) {
  var lim = CAB.promoLimit || 1, L = (CAB.promos || []).map(function (x) { return { on: x.on, aud: x.aud, text: x.text }; });
  while (L.length < 3) L.push({ on: '0', aud: 'all', text: '' });
  var h = '<h2>🎁 Мои акции</h2><p class="muted small">Акции видят клиенты в вашей карточке на витрине и на вашей странице. Слотов: «Бесплатный» — 1, «VIP Light» — 2, «VIP Premium» — 3.</p>';
  L.forEach(function (x, i) {
    if (i >= lim) { h += '<div class="card promo-slot locked"><b>🔒 Акция ' + (i + 1) + '</b><p class="muted small">2-я акция открывается на тарифе VIP Light, 3-я — на VIP Premium.</p></div>'; return; }
    h += '<div class="card promo-slot"><b>🎁 Акция ' + (i + 1) + '</b><label class="switch"><input type="checkbox" data-on="' + i + '"' + (x.on === '1' ? ' checked' : '') + '> <span data-sw="' + i + '">' + (x.on === '1' ? 'Включено' : 'Выключено') + '</span></label>' +
      '<label>Для кого</label><select data-aud="' + i + '"><option value="all"' + (x.aud !== 'loyal' ? ' selected' : '') + '>🌟 Для новых и всех клиентов</option><option value="loyal"' + (x.aud === 'loyal' ? ' selected' : '') + '>💎 Только для постоянных клиентов</option></select>' +
      '<label>Условия акции</label><textarea data-tx="' + i + '" rows="3" maxlength="300" placeholder="Например: скидка 10% на второе посещение">' + esc(x.text) + '</textarea></div>';
  });
  h += '<div id="prE"></div><button class="btn" id="prSave">💾 Сохранить акции</button><p class="muted small">«Только для постоянных клиентов»: полный текст увидят лишь клиенты, у которых есть хотя бы одна состоявшаяся запись именно у вас. Остальные увидят закрытую плашку с замком. Клиенту подсказка также показана в «Мои записи».</p>';
  el.innerHTML = h;
  $$('[data-on]', el).forEach(function (c) { c.onchange = function () { $('[data-sw="' + c.getAttribute('data-on') + '"]', el).textContent = c.checked ? 'Включено' : 'Выключено'; }; });
  $('#prSave', el).onclick = function () {
    var arr = [0, 1, 2].map(function (i) { if (i >= lim) return { on: '0', aud: 'all', text: '' }; return { on: $('[data-on="' + i + '"]', el).checked ? '1' : '0', aud: $('[data-aud="' + i + '"]', el).value, text: $('[data-tx="' + i + '"]', el).value }; });
    api('promoSave', { promos: arr }).then(function (j) { CAB.promos = j.promos; toast('Акции сохранены'); }).catch(function (e) { $('#prE', el).innerHTML = '<div class="err">' + esc(errText(e) + (e.data && e.data.slot ? ' (акция ' + e.data.slot + ')' : '')) + '</div>'; });
  };
}
/* ---------- режим клиента для мастера (возврат — только по личному ПИН-коду) ---------- */
function clientModeAsk() {
  var box = dlg('cmBox');
  box.innerHTML = '<div class="wn-card" role="dialog" aria-modal="true"><h2>👤 Записаться как клиент</h2><p>Откроется раздел «Мои записи»: вы сможете записаться к другому специалисту как обычный клиент.</p><p>Чтобы вернуться в кабинет мастера, потребуется ваш личный ПИН-код. Если ПИН-код ещё не задан — сначала предложим его задать.</p><div id="cmE"></div><button class="btn" id="cmGo">Перейти к записи как клиент</button><button class="btn sec" id="cmNo">Отмена</button></div>';
  box.querySelector('#cmNo').onclick = function () { box.remove(); };
  box.querySelector('#cmGo').onclick = function () {
    api('clientMode').then(function () { box.remove(); setRole(true, true); navGo('#/my'); }).catch(function (e) {
      if (e.message === 'pin_not_set') return pinSetAsk(box);
      box.querySelector('#cmE').innerHTML = '<div class="err">' + esc(errText(e)) + '</div>';
    });
  };
}
function pinSetAsk(box) {
  box.innerHTML = '<div class="wn-card" role="dialog" aria-modal="true"><h2>🔐 Задайте ПИН-код</h2><p class="muted small">Он понадобится, чтобы вернуться в кабинет мастера из режима клиента. Ровно 4 цифры.</p><input id="psIn" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••"><div id="psE"></div><button class="btn" id="psOk">Сохранить ПИН-код и продолжить</button><button class="btn sec" id="psNo">Отмена</button></div>';
  box.querySelector('#psNo').onclick = function () { box.remove(); };
  box.querySelector('#psOk').onclick = function () {
    var v = box.querySelector('#psIn').value.replace(/\D/g, '');
    if (v.length !== 4) { box.querySelector('#psE').innerHTML = '<div class="err">ПИН — ровно 4 цифры.</div>'; return; }
    api('pinChange', { newPin: v }).then(function () { return api('clientMode'); }).then(function () { box.remove(); setRole(true, true); navGo('#/my'); }).catch(function (e) { box.querySelector('#psE').innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; });
  };
}
function pinReturn() {
  var box = dlg('pinBox');
  box.innerHTML = '<div class="wn-card" role="dialog" aria-modal="true"><h2>🔐 Вернуться в кабинет мастера</h2><p class="muted small">Введите личный ПИН-код (4 цифры).</p><input id="prIn" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••"><div id="prE"></div><button class="btn" id="prOk">Войти в кабинет</button><button class="btn sec" id="prNo">Отмена</button><p class="center small"><a href="#" id="prFg">Забыли ПИН-код? Войти через одноразовый код из Telegram</a></p></div>';
  var inp = box.querySelector('#prIn'); inp.focus();
  box.querySelector('#prNo').onclick = function () { box.remove(); };
  box.querySelector('#prFg').onclick = function (e) { e.preventDefault(); box.remove(); recoverPin(); };
  function submit() {
    var v = inp.value.replace(/\D/g, ''); if (v.length !== 4) { box.querySelector('#prE').innerHTML = '<div class="err">ПИН — ровно 4 цифры.</div>'; return; }
    api('pinLogin', { pin: v }).then(function () { box.remove(); setRole(true, false); navGo('#/cab'); }).catch(function (e) { inp.value = ''; box.querySelector('#prE').innerHTML = '<div class="err">' + esc(errText(e)) + '</div>'; });
  }
  box.querySelector('#prOk').onclick = submit; inp.onkeydown = function (e) { if (e.key === 'Enter') submit(); };
}
function recoverPin() {
  navShow(true, 'my');
  view('<h1>Забыли ПИН-код?</h1><p class="muted">Подтвердите свой номер одноразовым кодом из Telegram — кабинет мастера откроется без ПИН-кода. Потом ПИН-код можно сменить во вкладке «⚙️ Профиль».</p>');
  APP.appendChild(loginBlock(function (j) { if (j.isMaster) { setRole(true, false); cabEntry(); } else { toast('Этот номер не зарегистрирован как мастер'); myPage(); } }, { recover: true, title: 'Вход по одноразовому коду из Telegram' }));
}

/* ---------- вход и админка владельца: удержание плашки «Версия приложения» 2 секунды ---------- */
var OWN = { token: '' };
try { OWN.token = sessionStorage.getItem('zk_otok') || ''; } catch (e) {}
var HOLD_MS = 2000;
function ownerHoldBind(el) {
  if (!el || el.getAttribute('data-oh')) return; el.setAttribute('data-oh', '1');
  var t = null;
  function stop() { if (t) { clearTimeout(t); t = null; } el.classList.remove('holding'); }
  el.addEventListener('pointerdown', function () { if (t) return; el.classList.add('holding'); t = setTimeout(function () { t = null; el.classList.remove('holding'); try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) {} ownerGate(); }, HOLD_MS); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) { el.addEventListener(n, stop); });
  el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
}
function ownerGate() {
  if (DEMO) { toast('В демо кабинет владельца недоступен'); return; }
  if (OWN.token) { if ((location.hash || '') === '#/owner') route(); else go('#/owner'); return; }
  var box = dlg('ownBox'), fails = 0;
  function er(t, cls) { var e = box.querySelector('#ownE'); if (e) e.innerHTML = t ? '<div class="' + (cls || 'err') + '">' + esc(t) + '</div>' : ''; }
  function ok(j) {
    OWN.token = j.token; try { sessionStorage.setItem('zk_otok', j.token); } catch (e) {}
    ls('zk_owner', '1'); api('statPing', { dev: devId(), kind: 'visitor', token: j.token }).catch(function () {});
    box.remove(); toast('Вход владельца выполнен'); ADM.sec = 'sum'; if ((location.hash || '') === '#/owner') route(); else go('#/owner');
  }
  function pwView() {
    box.innerHTML = '<div class="wn-card" role="dialog" aria-modal="true"><h2>🔐 Вход для владельца</h2><label for="ownPw">Пароль</label><div class="pw"><input id="ownPw" type="password" autocomplete="current-password" placeholder="Пароль владельца"><button type="button" class="eye" id="ownEye" aria-label="Показать или скрыть пароль">👁</button></div><div id="ownE"></div><button class="btn" id="ownOk">Войти</button><button class="btn sec" id="ownNo">Закрыть</button><p class="center small"><a href="#" id="ownFg">Забыли пароль? Войти через Telegram</a></p></div>';
    var inp = box.querySelector('#ownPw'); inp.focus();
    box.querySelector('#ownNo').onclick = function () { box.remove(); };
    box.querySelector('#ownEye').onclick = function () { inp.type = inp.type === 'password' ? 'text' : 'password'; };
    box.querySelector('#ownFg').onclick = function (e) { e.preventDefault(); codeView('Резервный вход: код придёт в Telegram-бота.', true); };
    function submit() {
      if (!inp.value) { er('Введите пароль.'); return; }
      er('Проверяю…', 'muted small');
      api('ownerLogin', { password: inp.value, token: '' }).then(ok).catch(function (e) {
        if (e.message === 'owner_pass_none') return codeView('Постоянный пароль ещё не передан в настройки шлюза — войдите через Telegram.', true);
        if (e.message === 'owner_bad_pass') { fails++; if (fails >= 3) return codeView('Три неверных пароля подряд — вход переключён на резервный код из Telegram.', true); er('Пароль неверный. Осталось попыток: ' + (3 - fails) + '.'); return; }
        er(errText(e));
      });
    }
    box.querySelector('#ownOk').onclick = submit; inp.onkeydown = function (e) { if (e.key === 'Enter') submit(); };
  }
  function codeView(msg, send) {
    box.innerHTML = '<div class="wn-card" role="dialog" aria-modal="true"><h2>🔐 Вход для владельца</h2><p class="muted small" id="ownM">' + esc(msg) + '</p><label for="ownCd">Одноразовый код из Telegram (6 цифр)</label><input id="ownCd" inputmode="numeric" autocomplete="one-time-code" maxlength="12" placeholder="000000"><div id="ownE"></div><button class="btn" id="ownOk">Войти</button><button class="btn sec" id="ownSend">📨 Отправить код в Telegram ещё раз</button><button class="btn sec" id="ownNo">Закрыть</button><p class="center small"><a href="#" id="ownBk">← Вернуться ко входу по паролю</a></p></div>';
    var inp = box.querySelector('#ownCd');
    function sendCode() { er('Отправляю код в Telegram…', 'muted small'); api('ownerCodeRequest', { token: '' }).then(function () { er('Код отправлен в Telegram-бота. Действует 5 минут.', 'muted small'); inp.focus(); }).catch(function (e) { er(errText(e)); }); }
    if (send) sendCode();
    box.querySelector('#ownSend').onclick = sendCode;
    box.querySelector('#ownNo').onclick = function () { box.remove(); };
    box.querySelector('#ownBk').onclick = function (e) { e.preventDefault(); fails = 0; pwView(); };
    function submit() {
      var v = inp.value.replace(/\D/g, ''); if (v.length !== 6) { er('Введите 6 цифр кода.'); return; }
      er('Проверяю…', 'muted small'); api('ownerLogin', { code: v, token: '' }).then(ok).catch(function (e) { er(errText(e)); });
    }
    box.querySelector('#ownOk').onclick = submit; inp.onkeydown = function (e) { if (e.key === 'Enter') submit(); };
  }
  pwView();
}
/* Уровень 2 (только кабинет владельца): шаг остановки, причина простым языком, подсказка. Без кода и stack trace. */
function ownerErr(e) {
  var c = e && e.message;
  var M = {
    timeout: ['Сервер не ответил за 20 секунд.', 'Проверьте мобильный интернет и нажмите «Обновить облачный шлюз» в пульте.'],
    net: ['Нет связи с облачным шлюзом (интернет или неверный адрес).', 'Проверьте интернет и строку «Адрес шлюза» в secrets.txt.'],
    bad_response: ['Шлюз ответил не по правилам: скрипту, вероятно, не выданы разрешения или идёт обновление.', 'Откройте ссылку шлюза в браузере, нажмите «Проверить разрешения», затем в пульте нажмите «Обновить облачный шлюз».'],
    bad_action: ['В шлюзе старый код без кабинета владельца.', 'Нажмите «Обновить облачный шлюз» в пульте.'],
    server_error: ['Шлюз сообщил о внутреннем сбое.', 'Загляните в лист «Журнал действий» в Таблице или нажмите «Обновить облачный шлюз» в пульте.'],
    no_gateway: ['Пустой или некорректный адрес шлюза.', 'Проверьте строку «Адрес шлюза» в secrets.txt, нажмите «Обновить облачный шлюз», затем «Залить сайт на GitHub».'],
    auth_required: ['Сеанс владельца закончился.', 'Войдите заново: удержите плашку «Версия приложения» 2 секунды.'], forbidden: ['Этот сеанс не принадлежит владельцу.', 'Войдите заново: удержите плашку «Версия приложения» 2 секунды.']
  };
  return M[c] || ['Шлюз вернул неожиданный ответ.', 'Повторите проверку. Если повторяется — нажмите «Обновить облачный шлюз» в пульте.'];
}
/* ---------- админка: закреплённая шапка + левая шторка «☰ Меню админа» ---------- */
var ADM = { sec: 'sum' };
var ADM_SECS = [['sum', '📊 Сводка и диагностика'], ['ms', '👥 Мастера и тарифы'], ['bk', '📅 Все записи'], ['rv', '⭐ Отзывы'], ['ad', '📢 Объявления'], ['bn', '🚫 Баны']];
function admClear() { ['admHead', 'admDrawer', 'admScrim'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); }); document.body.classList.remove('adm-on'); }
function admLeave() {
  var t = OWN.token; OWN.token = ''; try { sessionStorage.removeItem('zk_otok'); } catch (e) {} ls('zk_owner', null);
  if (t) api('logout', { token: t }).catch(function () {});
  admClear(); toast('Вы вышли из режима владельца'); navGo('#/');
}
function admDrawer(open) { var d = document.getElementById('admDrawer'), c = document.getElementById('admScrim'); if (d) d.classList.toggle('open', !!open); if (c) c.classList.toggle('open', !!open); }
function admBuild() {
  if (document.getElementById('admHead')) return;
  document.body.classList.add('adm-on');
  var h = document.createElement('div'); h.id = 'admHead'; h.innerHTML = '<button type="button" id="admMenu">☰ Меню админа</button><b>🛠️ Админка</b><button type="button" id="admClose">✕ Закрыть</button>';
  var c = document.createElement('div'); c.id = 'admScrim';
  var d = document.createElement('aside'); d.id = 'admDrawer';
  d.innerHTML = '<div class="adm-dh"><b>РАБОЧИЕ РАЗДЕЛЫ</b><button type="button" id="admX" aria-label="Закрыть шторку">✕</button></div><div class="adm-tiles">' + ADM_SECS.map(function (x) { return '<button type="button" class="adm-tile" data-sec="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div><button type="button" class="btn sec" id="admOut">🚪 Выйти</button>';
  document.body.appendChild(h); document.body.appendChild(c); document.body.appendChild(d);
  h.querySelector('#admMenu').onclick = function () { admDrawer(true); };
  h.querySelector('#admClose').onclick = admLeave; d.querySelector('#admOut').onclick = admLeave;
  d.querySelector('#admX').onclick = function () { admDrawer(false); }; c.onclick = function () { admDrawer(false); };
  Array.prototype.forEach.call(d.querySelectorAll('[data-sec]'), function (b) { b.onclick = function () { admDrawer(false); admOpen(b.getAttribute('data-sec')); }; });
}
function admCall(action, data) { return api(action, Object.assign({ token: OWN.token }, data || {})); }
function admFail(e, retry) {
  if (e.message === 'auth_required' || e.message === 'forbidden') { OWN.token = ''; try { sessionStorage.removeItem('zk_otok'); } catch (x) {} admClear(); toast('Сеанс владельца закончился. Войдите заново.'); navGo('#/'); return; }
  var d = ownerErr(e), b = $('#admBody'); if (!b) return;
  b.innerHTML = '<div class="card err">⚠️ <b>Не получилось.</b><br>Причина: ' + esc(d[0]) + '<br>Что сделать: ' + esc(d[1]) + '</div><button class="btn sec js-retry">🔄 Повторить</button>'; bindRetry(b, retry);
}
function admOpen(sec) {
  ADM.sec = sec; var t = ''; ADM_SECS.forEach(function (x) { if (x[0] === sec) t = x[1]; });
  Array.prototype.forEach.call(document.querySelectorAll('#admDrawer [data-sec]'), function (b) { b.classList.toggle('on', b.getAttribute('data-sec') === sec); });
  view('<h1>' + t + '</h1><div id="admBody"><p class="muted center">Загрузка…</p></div>');
  ({ sum: admSum, ms: admMasters, bk: admBookings, rv: admReviews, ad: admAds, bn: admBans })[sec]();
}
function copyRow(label, val) { return '<p class="muted small">' + esc(label) + '</p><div class="cprow"><input readonly value="' + esc(val) + '" onclick="this.select()"><button type="button" class="btn sec sm" data-cp="' + esc(val) + '">📋 Копировать</button></div>'; }
function admSum() {
  var N = 7, all = [];
  all.push(CFG.gatewayUrl ? { ok: true, title: 'Настройки сайта: адрес шлюза найден' } : { ok: false, title: 'Настройки сайта: адрес шлюза', reason: 'Пустой или некорректный адрес шлюза.', hint: 'Проверьте строку «Адрес шлюза» в secrets.txt, нажмите «🚀 ОБНОВИТЬ ВСЁ В 1 КЛИК» в пульте.' });
  all.push({ ok: true, title: 'Адрес сайта определён из браузера: ' + siteBase() });
  var pr = CFG.gatewayUrl ? admCall('ownerPanel') : Promise.reject(apiErr('no_gateway', 'ownerPanel'));
  pr.then(function (j) { j.steps.forEach(function (x) { all.push({ ok: x.ok, title: x.title, reason: x.reason, hint: x.hint }); }); draw(j); })
    .catch(function (e) {
      if (e.message === 'auth_required' || e.message === 'forbidden') return admFail(e);
      var d = ownerErr(e); all.push({ ok: false, title: 'Связь с облачным шлюзом и Google Таблицей', reason: d[0], hint: d[1] }); draw(null);
    });
  function diagText() {
    var L = ['Диагностика «ЗКО Онлайн-записи» ' + verTxt(), 'Время проверки: ' + new Date().toLocaleString('ru-RU'), ''];
    all.forEach(function (x, i) { L.push('Шаг ' + (i + 1) + ' из ' + N + ': ' + x.title + ' — ' + (x.ok ? 'ОК' : 'СБОЙ')); if (!x.ok) { L.push('  Причина: ' + x.reason); L.push('  Что сделать: ' + x.hint); } });
    var bad = all.filter(function (x) { return !x.ok; })[0]; L.push(''); L.push(bad ? 'Итог: найден сбой — «' + bad.title + '». Остановился на шаге ' + (all.indexOf(bad) + 1) + ' из ' + N + '.' : 'Итог: всё в порядке.');
    return L.join('\n');
  }
  function draw(j) {
    var bad = all.some(function (x) { return !x.ok; }), b = siteBase();
    var h = '<div class="card"><b>' + (bad ? '⚠️ Есть что исправить' : '✅ Всё работает') + '</b> <span class="muted small">· ' + esc(verTxt()) + '</span>' + all.map(function (x, i) { return '<div class="dstep"><div>' + (x.ok ? '✅' : '❌') + ' <b>Шаг ' + (i + 1) + ' из ' + N + ':</b> ' + esc(x.title) + '</div>' + (x.ok ? '' : '<div class="err small">Причина: ' + esc(x.reason) + '<br>Что сделать: ' + esc(x.hint) + '</div>') + '</div>'; }).join('') + '</div>';
    if (j) {
      var st = j.stats || {}, v = st.visitor || { today: 0, month: 0, devices: 0 }, ms = st.master || { today: 0, month: 0, devices: 0 }, c = j.counts || {};
      h += '<div class="card"><b>📊 Счётчики</b><div class="row"><span>Мастеров</span><b>' + (c.masters || 0) + '</b></div><div class="row"><span>Записей всего / на сегодня</span><b>' + (c.bookings || 0) + ' / ' + (c.today || 0) + '</b></div><div class="row"><span>Посетители: сегодня / месяц / всего</span><b>' + v.today + ' / ' + v.month + ' / ' + v.devices + '</b></div><div class="row"><span>Мастера: сегодня / месяц / всего</span><b>' + ms.today + ' / ' + ms.month + ' / ' + ms.devices + '</b></div><div class="row"><span>Постоянный пароль владельца</span><b>' + (j.passSet ? 'задан' : 'не задан') + '</b></div><p class="muted small">Визиты владельца не учитываются.</p></div>';
    }
    h += '<div class="card"><b>🔗 Ссылки (адрес берётся из браузера)</b>' + copyRow('Витрина', b) + copyRow('Шаблон ссылки мастера', b + '?m=ИМЯ_МАСТЕРА') + copyRow('Мост Картотеки по карточке', b + '?card=НОМЕР_КАРТОЧКИ') + copyRow('Мост Картотеки по телефону', b + '?tel=ТЕЛЕФОН') + '</div>';
    h += '<button class="btn" id="oCp">📋 Скопировать диагностику</button><button class="btn sec" id="oRe">🔄 Проверить снова</button>';
    var bd = $('#admBody'); if (!bd) return; bd.innerHTML = h;
    $$('[data-cp]', bd).forEach(function (x) { x.onclick = function () { copyText(x.getAttribute('data-cp'), 'Скопировано'); }; });
    $('#oCp').onclick = function () { copyText(diagText(), 'Диагностика скопирована'); };
    $('#oRe').onclick = function () { admOpen('sum'); };
  }
}
function admMasters() {
  var L = [], q = '';
  admCall('ownerMasters').then(function (j) { L = j.masters; draw(); }).catch(function (e) { admFail(e, admMasters); });
  var LV = [['free', '🆓 Бесплатный — 1 акция'], ['light', '💎 VIP Light — 2 акции'], ['premium', '👑 VIP Premium — 3 акции']];
  function draw() {
    var f = L.filter(function (m) { var t = (m.name + ' ' + m.slug + ' ' + m.phone).toLowerCase(); return !q || t.indexOf(q) >= 0; });
    var b = $('#admBody'); if (!b) return;
    b.innerHTML = '<input id="msQ" type="search" placeholder="🔎 Поиск: имя, ссылка или телефон" value="' + esc(q) + '"><p class="muted small">Мастеров: ' + f.length + ' из ' + L.length + '</p>' + (f.length ? f.map(function (m) {
      return '<div class="card" data-p="' + esc(m.phone) + '"><b>' + esc(m.name) + '</b> ' + tierBadge(m.level) + (m.status === 'blocked' ? ' <span class="badge red">заблокирован</span>' : ' <span class="badge ok">активен</span>') + '<div class="muted small">' + esc(m.slug) + ' · +' + esc(m.phone) + (m.until && m.level === 'premium' ? ' · до ' + dmy(m.until) : '') + (m.level === 'light' ? ' · баланс ' + money(m.balance) : '') + '</div><div class="lvrow">' + LV.map(function (x) { return '<button type="button" class="btn sm ' + (m.level === x[0] ? '' : 'sec') + '" data-lv="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div><button type="button" class="btn sm ' + (m.status === 'blocked' ? 'ok' : 'red') + '" data-bl="1">' + (m.status === 'blocked' ? '✅ Разблокировать' : '🚫 Заблокировать') + '</button></div>';
    }).join('') : '<div class="card muted center">Никого не найдено.</div>');
    var qi = $('#msQ'); qi.oninput = function () { q = qi.value.trim().toLowerCase(); var pos = qi.selectionStart; draw(); var n = $('#msQ'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} };
    $$('[data-lv]', b).forEach(function (x) { x.onclick = function () { var ph = x.closest('[data-p]').getAttribute('data-p'); admCall('ownerTariff', { phone: ph, level: x.getAttribute('data-lv') }).then(function (r) { upd(r.master); toast(r.note); }).catch(function (e) { toast(errText(e)); }); }; });
    $$('[data-bl]', b).forEach(function (x) { x.onclick = function () { var ph = x.closest('[data-p]').getAttribute('data-p'); admCall('ownerBlock', { phone: ph }).then(function (r) { upd(r.master); toast(r.master.status === 'blocked' ? 'Мастер заблокирован' : 'Мастер разблокирован'); }).catch(function (e) { toast(errText(e)); }); }; });
  }
  function upd(m) { L = L.map(function (x) { return x.phone === m.phone ? m : x; }); draw(); }
}
function admBookings() {
  var F = ['today', 'up', 'all'], FN = { today: 'Сегодня', up: 'Предстоящие', all: 'Все' }, cur = 'today';
  function load() {
    var b = $('#admBody'); if (!b) return;
    b.innerHTML = '<div class="chips">' + F.map(function (k) { return '<button type="button" class="chip' + (k === cur ? ' on' : '') + '" data-f="' + k + '">' + FN[k] + '</button>'; }).join('') + '</div><div id="bkL"><p class="muted center">Загрузка…</p></div>';
    $$('[data-f]', b).forEach(function (x) { x.onclick = function () { cur = x.getAttribute('data-f'); load(); }; });
    var stl = { booked: 'записан', done: 'состоялся', cancelled: 'отменён', noshow: 'неявка' };
    admCall('ownerBookings', { filter: cur }).then(function (j) { var l = $('#bkL'); if (!l) return; l.innerHTML = '<p class="muted small">Записей: ' + j.total + (j.total > j.bookings.length ? ' (показаны первые ' + j.bookings.length + ')' : '') + '</p>' + (j.bookings.length ? j.bookings.map(function (x) { return '<div class="card"><b>' + dmy(x.date) + ' ' + esc(x.start) + '</b> · ' + esc(x.master) + ' <span class="badge">' + (stl[x.status] || esc(x.status)) + '</span><br>👤 ' + esc(x.client) + ' (+' + esc(x.phone) + ')<br><span class="muted small">' + esc(x.services) + ' · ' + money(x.total) + '</span></div>'; }).join('') : '<div class="card muted center">Записей нет.</div>'); }).catch(function (e) { admFail(e, load); });
  }
  load();
}
function admReviews() {
  function load() {
    admCall('ownerReviews').then(function (j) {
      var b = $('#admBody'); if (!b) return;
      b.innerHTML = j.reviews.length ? j.reviews.map(function (r) { return '<div class="card"><b>' + esc(r.master) + '</b> ' + stars(r.stars) + '<p>' + esc(r.comment || '(без текста)') + '</p><button type="button" class="btn red sm" data-d="' + esc(r.id) + '">🗑 Удалить отзыв</button></div>'; }).join('') : '<div class="card muted center">Отзывов пока нет.</div>';
      $$('[data-d]', b).forEach(function (x) { x.onclick = function () { if (!confirm('Удалить отзыв навсегда?')) return; admCall('ownerReviewDelete', { id: x.getAttribute('data-d') }).then(function () { toast('Отзыв удалён'); load(); }).catch(function (e) { toast(errText(e)); }); }; });
    }).catch(function (e) { admFail(e, load); });
  }
  load();
}
function admAds() {
  admCall('adsGet').then(function (cur) {
    var b = $('#admBody'); if (!b) return;
    var C = [['clients', '👥 Для клиентов и посетителей', 'Покажется на главной витрине и в «Мои записи». Мастеру, вошедшему в кабинет, не мешает.'], ['masters', '✂️ Для мастеров и специалистов', 'Покажется только в кабинете мастера и на экране входа мастера.']];
    b.innerHTML = '<p class="muted small">Объявление показывается на сайте сверху один раз ровно на 1 минуту (можно закрыть крестиком или свайпом) и больше не повторяется — до нового объявления.</p>' + C.map(function (c) {
      var x = cur[c[0]]; return '<div class="card"><b>' + c[1] + '</b><p class="muted small">' + c[2] + '</p>' + (x ? '<p class="muted small">Сейчас опубликовано (' + esc(String(x.ts).slice(0, 16)) + '): «' + esc(x.text) + '»</p>' : '') + '<textarea data-t="' + c[0] + '" rows="3" maxlength="300" placeholder="Текст объявления (до 300 знаков)"></textarea><button type="button" class="btn" data-pub="' + c[0] + '">📢 Опубликовать объявление</button></div>';
    }).join('');
    $$('[data-pub]', b).forEach(function (x) { x.onclick = function () { var k = x.getAttribute('data-pub'), t = $('[data-t="' + k + '"]', b); admCall('ownerAdPublish', { aud: k, text: t.value }).then(function () { toast('Объявление опубликовано'); admAds(); }).catch(function (e) { toast(errText(e)); }); }; });
  }).catch(function (e) { admFail(e, admAds); });
}
function admBans() {
  function load() {
    admCall('ownerBans').then(function (j) {
      var b = $('#admBody'); if (!b) return;
      b.innerHTML = j.bans.length ? j.bans.map(function (x) { return '<div class="card"><b>+' + esc(x.phone) + '</b><div class="muted small">' + esc(x.reason || 'без причины') + (x.until ? ' · до ' + dmy(x.until) : '') + '</div><button type="button" class="btn sec sm" data-u="' + esc(x.phone) + '">♻️ Разблокировать</button></div>'; }).join('') : '<div class="card muted center">Заблокированных нет.</div>';
      $$('[data-u]', b).forEach(function (x) { x.onclick = function () { admCall('ownerUnban', { phone: x.getAttribute('data-u') }).then(function () { toast('Бан снят'); load(); }).catch(function (e) { toast(errText(e)); }); }; });
    }).catch(function (e) { admFail(e, load); });
  }
  load();
}
function ownerPage() {
  navShow(false);
  if (!OWN.token) { admClear(); home(); ownerGate(); return; }
  admBuild(); admOpen(ADM.sec || 'sum');
}

/* ---------- маршрутизация ---------- */
function route() {
  if (DEMO && (location.hash || '#/') === '#/') return demoHome();
  var q = new URLSearchParams(location.search), h = location.hash || '#/';
  if (h !== '#/owner') admClear();
  if (h === '#/more') return morePage();
  if (h === '#/my') return myPage();
  if (h === '#/cab') return cabEntry();
  if (h === '#/owner') return ownerPage();
  if (h.indexOf('#/help') === 0) return helpPage(h.indexOf('/ms') > 0 ? 'ms' : 'cl');
  /* мост с Картотекой: ?m=<имя-ссылка мастера> или ?tel=<телефон мастера из карточки>, по желанию &u=<номера услуг через запятую> */
  var m = (q.get('m') || '').toLowerCase(), tel = (q.get('tel') || q.get('phone') || q.get('t') || '').replace(/[^\d+]/g, '');
  var pre = (q.get('u') || '').split(',').map(function (x) { return x.replace(/[^A-Za-z0-9]/g, ''); }).filter(Boolean).slice(0, 10);
  var card = (q.get('card') || '').trim();
  if (!/^[A-Za-z0-9а-яА-ЯёЁ_@.\-]{2,40}$/.test(card)) card = '';
  var telOk = tel && /^\+?\d{10,12}$/.test(tel) ? tel : '';
  if (m && /^[a-z0-9_]{3,30}$/.test(m)) return masterPage(m, telOk, pre, card);
  if (card) return masterPage('', telOk, pre, card);   /* ?card=<ID карточки из Картотеки>; телефон — запасной путь */
  if (tel && /^\+?\d{10,12}$/.test(tel)) return masterPage('', tel, pre);
  home(); whatsNew(false);
}
function init() {
  var th = ls('zk_theme'); if (th) document.documentElement.setAttribute('data-theme', th);
  document.getElementById('themeBtn').onclick = function () { var cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'), nx = cur === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', nx); ls('zk_theme', nx); };
  TOKEN = ls('zk_token') || '';
  window.addEventListener('hashchange', route);
  fetch('config.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).catch(function () { return {}; }).then(function (c) {
    CFG = normCfg(c || {}); VERSION = String(CFG.version || '').trim(); paintVer(); navPaint();
    if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('service-worker.js').catch(function () {});
    route(); ping('visitor');
    try { if ((window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone) ping('pwa'); } catch (e) {}
  });
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); DEFERRED = e; });
  window.addEventListener('appinstalled', function () { ping('pwa'); });
  var nv = document.getElementById('nav');
  if (nv) Array.prototype.forEach.call(nv.querySelectorAll('button'), function (b) { b.onclick = function () { var n = b.getAttribute('data-n'); if (n === 'home') { if (DEMO) { TOKEN = ''; navGo('#/'); demoHome(); } else navGo('#/'); } else if (n === 'mid') navGo(b.getAttribute('data-r') === 'cab' ? '#/cab' : '#/my'); else navGo('#/more'); }; });
  navPaint();
  var ver = document.getElementById('ver');   // вход владельца: удержание плашки с номером версии ровно 2 секунды → окно ввода кода
  if (ver) { ver.textContent = verTxt(); ver.classList.add('verchip'); ownerHoldBind(ver); }
  APP.addEventListener('click', function (e) { var hb = e.target.closest && e.target.closest('[data-help]'); if (hb) helpOpen(hb.getAttribute('data-help')); });
}
init();
})();
