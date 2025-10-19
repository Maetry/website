# Локализованные изображения

Система для автоматического отображения изображений в зависимости от текущей локали.

## Как это работает

1. Добавьте русские версии изображений с суффиксом `_ru` в папку `public/images/`
2. Используйте утилиты или хуки для получения правильного изображения

## Примеры файлов

```
public/images/
├── logo.svg          # Английская версия (по умолчанию)
├── logo_ru.svg       # Русская версия
├── banner.svg        # Английская версия
└── banner_ru.svg     # Русская версия
```

## Использование

### Вариант 1: Утилита

```typescript
import { getLocalizedImagePath } from '@/shared/utils';
import logo from '@/public/images/logo.svg';

const MyComponent = () => {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  return (
    <Image
      src={getLocalizedImagePath(logo, locale)}
      alt="Logo"
    />
  );
};
```

### Вариант 2: Хук (рекомендуется)

```typescript
import { useLocalizedImage } from '@/shared/hooks';
import logo from '@/public/images/logo.svg';

const MyComponent = () => {
  const localizedLogo = useLocalizedImage(logo);

  return (
    <Image
      src={localizedLogo}
      alt="Logo"
    />
  );
};
```

## Поддерживаемые локали

- `en` - английский (использует базовые изображения)
- `ru` - русский (использует изображения с суффиксом `_ru`)

## Правила именования

- Базовое изображение: `image.svg`
- Русская версия: `image_ru.svg`
- Расширение файла должно быть одинаковым
