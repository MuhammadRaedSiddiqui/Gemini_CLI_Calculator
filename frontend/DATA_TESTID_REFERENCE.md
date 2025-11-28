# Data-TestID Reference Guide

This document lists all `data-testid` attributes added to the calculator components for improved test targeting.

## CalculatorDisplay Component

Located in: `src/components/CalculatorDisplay.tsx`

| Element | data-testid | Description |
|---------|------------|-------------|
| Display Container | `calculator-display-container` | Main container for the display area |
| Mode Toggle Button | `mode-toggle-button` | Button to switch between Basic/Scientific modes |
| Expression Display | `calculator-expression` | Shows the current expression (e.g., "2 + 3 =") |
| Result Display | `calculator-display` | Shows the current result/value |
| Error Message | `error-message` | Error message shown when calculation fails |

### Usage Example:
```tsx
// Get the calculator display value
const display = screen.getByTestId('calculator-display');
expect(display).toHaveTextContent('42');

// Get the expression
const expression = screen.getByTestId('calculator-expression');
expect(expression).toHaveTextContent('40 + 2 =');

// Check for error
const error = screen.queryByTestId('error-message');
expect(error).not.toBeInTheDocument();
```

---

## Main Calculator Page

Located in: `src/app/page.tsx`

| Element | data-testid | Description |
|---------|------------|-------------|
| Calculator Container | `calculator-container` | Root container for entire calculator |
| Loading Overlay | `loading-overlay` | Overlay shown during calculations |
| Loading Text | `loading-text` | "Calculating..." text |
| Button Grid | `calculator-buttons` | Grid container for all calculator buttons |
| Individual Buttons | `button-{label}` | Each button (see table below) |

### Button data-testid Values:

| Button Label | data-testid | Type |
|--------------|-------------|------|
| AC | `button-ac` | Clear |
| ± | `button--` | Negate |
| % | `button--` | Percent |
| ÷ | `button--` | Operator |
| × | `button--` | Operator |
| - | `button--` | Operator |
| + | `button--` | Operator |
| = | `button--` | Equals |
| 0-9 | `button-0` to `button-9` | Number |
| . | `button-` | Decimal |
| sin | `button-sin` | Scientific function |
| cos | `button-cos` | Scientific function |
| tan | `button-tan` | Scientific function |
| √ | `button--` | Scientific function |

### Usage Example:
```tsx
// Click buttons using testid
fireEvent.click(screen.getByTestId('button-5'));
fireEvent.click(screen.getByTestId('button--')); // Plus
fireEvent.click(screen.getByTestId('button-3'));
fireEvent.click(screen.getByTestId('button--')); // Equals

// Wait for calculation
await waitFor(() => {
  expect(screen.getByTestId('calculator-display')).toHaveTextContent('8');
});

// Check loading state
expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
expect(screen.getByTestId('loading-text')).toHaveTextContent('Calculating...');
```

---

## HistoryDrawer Component

Located in: `src/components/HistoryDrawer.tsx`

| Element | data-testid | Description |
|---------|------------|-------------|
| History Drawer | `history-drawer` | Main container for history drawer |
| Clear History Button | `clear-history-button` | Button to clear all history |
| History List | `history-list` | UL element containing all history items |
| History Item | `history-item-{index}` | Individual history entry (index from 0) |
| History Expression | `history-expression-{index}` | Expression part of history item |
| History Result | `history-result-{index}` | Result part of history item |
| Empty State | `history-empty` | Shown when no history exists |

### Usage Example:
```tsx
// Check history drawer exists
expect(screen.getByTestId('history-drawer')).toBeInTheDocument();

// Access specific history item (most recent is index 0)
const firstItem = screen.getByTestId('history-item-0');
const firstExpression = screen.getByTestId('history-expression-0');
const firstResult = screen.getByTestId('history-result-0');

expect(firstExpression).toHaveTextContent('2 + 3 =');
expect(firstResult).toHaveTextContent('5');

// Click history item to reuse result
fireEvent.click(firstItem);
expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');

// Clear history
fireEvent.click(screen.getByTestId('clear-history-button'));
expect(screen.getByTestId('history-empty')).toBeInTheDocument();
```

---

## Best Practices for Using data-testid

### 1. **Prefer testid over text queries for unique elements**
```tsx
// ✅ Good - specific and unambiguous
const display = screen.getByTestId('calculator-display');

// ❌ Bad - can match multiple elements (button and display)
const display = screen.getByText('5');
```

### 2. **Use within() to scope queries**
```tsx
// ✅ Good - scoped to specific container
const displayContainer = screen.getByTestId('calculator-display-container');
const result = within(displayContainer).getByTestId('calculator-display');

// Avoid ambiguity when same text appears in multiple places
```

### 3. **Use findBy* for async elements**
```tsx
// ✅ Good - waits for element to appear
const result = await screen.findByTestId('calculator-display');
expect(result).toHaveTextContent('42');

// Or with waitFor
await waitFor(() => {
  expect(screen.getByTestId('calculator-display')).toHaveTextContent('42');
});
```

