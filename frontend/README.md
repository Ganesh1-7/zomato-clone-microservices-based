# Zomato Clone — Production Ready

A modern, production-grade food delivery application built with React 19, TypeScript, Vite, and Tailwind CSS. Features restaurant browsing, menu exploration, cart management, checkout flow, and a comprehensive design system.

---

## Features

- **Restaurant Discovery** — Browse restaurants with ratings, delivery times, and discounts
- **Advanced Search & Filters** — Real-time search with debounce, cuisine filtering, rating filters, and sorting
- **Menu Browsing** — Categorized menu items with quantity selectors
- **Shopping Cart** — Multi-restaurant cart with persistent localStorage, quantity management, and order summary
- **Checkout Flow** — Form validation with input masking, toast notifications, and order confirmation
- **Responsive Design** — Mobile-first with hamburger menu, sticky header, and adaptive layouts
- **Accessibility** — ARIA labels, skip links, focus-visible states, screen-reader support
- **Error Resilience** — ErrorBoundary for crash recovery, 404 page, loading skeletons
- **PWA Ready** — Web manifest, theme color, responsive meta tags

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Icons | React Icons |
| Linting | ESLint 10 + typescript-eslint |
| Formatting | Prettier |
| Container | Docker + nginx |

---

## Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Navigation with search, location, mobile menu
│   ├── Footer.tsx              # Site footer with links and social
│   ├── RestaurantList.tsx      # Home page with hero, filters, grid
│   ├── RestaurantCard.tsx      # Restaurant card component
│   ├── RestaurantDetails.tsx   # Menu page with categories
│   ├── Cart.tsx                # Shopping cart with grouped items
│   ├── Checkout.tsx            # Checkout form with validation
│   ├── Toast.tsx               # Toast notification system
│   ├── ScrollToTop.tsx         # Route scroll restoration
│   ├── NotFound.tsx            # 404 error page
│   └── ErrorBoundary.tsx       # React error boundary
├── hooks/
│   ├── useDebounce.ts          # Search debounce hook
│   └── useToast.ts             # Toast state management
├── data/
│   └── mockData.ts             # Mock restaurant data
├── types/
│   └── css.d.ts                # CSS module declarations
├── App.tsx                     # Root with routing, lazy loading
├── App.css                     # Component styles
├── index.css                   # Design tokens, base styles
└── main.tsx                    # Entry point
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Docker Deployment

```bash
# Build image
docker build -t zomato-clone .

# Run container
docker run -p 8080:80 zomato-clone
```

The app will be available at `http://localhost:8080`.

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_APP_ENV` | Environment name |
| `VITE_ENABLE_ANALYTICS` | Enable analytics flag |

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:

1. TypeScript type checking
2. ESLint validation
3. Production build
4. Docker image build (main branch only)

---

## Design System

The app uses a comprehensive CSS custom property design system in `index.css`:

- **Colors**: Primary orange, semantic greens/reds, full neutral scale
- **Shadows**: 6-level shadow system for depth
- **Spacing**: Consistent 8px-based spacing scale
- **Typography**: System font stack with fluid sizing
- **Animations**: Fade, slide, bounce, float, shimmer keyframes
- **Components**: Buttons, cards, inputs, badges, quantity selectors

---

## Performance Optimizations

- **Code Splitting**: Route-based lazy loading with React.lazy + Suspense
- **Chunking**: Vendor, router, and icons split into separate chunks
- **Memoization**: useMemo for cart totals, useCallback for event handlers
- **Debounced Search**: 300ms debounce on search input
- **CSS Optimization**: Terser minification, CSS minify in production
- **Asset Caching**: 1-year cache headers for static assets via nginx

---

## Accessibility (a11y)

- Skip-to-content link for keyboard navigation
- ARIA labels on all interactive elements
- Focus-visible states with custom outline styles
- Semantic HTML (header, main, footer, nav, button)
- Role attributes for landmarks and alerts
- Color contrast compliant with WCAG AA

---

## License

MIT — Open source for educational and commercial use.

