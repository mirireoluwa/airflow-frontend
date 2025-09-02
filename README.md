# Airflow - Project & Task Management

A modern, feature-rich project and task management web application built with React, TypeScript, and TailwindCSS.

## ✨ Features

- **📊 Dashboard** - Real-time overview with statistics and recent activities
- **📁 Project Management** - Create, edit, and manage projects with team assignment
- **✅ Task Management** - Comprehensive task tracking with priorities and statuses
- **🔄 Kanban Board** - Drag-and-drop task management with visual columns
- **📈 Analytics** - Charts and insights for team performance tracking
- **🎨 Modern UI** - Clean, responsive design built with TailwindCSS
- **📱 Mobile Responsive** - Works seamlessly across all device sizes

## 🛠 Tech Stack

- **React 19** with TypeScript for type safety
- **React Router** for client-side routing
- **TailwindCSS** for modern styling
- **React Hook Form + Zod** for form validation
- **@dnd-kit** for drag-and-drop functionality
- **Recharts** for data visualization
- **Lucide React** for beautiful icons
- **Date-fns** for date manipulation
- **Vite** for fast development and building

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives
│   ├── layout/         # Layout components
│   ├── forms/          # Form components
│   ├── charts/         # Chart components
│   └── kanban/         # Kanban board components
├── pages/              # Page components
│   ├── dashboard/      # Dashboard page
│   ├── projects/       # Projects management
│   ├── tasks/          # Tasks management
│   └── analytics/      # Analytics page
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── lib/                # External library configurations
```

## 🎯 Key Features Demo

The application comes with sample data so you can immediately:
- View the dashboard with project statistics
- Create and manage projects
- Add and organize tasks
- Use the Kanban board with drag-and-drop
- Analyze team performance in the analytics section

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
