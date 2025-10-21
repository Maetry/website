# Система локализации Maetry

Упорядоченная система для работы с локализованным контентом.

## Структура

```
src/shared/localization/
├── types/           # Типы для локализации
├── utils/           # Утилиты для работы с изображениями
├── hooks/           # React хуки
└── README.md        # Документация
```

## Использование

### Локализованные изображения

#### Через компонент LocalizedImage (рекомендуется):
```tsx
import { LocalizedImage } from '@/shared/localization'

const MyComponent = () => {
  return (
    <LocalizedImage
      baseImage="/images/logo.svg"
      alt="Logo"
      width={200}
      height={50}
    />
  )
}
```

#### Через хук (для кастомных случаев):
```tsx
import { useLocalizedImage } from '@/shared/localization'
import logo from '@/public/images/logo.svg'

const MyComponent = () => {
  const localizedLogo = useLocalizedImage(logo)
  
  return <img src={localizedLogo} alt="Logo" />
}
```

### Локализованный текст

Используйте `next-intl` для текстов:

```tsx
import { useTranslations } from 'next-intl'

const MyComponent = () => {
  const t = useTranslations('section')
  
  return <h1>{t('title')}</h1>
}
```

## Правила именования файлов

### Изображения:
- Базовое: `logo.svg`
- Русская версия: `logo_ru.svg`
- Испанская версия: `logo_es.svg`

## Поддерживаемые локали

- `en` - английский (по умолчанию)
- `ru` - русский
- `es` - испанский

## Что было исправлено

1. ✅ **Убрана дублированная логика** - теперь используется единый хук `useLocalizedImage`
2. ✅ **Упрощены компоненты** - убраны ручные проверки локали
3. ✅ **Организована структура** - все утилиты локализации в одной папке
4. ✅ **Сохранена совместимость** - старые импорты продолжают работать

## Примеры использования

### Простое изображение:
```tsx
import { LocalizedImage } from '@/shared/localization'

return (
  <LocalizedImage
    baseImage="/images/hero.svg"
    alt="Hero"
    width={800}
    height={600}
  />
)
```

### Компонент с темой и локализацией:
```tsx
import { LocalizedImage } from '@/shared/localization'
import { useAppSelector } from '@/lib/hooks'

const MyComponent = () => {
  const isDark = useAppSelector((state) => state.theme.blackTheme)
  
  return (
    <LocalizedImage
      baseImage={isDark ? "/images/dark-hero.svg" : "/images/light-hero.svg"}
      alt="Hero"
      width={800}
      height={600}
    />
  )
}
```
