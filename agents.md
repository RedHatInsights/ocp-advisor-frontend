# OCP Advisor Frontend - Agent Instructions

React micro-frontend for OpenShift Advisor on console.redhat.com. Displays cluster recommendations, workloads, and update risks. Runs inside Red Hat Insights Chrome shell via Module Federation.

## Tech Stack

- **React 18** (JavaScript — no TS files yet, but strict tsconfig exists for gradual adoption)
- **Redux Toolkit + RTK Query** for state and data fetching
- **PatternFly 6** UI components (`@patternfly/react-core`, `react-table`, `react-icons`, `react-charts`)
- **Webpack** via `@redhat-cloud-services/frontend-components-config` (FEC) — not a custom webpack config
- **Module Federation** exposes: `RootApp`, `ClustersPdfBuild`, `BuildExecReport`
- **react-intl** for i18n
- **axios** for mutations; RTK Query `fetchBaseQuery` for reads
- **Unleash** for feature flags
- **Sentry** for error tracking
- **Node 22** required

## Project Structure

```
src/
  App.js                   # Root: auth, store provider, notifications
  AppEntry.js              # Module Federation entry
  AppConstants.js          # Constants, column defs, filter categories, labels
  Messages.js              # react-intl message definitions
  Routes.js                # React Router v6 routes (lazy-loaded)

  Components/              # PascalCase directories
    ComponentName/
      index.js             # Container: hooks, data fetching, passes props
      ComponentName.js     # Presentational: receives props, renders JSX
      _ComponentName.scss  # Scoped styles (underscore prefix)
      ComponentName.cy.js  # Cypress component test
      ComponentName.test.js # Jest unit test

  Services/                # RTK Query API definitions
    SmartProxy.js           # Main API: clusters, rules, recs, workloads
    Acks.js                 # Acknowledgments API + axios mutations
    Filters.js              # Redux slice for filter state

  Store/
    index.js                # configureStore combining all reducers

  Utilities/
    Api.js                  # axios wrappers: Post, Put, Delete
    Helpers.js              # setSearchParameter, strong()
    Rule.js                 # getPluginName, getErrorKey, adjustOCPRule
    useFeatureFlag.js       # Unleash feature flag hook
    intlHelper.js           # Intl provider wrapper
    Loaders.js              # Skeleton loaders
    ErrorBoundary.js        # Error boundary component

cypress/
  fixtures/api/             # JSON API response fixtures
  utils/                    # Reusable test helpers (interceptors, filters, pagination)
  support/commands.js       # cy.mountWithContext() and OUIA helpers

config/
  setupTests.js             # Jest setup: mocks react-intl

deploy/
  frontend.yml              # Kubernetes Frontend CRD template
```

## Development Commands

```bash
npm ci                     # Install dependencies
npm run start:proxy        # Dev server with API proxy to stage
npm run build              # Production build
npm run test               # Jest unit tests (TZ=UTC, with coverage)
npm run test:local         # Jest without coverage
npm run test:ct            # Cypress component tests (headless Chrome)
npm run test:openct        # Cypress component tests (interactive)
npm run lint               # All linters (ESLint + Stylelint)
npm run lint:js:fix        # ESLint with auto-fix
npm run verify             # build + lint + test
npm run translations       # Extract + compile i18n messages
```

## Code Conventions

### Component Pattern
Components follow **container/presentational** separation:
- `index.js` — Container. Calls RTK Query hooks, extracts route params via `useParams()`, passes data as props. Uses **default export**.
- `ComponentName.js` — Presentational. Receives props, renders JSX. Uses **named export**.
- Simpler components (e.g., `RecsList`) may combine both in `index.js`.

### Data Fetching
- **Reads**: RTK Query hooks from `src/Services/SmartProxy.js` (`useGetXQuery`, `useLazyGetXQuery`).
- **Writes**: Mutations via `Acks.js` (`useSetAckMutation`) or axios calls via `src/Utilities/Api.js` (`Post`, `Put`, `Delete`).
- **API base path**: `/api/insights-results-aggregator`.
- Never call `fetch` directly — use RTK Query or the axios wrappers.

### State Management
- **Server state**: RTK Query caches (SmartProxy, Acks).
- **Filter state**: Redux slice in `src/Services/Filters.js`.
- Store created via `getStore()` factory in `src/Store/index.js`.

