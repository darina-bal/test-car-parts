const API_URL = 'https://api.favorit-parts.ru/hs/hsprice/';
// Демо-ключ из документации API; свой ключ задаётся в .env.local (VITE_API_KEY)
const API_KEY = import.meta.env.VITE_API_KEY || '00000000-0000-0000-0000-000000000001';
const TIMEOUT_MS = 20000;

// Тексты ошибок сервиса → сообщения для пользователя
const API_ERRORS = {
  'Empty key!': 'Не указан ключ API',
  'Invalid key client!': 'Неверный ключ API',
  'Invalid access key': 'Неверный ключ API',
  'Empty number goods!': 'Введите артикул детали',
  'Request quota exceeded!': 'Превышен лимит запросов по грузовому ассортименту',
};

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// GET-запрос к сервису: возвращает массив goods или бросает Error с понятным текстом
async function request(params) {
  // encodeURIComponent: документация требует экранировать спецсимволы (#, & и т. п.)
  const query = Object.entries({ key: API_KEY, ...params })
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('&');

  let res;
  let text;
  try {
    res = await fetch(`${API_URL}?${query}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    text = await res.text();
  } catch (err) {
    throw new Error(
      err.name === 'TimeoutError'
        ? 'Сервер не отвечает. Попробуйте позже.'
        : 'Не удалось связаться с сервером. Проверьте подключение к сети.',
    );
  }

  // Ошибки сервис возвращает как {"error": ...}, обычно с HTTP 200
  const data = parseJson(text);
  if (data?.error) {
    throw new Error([].concat(data.error).map((e) => API_ERRORS[e] ?? e).join('. '));
  }
  if (!res.ok) {
    throw new Error(`Сервис временно недоступен (код ${res.status})`);
  }
  if (!Array.isArray(data?.goods)) {
    throw new Error('Сервис вернул некорректный ответ');
  }
  return data.goods;
}

// Для ненайденной детали сервис возвращает один «пустой» элемент (brand и number пустые)
const isFound = (item) => Boolean(item.brand || item.number);

// Этап 1: производители детали с таким артикулом → [{ brand, name, number }]
export async function getBrands(number) {
  const goods = await request({ number });
  const brands = new Map();
  for (const item of goods.filter(isFound)) {
    if (!brands.has(item.brand)) {
      brands.set(item.brand, { brand: item.brand, name: item.name, number: item.number });
    }
  }
  return [...brands.values()];
}

function toOffer(item, isRequested) {
  // Верхнеуровневое price не используем (так сказано в документации): цена зависит от склада.
  // Берём минимальную среди складов, где товар есть в наличии.
  const prices = (item.warehouses ?? []).filter((w) => w.stock > 0).map((w) => w.price);
  return {
    id: item.goodsID,
    brand: item.brand,
    number: item.number,
    name: item.name,
    price: prices.length ? Math.min(...prices) : null,
    stock: item.count,
    isRequested,
  };
}

// Сначала позиции в наличии (есть цена), затем по возрастанию цены
const byAvailabilityThenPrice = (a, b) =>
  Number(b.price !== null) - Number(a.price !== null) || a.price - b.price;

// Этап 2: искомая позиция и её аналоги →
// [{ id, brand, number, name, price, stock, isRequested }]
export async function getOffers(number, brand) {
  const goods = (await request({ number, brand, analogues: 'on' })).filter(isFound);
  const requested = goods.map((item) => toOffer(item, true));
  const analogs = goods
    .flatMap((item) => item.analogues ?? [])
    .filter(isFound)
    .map((item) => toOffer(item, false))
    .sort(byAvailabilityThenPrice);
  return [...requested, ...analogs];
}
