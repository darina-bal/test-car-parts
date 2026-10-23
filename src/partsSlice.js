import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getBrands, getOffers } from './api.js';

// status: 'idle' | 'loading' | 'succeeded' | 'failed'
const idle = { status: 'idle', items: [], error: null };

const initialState = {
  query: '', // артикул, по которому выполнен последний поиск брендов
  brands: idle, // этап 1: [{ brand, name, number }]
  selectedBrand: null,
  offers: idle, // этап 2: [{ id, brand, number, name, price, stock, isRequested }]
};

export const searchBrands = createAsyncThunk('parts/searchBrands', (number) => getBrands(number));

// Артикул берём из state (по нему реально искали), а не из поля ввода, которое могли успеть изменить
export const loadOffers = createAsyncThunk('parts/loadOffers', (brand, { getState }) =>
  getOffers(getState().parts.query, brand),
);

const partsSlice = createSlice({
  name: 'parts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Новый поиск сбрасывает этап 2: выбранный бренд и таблицу
      .addCase(searchBrands.pending, (state, action) => {
        state.query = action.meta.arg;
        state.brands = { status: 'loading', items: [], error: null };
        state.selectedBrand = null;
        state.offers = idle;
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        state.brands = { status: 'succeeded', items: action.payload, error: null };
      })
      .addCase(searchBrands.rejected, (state, action) => {
        state.brands = { status: 'failed', items: [], error: action.error.message };
      })
      .addCase(loadOffers.pending, (state, action) => {
        state.selectedBrand = action.meta.arg;
        state.offers = { status: 'loading', items: [], error: null };
      })
      .addCase(loadOffers.fulfilled, (state, action) => {
        state.offers = { status: 'succeeded', items: action.payload, error: null };
      })
      .addCase(loadOffers.rejected, (state, action) => {
        state.offers = { status: 'failed', items: [], error: action.error.message };
      });
  },
});

// Идёт любой запрос. UI блокирует кнопки на это время, поэтому запросы не пересекаются
// и устаревшие ответы отсекать не нужно
export const selectBusy = (state) =>
  state.parts.brands.status === 'loading' || state.parts.offers.status === 'loading';

export default partsSlice.reducer;
