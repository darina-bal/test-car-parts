import { useDispatch, useSelector } from 'react-redux';
import { loadOffers, selectBusy } from '../partsSlice.js';
import Loader from './Loader.jsx';
import Notice from './Notice.jsx';

export default function BrandList() {
  const dispatch = useDispatch();
  const { query, brands, selectedBrand } = useSelector((state) => state.parts);
  const busy = useSelector(selectBusy);

  if (brands.status === 'idle') return null;
  if (brands.status === 'loading') return <Loader />;
  if (brands.status === 'failed') return <Notice variant="danger">{brands.error}</Notice>;
  if (brands.items.length === 0) {
    return (
      <Notice variant="warning">
        По артикулу «{query}» ничего не найдено. Проверьте номер и попробуйте снова.
      </Notice>
    );
  }

  return (
    <section className="mb-4">
      <h2 className="h5 mb-3">Выберите производителя детали «{query}»</h2>
      <div className="list-group">
        {brands.items.map(({ brand, name }) => {
          const isSelected = brand === selectedBrand;
          return (
            <button
              key={brand}
              type="button"
              className={`list-group-item list-group-item-action${isSelected ? ' active' : ''}`}
              aria-current={isSelected}
              disabled={busy}
              onClick={() => dispatch(loadOffers(brand))}
            >
              <span className="d-block fw-bold">{brand}</span>
              <span className="d-block small">{name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
