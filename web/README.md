# Meja Bersih (web)

Frontend Next.js 16 untuk demo deteksi kebersihan meja (Vercel, Root Directory = `web`).

```bash
bun install
cp .env.example .env.local   # atur NEXT_PUBLIC_BASE_API_URL
bun run dev                  # http://localhost:3000
bun run build:data           # bangun ulang data eksperimen dari scripts/source
bun run check && bun run typecheck && bun run build
```

Baca `AGENTS.md` dan `node_modules/next/dist/docs/` sebelum menulis kode: Next 16 dengan Cache Components.
