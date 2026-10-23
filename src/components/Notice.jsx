// variant — цвет Bootstrap-alert: danger (ошибка), warning (ничего не найдено), info
export default function Notice({ variant = 'info', children }) {
  return (
    <div className={`alert alert-${variant}`} role="alert">
      {children}
    </div>
  );
}
