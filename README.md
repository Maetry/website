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

`API_TARGET` из скриптов определяет API-окружение для локального запуска. Файл `.env.local` не коммитится в git (указан в `.gitignore`).

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
| `API_TARGET` | Явный переключатель среды API: `local`, `stage`, `production`. Используется для локального запуска и любых явных override. |
| `NEXT_PUBLIC_SHORTLINK_HOST` | Хост домена коротких ссылок. По умолчанию `link.maetry.com`. |

**Окружения:**
- **Production**: `https://api-app-601862402938.us-west2.run.app`
- **Staging**: `https://api-dev-601862402938.us-west2.run.app`
- **Local**: `http://localhost:8080`

### Автовыбор API по окружению

- Явный `API_TARGET` всегда имеет высший приоритет.
- Production deployment (`VERCEL_ENV=production` или `next start` в production) всегда идёт в **production API**.
- Preview deployment на Vercel по умолчанию идёт в **stage API**.
- Локальный `next dev` без явного `API_TARGET` по умолчанию идёт в **local API**.
- Переменная `API_URL` больше не используется.

### Рекомендуемая схема

1. Скопируй `.env.example` в `.env.local`, если нужны локальные override'ы для Sentry или shortlink host.
2. Используй `npm run dev`, `npm run dev:stage` и `npm run dev:prod` для стандартных API-режимов.
3. Не переопределяй production deployment через env-переменные API: production deploy принудительно идёт в production API.

## Полезные ссылки

- Основной домен: [https://maetry.com](https://maetry.com)
- Короткие ссылки: [https://link.maetry.com](https://link.maetry.com)
