import BrandList from './components/BrandList.jsx';
import SearchForm from './components/SearchForm.jsx';

export default function App() {
  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Подбор автозапчастей и аналогов</h1>
      <SearchForm />
      <BrandList />
    </div>
  );
}
