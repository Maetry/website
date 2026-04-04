# Maetry Website

Лендинг и сервис коротких приглашений Maetry. Проект построен на Next.js 15 и Tailwind CSS, используется механизм локализации `next-intl`.

## Быстрый старт

```bash
npm install

npm run dev
```

Локальный сервер доступен по `http://localhost:3000`.

Команды локального запуска:
- `npm run dev` или `npm run dev:local` → фронт локально, API на `http://localhost:8080`
- `npm run dev:stage` → фронт локально, API на `https://api-dev-601862402938.us-west2.run.app`
- `npm run dev:prod` → фронт локально, API на `https://api-app-601862402938.us-west2.run.app`

`API_TARGET` из скриптов имеет приоритет над `.env.local`, поэтому `dev`, `dev:stage` и `dev:prod` работают предсказуемо даже если в `.env.local` уже задан `API_URL`. Файл `.env.local` не коммитится в git (указан в `.gitignore`).

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
| `API_URL` | Базовый URL API (без завершающего `/`). Используется, если `API_TARGET` не задан или не распознан (например на Vercel без префикса в `npm run dev`). |
| `API_TARGET` | Явный переключатель среды API: `local`, `stage`, `production`. Имеет приоритет над `API_URL`. |
| `NEXT_PUBLIC_SHORTLINK_HOST` | Хост домена коротких ссылок. По умолчанию `link.maetry.com`. |

**Окружения:**
- **Production**: `https://api-app-601862402938.us-west2.run.app`
- **Staging**: `https://api-dev-601862402938.us-west2.run.app`
- **Local**: `http://localhost:8080`

### Рекомендуемая схема

1. Скопируй `.env.example` в `.env.local`, если нужны локальные override'ы для Sentry или shortlink host.
2. Не задавай `API_URL` в `.env.local`, если используешь стандартные режимы `dev`, `dev:stage`, `dev:prod`.
3. Для нестандартного URL задай только `API_URL` и запускай `next dev` без префикса `API_TARGET=…` в команде (скрипты `npm run dev*` всегда выставляют `API_TARGET`).

## Полезные ссылки

- Основной домен: [https://maetry.com](https://maetry.com)
- Короткие ссылки: [https://link.maetry.com](https://link.maetry.com)
