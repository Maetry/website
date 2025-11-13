# Maetry Website

Лендинг и сервис коротких приглашений Maetry. Проект построен на Next.js 15 и Tailwind CSS, используется механизм локализации `next-intl`.

## Быстрый старт

```bash
npm install
npm run dev
```

Локальный сервер доступен по `http://localhost:3000`.

## Короткие ссылки (`link.maetry.com`)

- Все запросы на домен `link.maetry.com` переписываются в Next.js на пространство `/link/:linkId`.
- Страница `app/link/[linkId]/page.tsx` выполняет SSR-запрос в Vapor API, рендерит приглашение и инициирует сбор fingerprint.
- Fingerprint отправляется на прокси-роут `/api/fingerprint/:linkId`, который пересылает данные в Vapor API.

### Переменные окружения

| Имя | Описание |
| --- | --- |
| `SHORTLINK_API_URL` | Базовый URL Vapor API для коротких ссылок (без завершающего `/`). |
| `NEXT_PUBLIC_SHORTLINK_API_URL` | Публичный адрес (опционально, используется как fallback). |
| `NEXT_PUBLIC_SHORTLINK_HOST` | Хост домена коротких ссылок. По умолчанию `link.maetry.com`. |

## Полезные ссылки

- Основной домен: [https://maetry.com](https://maetry.com)
- Короткие ссылки: [https://link.maetry.com](https://link.maetry.com)

