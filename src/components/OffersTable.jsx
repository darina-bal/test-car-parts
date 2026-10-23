import { useSelector } from 'react-redux';
import Loader from './Loader.jsx';
import Notice from './Notice.jsx';
import './OffersTable.css';

// Валюта в документации API не указана; сервис российский — считаем рубли
const formatPrice = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format;
const formatQty = new Intl.NumberFormat('ru-RU').format;

export default function OffersTable() {
  const { selectedBrand, offers } = useSelector((state) => state.parts);

  if (offers.status === 'idle') return null;
  if (offers.status === 'loading') return <Loader />;
  if (offers.status === 'failed') return <Notice variant="danger">{offers.error}</Notice>;
  if (offers.items.length === 0) {
    return (
      <Notice variant="warning">
        Для бренда «{selectedBrand}» предложений и аналогов не найдено.
      </Notice>
    );
  }

  return (
    <section>
      <h2 className="h5">Аналоги и предложения</h2>
      <p className="text-body-secondary">Найдено позиций: {offers.items.length}</p>
      <div className="table-responsive">
        {/* Строки — CSS Grid, раскладка и адаптация под телефон в OffersTable.css */}
        <table className="table table-hover offers-table">
          <thead>
            <tr>
              <th scope="col">Название / Производитель</th>
              <th scope="col" className="text-end">
                Цена
              </th>
              <th scope="col" className="text-end">
                Остаток
              </th>
            </tr>
          </thead>
          <tbody>
            {offers.items.map((item) => (
              <tr key={item.id}>
                <td className="offers-name text-break">
                  <div>
                    {item.isRequested && <span className="badge text-bg-primary me-2">Искомая</span>}
                    {item.name}
                  </div>
                  <div className="small text-body-secondary">
                    {item.brand} · {item.number}
                  </div>
                </td>
                <td className="offers-price text-nowrap" data-label="Цена">
                  {item.price === null ? '—' : `от ${formatPrice(item.price)}`}
                </td>
                <td className="offers-stock text-nowrap" data-label="Остаток">
                  {item.stock > 0 ? (
                    `${formatQty(item.stock)} шт.`
                  ) : (
                    <span className="badge text-bg-secondary">Нет в наличии</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
