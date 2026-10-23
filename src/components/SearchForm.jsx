import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchBrands, selectBusy } from '../partsSlice.js';

export default function SearchForm() {
  const dispatch = useDispatch();
  const busy = useSelector(selectBusy);
  const [value, setValue] = useState('');
  const number = value.trim();
  const canSearch = number !== '' && !busy;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSearch) dispatch(searchBrands(number));
  };

  return (
    <form className="mb-4" onSubmit={handleSubmit}>
      <label htmlFor="part-number" className="form-label">
        Артикул детали
      </label>
      <div className="input-group">
        <input
          id="part-number"
          className="form-control"
          placeholder="Например, 0189 или OC90"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!canSearch}>
          Найти
        </button>
      </div>
    </form>
  );
}
