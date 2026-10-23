import BrandList from '../components/BrandList.jsx';
import OffersTable from '../components/OffersTable.jsx';
import SearchForm from '../components/SearchForm.jsx';

export default function HomePage() {
  return (
    <>
      <h1 className="h3 mb-4">Подбор автозапчастей и аналогов</h1>
      <SearchForm />
      <BrandList />
      <OffersTable />
    </>
  );
}
