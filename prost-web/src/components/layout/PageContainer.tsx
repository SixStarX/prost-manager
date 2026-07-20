import { Outlet } from 'react-router-dom';

/**
 * Container das páginas herdadas (sem equivalente no app antigo).
 * Reproduz a métrica do original — `container mx-auto px-4 py-6 max-w-6xl` —
 * centralizando por flex, não por `mx-auto`.
 */
export default function PageContainer() {
  return (
    <main className="flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <Outlet />
      </div>
    </main>
  );
}
