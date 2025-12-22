# Internationalization (i18n) Setup

This application now supports multiple languages using `next-intl`.

## Supported Languages

- **English** (en) - Default language
- **Polish** (pl)

## How It Works

### URL Structure

The application uses locale-based routing:
- English: `http://localhost:3000/en` or `http://localhost:3000/` (default)
- Polish: `http://localhost:3000/pl`

### Translation Files

Translation files are located in `/messages/`:
- `en.json` - English translations
- `pl.json` - Polish translations

### Adding New Translations

1. Add the new key-value pair to both `en.json` and `pl.json`
2. Use the translation in your component:
   - Server Components: `const t = await getTranslations("namespace");`
   - Client Components: `const t = useTranslations("namespace");`
3. Use the translation: `{t("key")}`

### Example

```tsx
// Server Component
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("home");
  return <h1>{t("title")}</h1>;
}

// Client Component
"use client";
import { useTranslations } from "next-intl";

export default function Component() {
  const t = useTranslations("home");
  return <h1>{t("title")}</h1>;
}
```

### Translation Namespaces

- `metadata` - Page metadata (title, description)
- `common` - Common terms used across the app
- `navigation` - Navigation-related text
- `home` - Home page text
- `attempts` - Attempts page text
- `upload` - Upload page text
- `comments` - Comment section text
- `votes` - Voting buttons text
- `delete` - Delete button text

## Configuration Files

- `/src/i18n/routing.ts` - Defines supported locales and creates navigation helpers
- `/src/i18n/request.ts` - Configures how messages are loaded
- `/src/middleware.ts` - Handles locale detection and routing
- `/next.config.ts` - Integrates next-intl plugin

## Adding a New Language

1. Create a new JSON file in `/messages/` (e.g., `de.json` for German)
2. Copy the structure from `en.json` and translate all values
3. Add the locale code to `/src/i18n/routing.ts`:
   ```ts
   locales: ['en', 'pl', 'de'],
   ```
4. Restart the development server
