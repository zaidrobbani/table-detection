import { SITE } from "@/shared/constant/routes";

const SiteFooter = () => (
  <footer className="mt-16 border-rule border-t bg-paper-sunken">
    <div className="page-container grid gap-8 py-8 text-sm sm:grid-cols-2 lg:grid-cols-3">
      <div>
        <p className="label-caps mb-2">Kelompok</p>
        <p className="font-heading font-semibold text-base">{SITE.group}</p>
        <p className="mt-1 text-ink-muted">
          Anggota: {SITE.members.join(", ")}
        </p>
      </div>
      <div>
        <p className="label-caps mb-2">Mata kuliah</p>
        <p className="text-ink">{SITE.course}</p>
        <p className="mt-1 text-ink-muted">
          {SITE.institution} · {SITE.year}
        </p>
      </div>
      <div className="sm:col-span-2 lg:col-span-1">
        <p className="label-caps mb-2">Referensi</p>
        <ul className="flex flex-col gap-1.5">
          {SITE.references.map((ref) => (
            <li key={ref.label} className="text-ink-muted">
              {ref.href ? (
                <a
                  href={ref.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-brand"
                >
                  {ref.label}
                </a>
              ) : (
                <span className="text-ink">{ref.label}</span>
              )}
              <span className="tabular ml-2 text-xs">{ref.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
