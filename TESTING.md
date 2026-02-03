# Testing Guide

This document outlines the testing strategy and guidelines for the calendar app.

## Test-Driven Development (TDD) Workflow

This project uses strict TDD. Write tests **before** implementing or changing production code.

### Required Workflow

1. **Write the failing test first**
   - Add/extend tests that describe the desired behavior.
   - Use a clear test name that describes the behavior and expected outcome.
   - Run `npm test` and confirm the new test fails for the right reason.

2. **Implement the smallest change to pass**
   - Add only the code needed to satisfy the test.
   - Avoid refactors or unrelated changes in the same commit.

3. **Refactor with safety**
   - Clean up implementation while keeping tests green.
   - Re-run `npm test` before finishing the task.

4. **Document behavior when needed**
   - If the feature changes behavior or expectations, update this file or other docs.

### TDD Definition of Done

- A test exists that captures the new behavior or bug fix.
- The test fails before the implementation is added.
- The test passes after the implementation.
- Existing tests remain green (`npm test`).
- No unrelated code changes are mixed in.

### TDD Commit Guidance

When possible, keep commits in this order:

1. **Add tests** (red)
2. **Implement fix/feature** (green)
3. **Refactor** (optional)

If a single commit is required, include the test and the implementation together, but the test must be written first during development.

## Testing Stack

- **Jest**: Test runner (v30.2.0)
- **React Native Testing Library**: Component testing (v13.3.3)
- **jest-expo**: Expo-specific Jest preset (v54.0.16)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are located in `src/__tests__/` mirroring the source directory structure:

```
src/__tests__/
├── components/
│   ├── calendar/           # Calendar component tests
│   │   └── CalendarHeader.test.tsx
│   └── navigation/         # Navigation component tests
│       └── BottomNav.test.tsx
├── screens/
│   └── events/            # Screen tests
│       └── EventView.test.tsx
└── utils/                 # Utility function tests
    ├── dateHelpers.test.ts
    └── eventHelpers.test.ts
```

## What to Test

### 1. Utility Functions (High Priority)
- Date formatting and manipulation
- Event filtering and sorting
- Data transformations

**Example**: `src/utils/dateHelpers.test.ts`
- Tests pure functions with no dependencies
- Easy to test, high value
- Should have 100% coverage

### 2. Components (Medium Priority)
- Rendering with different props
- User interactions (button clicks, etc.)
- Conditional rendering logic

**Example**: `src/__tests__/components/calendar/CalendarHeader.test.tsx`
- Test that month/year displays correctly
- Test navigation button callbacks
- Test with different dates

### 3. Screens (Medium Priority)
- Integration between components
- Navigation flows
- Data display

**Example**: `src/__tests__/screens/events/EventView.test.tsx`
- Test event details display
- Test back/edit button functionality
- Test with different event data structures

### 4. Integration Tests (Lower Priority)
- Complete user flows
- State management
- Multiple screen navigation

## Testing Patterns

### Component Testing Pattern

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should handle user interaction', () => {
    const mockCallback = jest.fn();
    const { getByText } = render(
      <MyComponent onPress={mockCallback} />
    );

    fireEvent.press(getByText('Button'));
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
```

### Utility Function Testing Pattern

```typescript
import { myUtilFunction } from '../myUtils';

describe('myUtilFunction', () => {
  it('should return expected result', () => {
    const result = myUtilFunction(input);
    expect(result).toBe(expectedOutput);
  });

  it('should handle edge cases', () => {
    expect(myUtilFunction(null)).toBe(defaultValue);
    expect(myUtilFunction(undefined)).toBe(defaultValue);
  });
});
```

## Best Practices

### 1. Test Behavior, Not Implementation
✅ Good: Test that clicking a button calls a callback
❌ Bad: Test internal state or implementation details

### 2. Use Descriptive Test Names
```typescript
// ✅ Good
it('should display event title and description', () => {});

// ❌ Bad
it('works', () => {});
```

### 3. Arrange-Act-Assert Pattern
```typescript
it('should update count when button pressed', () => {
  // Arrange
  const { getByText } = render(<Counter />);

  // Act
  fireEvent.press(getByText('Increment'));

  // Assert
  expect(getByText('Count: 1')).toBeTruthy();
});
```

### 4. Keep Tests Isolated
- Each test should be independent
- Use `beforeEach` to reset state
- Mock external dependencies

### 5. Test Edge Cases
- Empty data
- Null/undefined values
- Boundary conditions
- Error states

## Coverage Goals

- **Utility Functions**: Aim for 100% coverage
- **Components**: Aim for 80%+ coverage
- **Screens**: Aim for 70%+ coverage

Check coverage with:
```bash
npm run test:coverage
```

## Mocking

### Mocked Dependencies

The following are automatically mocked in `jest.setup.js`:
- `@react-native-community/datetimepicker`
- `expo-status-bar`

### Adding New Mocks

Add mocks to `jest.setup.js`:

```javascript
jest.mock('my-library', () => ({
  myFunction: jest.fn(),
}));
```

## Troubleshooting

### Tests Failing After Installing New Package

1. Check if the package needs to be mocked
2. Add mock to `jest.setup.js`
3. Update `transformIgnorePatterns` in `jest.config.js` if needed

### Component Not Rendering

1. Check that all required props are provided
2. Verify mocks are set up correctly
3. Use `debug()` from testing library to inspect rendered output

### Async Tests Timing Out

1. Increase timeout in test:
```typescript
it('async test', async () => {
  // test code
}, 10000); // 10 second timeout
```

2. Use `waitFor` for async operations:
```typescript
import { waitFor } from '@testing-library/react-native';

await waitFor(() => {
  expect(getByText('Loaded')).toBeTruthy();
});
```

## Next Steps for Expanding Test Coverage

1. **Add CalendarGrid tests**
   - Test day rendering
   - Test event indicators
   - Test day press callbacks

2. **Add DayView tests**
   - Test event filtering by date
   - Test event sorting (all-day first)
   - Test empty state

3. **Add AddEventView tests**
   - Test form validation
   - Test date picker interactions
   - Test link parsing

4. **Add integration tests**
   - Test complete event creation flow
   - Test navigation between screens
   - Test event editing workflow

5. **Add snapshot tests**
   - Capture component rendering
   - Detect unintended UI changes

## Resources

- [React Native Testing Library Docs](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