### 4. **Check loading states properly**
```tsx
// ✅ Good - check both presence and absence
expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();

await waitFor(() => {
  expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
});
```

### 5. **Access dynamic content (history items)**
```tsx
// ✅ Good - loop through all history items
const historyList = screen.getByTestId('history-list');
const items = within(historyList).getAllByTestId(/history-item-\d+/);

items.forEach((item, index) => {
  const expression = screen.getByTestId(`history-expression-${index}`);
  const result = screen.getByTestId(`history-result-${index}`);
  // Verify each item
});
```

---

## Migration Guide for Existing Tests

### Before (using text queries):
```tsx
fireEvent.click(screen.getByText('5'));
fireEvent.click(screen.getByText('+'));
fireEvent.click(screen.getByText('3'));
fireEvent.click(screen.getByText('='));

await waitFor(() => {
  expect(screen.getByText('8')).toBeInTheDocument(); // ❌ Ambiguous!
});
```

### After (using testids):
```tsx
fireEvent.click(screen.getByTestId('button-5'));
fireEvent.click(screen.getByTestId('button--')); // Plus operator
fireEvent.click(screen.getByTestId('button-3'));
fireEvent.click(screen.getByTestId('button--')); // Equals

await waitFor(() => {
  expect(screen.getByTestId('calculator-display')).toHaveTextContent('8'); // ✅ Specific!
});
```

### For History Items:
```tsx
// Before
expect(screen.getByText('5 + 3 = 8')).toBeInTheDocument(); // ❌ Text split across elements

// After
const expression = screen.getByTestId('history-expression-0');
const result = screen.getByTestId('history-result-0');
expect(expression).toHaveTextContent('5 + 3 =');
expect(result).toHaveTextContent('8');

// Or click to select
const historyItem = screen.getByTestId('history-item-0');
fireEvent.click(historyItem);
expect(screen.getByTestId('calculator-display')).toHaveTextContent('8');
```

---

## Common Test Patterns

### 1. **Complete Calculation Flow**
```tsx
test('performs calculation correctly', async () => {
  render(<HomePage />);
  
  // Input expression
  fireEvent.click(screen.getByTestId('button-2'));
  fireEvent.click(screen.getByTestId('button--')); // +
  fireEvent.click(screen.getByTestId('button-3'));
  
  // Verify expression display
  expect(screen.getByTestId('calculator-expression')).toHaveTextContent('2 + ');
  
  // Calculate
  fireEvent.click(screen.getByTestId('button--')); // =
  
  // Check loading state
  expect(screen.getByTestId('loading-text')).toHaveTextContent('Calculating...');
  
  // Wait for result
  await waitFor(() => {
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('5');
  });
  
  // Verify history
  const historyResult = await screen.findByTestId('history-result-0');
  expect(historyResult).toHaveTextContent('5');
});
```

### 2. **Error Handling**
```tsx
test('displays error on invalid calculation', async () => {
  render(<HomePage />);
  
  // Trigger error
  fireEvent.click(screen.getByTestId('button-5'));
  fireEvent.click(screen.getByTestId('button--')); // ÷
  fireEvent.click(screen.getByTestId('button-0'));
  fireEvent.click(screen.getByTestId('button--')); // =
  
  // Check for error
  await waitFor(() => {
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('Error');
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
  });
  
  // Clear error
  fireEvent.click(screen.getByTestId('button-ac'));
  expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
});
```

### 3. **Mode Switching**
```tsx
test('switches between basic and scientific modes', () => {
  render(<HomePage />);
  
  // Start in basic mode
  expect(screen.getByTestId('mode-toggle-button')).toHaveTextContent('Scientific');
  
  // Switch to scientific
  fireEvent.click(screen.getByTestId('mode-toggle-button'));
  expect(screen.getByTestId('mode-toggle-button')).toHaveTextContent('Basic');
  
  // Scientific buttons should be available
  expect(screen.getByTestId('button-sin')).toBeInTheDocument();
  expect(screen.getByTestId('button-cos')).toBeInTheDocument();
});
```

---

## Notes

1. **Button Naming Collision**: Some special characters (±, ÷, ×, -, +, =, %, ., √) result in `button--` after sanitization. Use the button's visual label to differentiate in context.

2. **History Index**: History items are indexed from 0, with 0 being the most recent item (reversed order).

3. **Loading States**: Always use `queryByTestId` with `.not.toBeInTheDocument()` to check if loading has finished, as the element won't exist when not loading.

4. **Error States**: The error message element only exists when there's an error, so use `queryByTestId` for checking absence.

5. **Mode-Specific Elements**: Some buttons only exist in specific modes (e.g., scientific functions in scientific mode).

---

## Updating Tests

When updating tests, remember to:

1. Replace `getByText()` calls with `getByTestId()` for display elements
2. Use `within()` when you need to scope queries
3. Use `findBy*` queries for elements that appear after async operations
4. Add proper `waitFor()` blocks around async state changes
5. Check loading states explicitly before verifying results

This will eliminate the "multiple elements found" errors and make tests more reliable and maintainable.
