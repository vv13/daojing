import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import RouteFallback from './components/RouteFallback';
import { daodejingReaderPath } from './scriptures/catalog';
import './App.css';

const ScriptureCatalogPage = lazy(() => import('./pages/ScriptureCatalogPage'));
const ScriptureReaderPage = lazy(() => import('./pages/ScriptureReaderPage'));

function HomeRoute() {
  const [searchParams] = useSearchParams();
  const chapter = searchParams.get('chapter');
  if (chapter != null && chapter !== '') {
    return (
      <Navigate
        to={`${daodejingReaderPath}?chapter=${encodeURIComponent(chapter)}`}
        replace
      />
    );
  }
  return <Navigate to="/jing" replace />;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/jing" element={<ScriptureCatalogPage />} />
        <Route path="/jing/:bookSlug" element={<ScriptureReaderPage />} />
        <Route path="*" element={<Navigate to="/jing" replace />} />
      </Routes>
    </Suspense>
  );
}
