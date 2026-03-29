import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SCRIPTURE_CATALOG, scripturePath } from '../scriptures/catalog';

export default function ScriptureCatalogPage() {
  useEffect(() => {
    document.title = '经 · 藏书';
  }, []);

  return (
    <div className="min-h-screen max-w-[800px] mx-auto p-5">
      <header className="text-center pt-2 pb-8">
        <h1 className="text-[2rem] text-(--primary) font-bold tracking-[0.35em] mb-2">经</h1>
        <p className="text-[1.05rem] text-(--text-secondary) font-['Kaiti','STKaiti',serif] m-0">
          典籍陈列，择一卷而入
        </p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
        {SCRIPTURE_CATALOG.map((book) => {
          const inner = (
            <>
              <h2 className="mt-0 mb-1.5 text-[1.25rem] text-(--primary) font-semibold tracking-wide">
                {book.title}
              </h2>
              <p className="m-0 mb-2 text-[0.88rem] text-(--text-secondary)">{book.authorLine}</p>
              <p className="m-0 text-[0.82rem] text-(--text-light) leading-relaxed">{book.tagline}</p>
              {!book.available ? (
                <span className="mt-3 inline-block text-[0.75rem] text-(--text-light) px-2 py-0.5 rounded-md border border-(--border) bg-(--accent-light)">
                  即将上架
                </span>
              ) : null}
            </>
          );

          if (book.available) {
            return (
              <Link
                key={book.slug}
                to={scripturePath(book.slug)}
                className="block rounded-xl p-6 shadow-[0_2px_8px_var(--shadow)] border border-(--border) bg-(--card-bg) transition-[translate,box-shadow,border-color] duration-200 ease-in-out touch-manipulation active:scale-[0.99] hover:-translate-y-1 hover:shadow-[0_8px_20px_var(--shadow)] hover:border-(--accent) no-underline text-inherit"
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={book.slug}
              className="rounded-xl p-6 shadow-[0_2px_8px_var(--shadow)] border border-(--border) bg-(--card-bg) opacity-75 cursor-not-allowed"
              aria-disabled
            >
              {inner}
            </div>
          );
        })}
      </div>

      <p className="mt-10 mb-6 text-center text-[0.8rem] text-(--text-light)">
        更多经典将陆续收录于此。
      </p>
    </div>
  );
}
