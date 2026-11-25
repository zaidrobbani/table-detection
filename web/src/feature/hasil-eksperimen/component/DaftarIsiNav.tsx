import { DAFTAR_ISI } from "../data";

/** Daftar isi anchor; sticky di desktop, baris tautan di mobile. */
const DaftarIsiNav = () => (
  <nav aria-label="Daftar isi halaman hasil" className="lg:sticky lg:top-20">
    <p className="label-caps mb-2">Daftar isi</p>
    <ol className="flex flex-wrap gap-x-4 gap-y-1 lg:flex-col lg:gap-y-0.5">
      {DAFTAR_ISI.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="inline-flex items-baseline gap-2 py-1 text-ink-muted text-sm transition-colors hover:text-brand"
          >
            <span className="tabular text-xs">
              {String(i + 1).padStart(2, "0")}
            </span>
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

export default DaftarIsiNav;
