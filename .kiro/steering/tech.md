# Tech Stack

## Runtime & Language

- **Vanilla HTML/CSS/JavaScript** — no framework, no bundler, no transpiler
- Runs directly in the browser; no build step required for the app itself
- Uses `crypto.randomUUID()` for task IDs (with a manual fallback for older browsers)

## Files

| File         | Purpose                        |
|--------------|--------------------------------|
| `index.html` | App markup and structure       |
| `style.css`  | All styling                    |
| `app.js`     | All application logic          |

## Testing Stack

| Tool                    | Role                                         |
|-------------------------|----------------------------------------------|
| `vitest`                | Test runner                                  |
| `fast-check`            | Property-based testing (PBT) library         |
| `@vitest/coverage-v8`   | Code coverage                                |
| `jsdom`                 | Browser DOM simulation (built into Vitest)   |

Test files live under `tests/` and are plain `.js` (no TypeScript).

## Common Commands

```bash
# Run all tests (single pass, no watch)
npx vitest --run

# Run tests with coverage
npx vitest --run --coverage

# Install dependencies
npm install
```

## Dependencies

All dependencies are dev-only (no runtime npm dependencies):

```json
{
  "devDependencies": {
    "vitest": "...",
    "fast-check": "...",
    "@vitest/coverage-v8": "...",
    "jsdom": "..."
  }
}
```

## Vitest Configuration

```js
// vitest.config.js
export default {
  test: {
    environment: 'jsdom'
  }
};
```
