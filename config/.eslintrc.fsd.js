// Дополнительные правила для Feature-Sliced Design
module.exports = {
  rules: {
    // Запрещаем импорты из верхних слоев в нижние
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // entities не могут импортировать из features, widgets, pages, app
          {
            target: './src/entities/**/*',
            from: './src/features/**/*',
            message: 'Entities не могут импортировать из Features. Используйте только shared слой.'
          },
          {
            target: './src/entities/**/*',
            from: './src/widgets/**/*',
            message: 'Entities не могут импортировать из Widgets. Используйте только shared слой.'
          },
          {
            target: './src/entities/**/*',
            from: './src/pages/**/*',
            message: 'Entities не могут импортировать из Pages. Используйте только shared слой.'
          },
          {
            target: './src/entities/**/*',
            from: './src/app/**/*',
            message: 'Entities не могут импортировать из App. Используйте только shared слой.'
          },
          
          // features не могут импортировать из widgets, pages, app
          {
            target: './src/features/**/*',
            from: './src/widgets/**/*',
            message: 'Features не могут импортировать из Widgets. Используйте entities или shared.'
          },
          {
            target: './src/features/**/*',
            from: './src/pages/**/*',
            message: 'Features не могут импортировать из Pages. Используйте entities или shared.'
          },
          {
            target: './src/features/**/*',
            from: './src/app/**/*',
            message: 'Features не могут импортировать из App. Используйте entities или shared.'
          },
          
          // widgets не могут импортировать из pages, app
          {
            target: './src/widgets/**/*',
            from: './src/pages/**/*',
            message: 'Widgets не могут импортировать из Pages. Используйте features, entities или shared.'
          },
          {
            target: './src/widgets/**/*',
            from: './src/app/**/*',
            message: 'Widgets не могут импортировать из App. Используйте features, entities или shared.'
          },
          
          // pages не могут импортировать из app
          {
            target: './src/pages/**/*',
            from: './src/app/**/*',
            message: 'Pages не могут импортировать из App. Используйте widgets, features, entities или shared.'
          }
        ]
      }
    ],
    
    // Запрещаем импорты из внутренних модулей (только через index.ts)
    'import/no-internal-modules': [
      'error',
      {
        allow: [
          // Разрешаем импорты из shared (общие ресурсы)
          'src/shared/**',
          // Разрешаем импорты через публичные API
          'src/entities/**/index',
          'src/features/**/index',
          'src/widgets/**/index'
        ]
      }
    ],
    
    // Правильный порядок импортов
    'import/order': [
      'error',
      {
        groups: [
          'builtin',   // Node.js встроенные модули
          'external',  // npm пакеты
          'internal',  // Внутренние модули (@/)
          'parent',    // Родительские модули
          'sibling',   // Соседние модули
          'index'      // index файлы
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before'
          },
          {
            pattern: 'next/**',
            group: 'external',
            position: 'before'
          },
          {
            pattern: '@/shared/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/entities/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/features/**',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '@/widgets/**',
            group: 'internal',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['react', 'next'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ]
  }
};
