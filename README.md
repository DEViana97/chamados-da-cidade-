# CityDesk — Gestão de Chamados Urbanos

Dashboard SaaS para prefeituras e empresas de facilities. Monitore, filtre e responda ocorrências reportadas por cidadãos (buracos, iluminação, lixo, etc.).

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router, Server Components) |
| Linguagem | TypeScript strict |
| Estilos | Tailwind CSS v4 (design system via CSS vars) |
| Banco | PostgreSQL — Neon Serverless |
| ORM | Prisma v7 + `@prisma/adapter-pg` |
| Auth | NextAuth v5 (Google OAuth + Credentials) |
| Estado | Tanstack Query v5 |
| Gráficos | Recharts |
| Mapa | Leaflet + React-Leaflet (dynamic import) |
| Forms | React Hook Form + Zod v4 |
| Toasts | Sonner |

---

## Decisões técnicas

### App Router + Server Components por padrão
Dados buscados no servidor onde possível (menos JS no cliente). `"use client"` apenas onde necessário: eventos, hooks, Leaflet.

### Tanstack Query em vez de só Server Actions
Server Components buscam dados iniciais. Client components usam TQ para refetch otimista, cache com `staleTime`, invalidação granular após mutações. Server Actions sozinhos não oferecem cache de lado cliente.

### Leaflet com `dynamic()` e `ssr: false`
Leaflet depende de `window` e `document`. Import direto quebra o build. Dynamic import com `ssr: false` isola o problema sem hacks de `typeof window`.

### Prisma v7 com adapter
Prisma v7 removeu URLs do schema — passadas via `PrismaPg` adapter no construtor. Permite conexões pool-aware sem configuração duplicada.

### Zod v4 nas fronteiras
Todos os inputs externos (forms, URL params, body de API routes) validados com Zod. Nunca confiamos em dados do cliente diretamente.

---

## Setup local

### 1. Clone e instale
```bash
git clone https://github.com/your-username/citydesk
cd citydesk
npm install
```

### 2. Banco Neon
1. Crie um projeto em [neon.tech](https://neon.tech) (free tier)
2. Copie a connection string

### 3. Variáveis de ambiente
Crie `.env.local`:
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Banco e seed
```bash
npm run db:push    # aplica o schema
npm run db:seed    # 55 ocorrências em Fortaleza
```

### 5. Dev server
```bash
npm run dev
```

**Credenciais do seed:**
- Admin: `admin@citydesk.com` / `admin123!`
- Analyst: `analyst@citydesk.com` / `analyst123!`

---

## Schema

```
User ─┬─ Occurrence ─┬─ Comment
      │              └─ StatusHistory
      ├─ Account (OAuth)
      └─ Session
```

```prisma
User        { id, name, email, password, role: ADMIN|ANALYST }
Occurrence  { id, title, category: POTHOLE|GARBAGE|LIGHTING|OTHER, status: OPEN|IN_PROGRESS|RESOLVED, lat, lng }
StatusHistory { from, to, changedAt }
Comment     { content, authorId, occurrenceId }
```

---

## Próximos passos

- **WebSockets** para atualizações em tempo real no mapa
- **Testes E2E** com Playwright
- **i18n** com `next-intl`
- **Upload de fotos** via Supabase Storage / R2
- **Rate limiting** com Upstash Redis
- **PWA** para uso offline por equipes de campo
