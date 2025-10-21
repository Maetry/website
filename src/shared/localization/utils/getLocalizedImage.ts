/**
 * Получает путь к локализованному изображению
 * @param basePath - базовый путь к изображению (например, "/images/logo.svg")
 * @param locale - текущая локаль (например, "ru" или "en")
 * @returns путь к локализованному изображению или базовому, если локализованная версия не найдена
 */
export const getLocalizedImage = (basePath: string, locale: string): string => {
  // Если локаль английская, возвращаем базовый путь
  if (locale === 'en') {
    return basePath;
  }

  // Для других локалей (например, ru) ищем версию с суффиксом
  const pathParts = basePath.split('.');
  if (pathParts.length >= 2) {
    const extension = pathParts.pop(); // получаем расширение файла
    const nameWithoutExtension = pathParts.join('.'); // получаем имя без расширения
    
    // Создаем путь с суффиксом локали
    const localizedPath = `${nameWithoutExtension}_${locale}.${extension}`;
    
    return localizedPath;
  }

  // Если не удалось разобрать путь, возвращаем базовый
  return basePath;
};

/**
 * Получает локализованное изображение для импорта
 * @param baseImage - базовое изображение (импортированное)
 * @param locale - текущая локаль
 * @returns путь к локализованному изображению
 */
export const getLocalizedImagePath = (baseImage: string | { src: string }, locale: string): string => {
  // Если это импортированное изображение Next.js, получаем его src
  const imageSrc = typeof baseImage === 'string' ? baseImage : baseImage.src || baseImage;
  
  if (typeof imageSrc !== 'string') {
    console.warn('getLocalizedImagePath: baseImage is not a string or valid image object');
    return typeof baseImage === 'string' ? baseImage : baseImage.src || '';
  }
  
  return getLocalizedImage(imageSrc, locale);
};