### Type Checking
- Use **PropTypes** for all component props (not TypeScript interfaces).
- Add `PropTypes` import and `.propTypes` static property on every component.

### Imports
- PatternFly: `@patternfly/react-core`, `@patternfly/react-table`.
- Lodash: Import individual functions (`import get from 'lodash/get'`), not the full library.
- Chrome: `import useChrome from '@redhat-cloud-services/frontend-components/useChrome'`.
- FEC: `@redhat-cloud-services/frontend-components/ComponentName`.

### Internationalization
- All user-facing strings defined in `src/Messages.js` using `defineMessages`.
- Use `intl.formatMessage(messages.messageId)` via the `useIntl()` hook.
- After adding/changing messages, run `npm run translations` and commit the updated `compiled-lang/` output.

### Routing
- App URL base: `/openshift/insights/advisor`
- Routes: `/recommendations`, `/clusters`, `/workloads`, plus detail pages with `:clusterId`, `:recommendationId`, `:namespaceId` params.
- All route components are lazy-loaded with `React.lazy` + `Suspense`.

### Feature Flags
- Use `useFeatureFlag(flagName)` from `src/Utilities/useFeatureFlag.js`.

### Commits
- **Conventional commits** enforced: `type(scope): description`
- Types: `fix`, `feat`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`

## Testing Conventions

### Jest Unit Tests (`*.test.js`)
- Co-located alongside the component.
- Use `@testing-library/react` + `@testing-library/jest-dom`.
- Jest runs with **TZ=UTC** — date assertions must use UTC.
- Setup: `config/setupTests.js` (mocks `react-intl`).
- CSS/SCSS mocked via `identity-obj-proxy`.
- Coverage from `src/**/*.{js,jsx}`, excludes `*.cy.js`.

### Cypress Component Tests (`*.cy.js`)
- Co-located in the component directory.
- Mount with `cy.mountWithContext(component, options)` — wraps in FlagProvider, IntlProvider, Redux Provider, MemoryRouter.
- API mocking via interceptor factories from `cypress/utils/`.
- Fixtures: JSON files in `cypress/fixtures/api/insights-results-aggregator/`.
- OUIA selectors: `cy.ouiaId()`, `cy.ouiaType()`.

### When to Use Which
- **Jest**: Pure logic, utilities, simple rendering.
- **Cypress**: User interaction, API integration flows, table filtering/sorting/pagination.

## Styling Conventions

- **SCSS only**, no CSS-in-JS.
- Component SCSS uses underscore prefix: `_ComponentName.scss`.
- Build automatically scopes styles under `.ocp-advisor, .ocpAdvisor` via FEC `sassPrefix`.
- Use PatternFly CSS variables instead of hardcoded colors/spacing.
- **No Prettier** — formatting is ESLint + Stylelint only.

## Gotchas

1. **Route `key={Math.random()}`**: All route elements use random keys to force re-renders — workaround for OCPADVISOR-59. Do not remove without verifying the bug is fixed.

2. **Mixed API versions**: SmartProxy uses `v2` endpoints. Acks uses some `v1` endpoints. Don't accidentally mix versions.

3. **Rule ID format**: Rule IDs use `plugin_name|ERROR_KEY` (pipe-separated). Parse with `getPluginName()` and `getErrorKey()` from `src/Utilities/Rule.js`.

4. **TZ=UTC for tests**: Jest runs with `TZ=UTC`. Date-related assertions must use UTC or tests will be flaky locally.

5. **Micro-frontend context**: This app runs inside Insights Chrome. Auth, navigation, and the `<main>` container are provided by Chrome. Use `useChrome()` for Chrome APIs.

6. **Module Federation singleton**: `react-router-dom` is shared as a singleton and excluded from the bundle. Do not add conflicting versions.

7. **Compiled translations committed**: `compiled-lang/en.json` is checked in. After changing `src/Messages.js`, run `npm run translations` and commit the output.

8. **No TypeScript files yet**: All source files are `.js/.jsx` despite having `tsconfig.json`. New files should follow existing `.js` patterns unless intentionally starting TS migration.

9. **Module Federation entry points**: `AppEntry.js`, `ClustersPdfBuild.js`, `BuildExecReport.js` are consumed by other apps. Changes affect downstream consumers.
