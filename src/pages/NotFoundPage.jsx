import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <>
      <h1 className="h3 mb-3">Страница не найдена</h1>
      <p>
        Такого адреса нет. <Link to="/">Перейти к подбору автозапчастей</Link>
      </p>
    </>
  );
}
