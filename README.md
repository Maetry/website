# Maetry Website

Лендинг и сервис коротких приглашений Maetry. Проект построен на Next.js 15 и Tailwind CSS, используется механизм локализации `next-intl`.

## Быстрый старт

```bash
npm install

npm run dev
```

Локальный сервер доступен по `http://localhost:3000`.

Команды локального запуска:
- `npm run dev` → фронт локально, API на `http://localhost:8080`
- `npm run dev:stage` → фронт локально, API на `https://api-dev-601862402938.us-west2.run.app`

**Важно**: Явно переданные переменные окружения из npm-скрипта имеют приоритет над `.env.local`, поэтому `dev` и `dev:stage` работают предсказуемо даже если в `.env.local` уже задан `API_URL`. Файл `.env.local` не коммитится в git (указан в `.gitignore`).

## Короткие ссылки (`link.maetry.com`)

- Канонический публичный формат короткой ссылки: `https://link.maetry.com/{nanoId}`.
- `https://maetry.com/link/{nanoId}` также поддерживается как веб-маршрут на основном домене.
- Все запросы на домен `link.maetry.com` переписываются в Next.js на пространство `/{locale}/link/{nanoId}`.
- Страница `app/[locale]/link/[nanoId]/page.tsx` использует компонент `LinkHandler`, который запрашивает resolve через Website API и обрабатывает ссылку в зависимости от её типа.
- Website proxy для short-link flow обращается к Backend по контракту `/v1/clicks/{nanoId}` и `/v1/marketing/campaigns/by-link/{nanoId}`.

### Переменные окружения

Next.js автоматически загружает переменные окружения в следующем порядке приоритета:
- `npm run dev` → загружает `.env.local` и `.env.development`
- `npm run build` → загружает `.env.local` и `.env.production`
- `npm start` → загружает `.env.local` и `.env.production`

| Имя | Описание |
| --- | --- |
| `API_URL` | Базовый URL API (без завершающего `/`). Серверная переменная, используется для всех запросов (booking, shortlink, marketing). Имеет высший приоритет. |
| `API_TARGET` | Внутренний переключатель локального запуска. `local` → `http://localhost:8080`, любое другое значение → staging API. |
| `NEXT_PUBLIC_SHORTLINK_HOST` | Хост домена коротких ссылок. По умолчанию `link.maetry.com`. |

**Окружения:**
- **Production**: `https://api-app-601862402938.us-west2.run.app`
- **Staging**: `https://api-dev-601862402938.us-west2.run.app`
- **Local**: `http://localhost:8080`

## Полезные ссылки

- Основной домен: [https://maetry.com](https://maetry.com)
- Короткие ссылки: [https://link.maetry.com](https://link.maetry.com)
