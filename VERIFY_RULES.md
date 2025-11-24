# Rules Verification Guide

This document provides test cases to verify each custom rule is working correctly.

## Rule Test Cases

### 1. `custom/one-component-per-file`

**Purpose:** Enforce one React component per file.

**Test file:** `test-one-component.tsx`

```tsx
// ❌ Should trigger error (multiple components)
function ComponentA() {
  return <div>A</div>;
}

function ComponentB() {
  return <div>B</div>;
}

export { ComponentA, ComponentB };
```

```tsx
// ✅ Should pass (compound component pattern)
function Card() {
  return <div>Card</div>;
}

function CardHeader() {
  return <div>Header</div>;
}

Card.Header = CardHeader; // Compound component assignment

export default Card;
```

---

### 2. `custom/no-empty-catch`

**Purpose:** Prevent empty catch blocks.

**Test file:** `test-empty-catch.ts`

```typescript
// ❌ Should trigger error
try {
  riskyOperation();
} catch (error) {
  // Empty!
}

// ❌ Should trigger error (unused parameter)
try {
  riskyOperation();
} catch (error) {
  console.log('Something happened'); // error not used
}

// ✅ Should pass
try {
  riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
}

// ✅ Should pass (intentional ignore comment)
try {
  optionalOperation();
} catch {
  // intentionally ignored
}
```

---

### 3. `custom/form-config-extraction`

**Purpose:** Enforce form configuration extraction.

**Test file:** `test-form-config.tsx`

```tsx
import { useForm } from 'react-hook-form';

// ❌ Should trigger error (inline config)
function BadForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
  });
  return <form />;
}

// ✅ Should pass (extracted config)
import { USER_FORM_CONFIG } from './user-form-constants';

function GoodForm() {
  const form = useForm(USER_FORM_CONFIG);
  return <form />;
}
```

---

### 4. `custom/single-svg-per-file`

**Purpose:** One SVG icon per file.

**Test file:** `icons/test-icons.tsx`

```tsx
// ❌ Should trigger error (multiple SVGs)
export const IconA = () => (
  <svg viewBox="0 0 24 24">
    <path d="..." />
  </svg>
);

export const IconB = () => (
  <svg viewBox="0 0 24 24">
    <path d="..." />
  </svg>
);
```

---

### 5. `custom/svg-currentcolor`

**Purpose:** Use currentColor in single-color SVGs.

**Test file:** `icons/TestIcon.tsx`

```tsx
// ❌ Should trigger error (hardcoded color)
function BadIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path fill="#000000" d="M12 2L2 7l10 5 10-5-10-5z" />
    </svg>
  );
}

// ✅ Should pass (using currentColor)
function GoodIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5z" />
    </svg>
  );
}

// ✅ Should pass (multi-color SVG)
function MultiColorIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path fill="#FF0000" d="M12 2L2 7" />
      <path fill="#00FF00" d="M12 7l10 5" />
    </svg>
  );
}
```

---

### 6. `custom/memoized-export`

**Purpose:** Memoize icon component exports.

**Test file:** `icons/TestIcon.tsx`

```tsx
// ❌ Should trigger error (not memoized)
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path fill="currentColor" d="..." />
    </svg>
  );
}

export default HomeIcon;

// ✅ Should pass (memoized)
import { memo } from 'react';

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path fill="currentColor" d="..." />
    </svg>
  );
}

export default memo(HomeIcon);
```

---

### 7. `custom/no-inline-objects`

**Purpose:** Prevent inline objects in JSX props.

**Test file:** `test-inline-objects.tsx`

```tsx
// ❌ Should trigger error
function BadComponent() {
  return <Card style={{ padding: 20, margin: 10 }} />;
}

// ✅ Should pass
const cardStyle = { padding: 20, margin: 10 };

function GoodComponent() {
  return <Card style={cardStyle} />;
}
```

---

### 8. `custom/no-inline-functions`

**Purpose:** Prevent inline functions in JSX props.

**Test file:** `test-inline-functions.tsx`

```tsx
// ❌ Should trigger error
function BadComponent({ id }: { id: string }) {
  return <Button onClick={() => handleClick(id)} />;
}

// ✅ Should pass
function GoodComponent({ id }: { id: string }) {
  const handleButtonClick = useCallback(() => {
    handleClick(id);
  }, [id]);

  return <Button onClick={handleButtonClick} />;
}
```

---

### 9. `custom/boolean-naming-convention`

**Purpose:** Boolean variables should have is/has/should/can/will prefix.

**Test file:** `test-boolean-naming.ts`

```typescript
// ❌ Should trigger error
const enabled: boolean = true;
const loading: boolean = false;
const visible = true;

// ✅ Should pass
const isEnabled: boolean = true;
const isLoading: boolean = false;
const hasPermission: boolean = true;
const shouldUpdate: boolean = false;
const canEdit: boolean = true;
const willExpire: boolean = false;
```

---

### 10. `custom/no-nested-ternary`

**Purpose:** Prevent nested ternary operators.

**Test file:** `test-nested-ternary.ts`

```typescript
// ❌ Should trigger error
const color = isActive ? 'green' : isError ? 'red' : 'gray';

// ❌ Should trigger error (deeper nesting)
const status = isLoading
  ? 'loading'
  : isError
    ? 'error'
    : isSuccess
      ? 'success'
      : 'idle';

// ✅ Should pass (single ternary)
const color = isActive ? 'green' : 'gray';

// ✅ Should pass (function extraction)
function getStatusColor(isActive: boolean, isError: boolean): string {
  if (isActive) return 'green';
  if (isError) return 'red';
  return 'gray';
}
```

---

### 11. `custom/no-response-data-return`

**Purpose:** Prevent direct response.data returns in services.

**Test file:** `src/services/test-service.ts`

```typescript
// ❌ Should trigger error
export async function getUser(id: string) {
  const response = await api.get(`/users/${id}`);
  return response.data; // Direct return
}

// ✅ Should pass (transformed response)
export async function getUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return {
    id: response.data.id,
    name: response.data.name,
    email: response.data.email,
    createdAt: new Date(response.data.created_at),
  };
}
```

---

## Running Verification Tests

### Method 1: Create Individual Test Files

1. Create each test file listed above
2. Run ESLint on each:

```bash
npx eslint test-*.ts test-*.tsx --no-error-on-unmatched-pattern
```

### Method 2: Use ESLint Debug Mode

```bash
# Print configuration to verify rules are enabled
npx eslint --print-config src/App.tsx | grep "custom/"
```

### Method 3: Automated Test Script

Create `verify-rules.js`:

```javascript
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';

const tests = [
  {
    name: 'no-empty-catch',
    code: 'try { x(); } catch (e) {}',
    ext: 'ts',
    shouldFail: true,
  },
  {
    name: 'boolean-naming',
    code: 'const enabled: boolean = true;',
    ext: 'ts',
    shouldFail: true,
  },
  {
    name: 'no-nested-ternary',
    code: 'const x = a ? b : c ? d : e;',
    ext: 'ts',
    shouldFail: true,
  },
];

for (const test of tests) {
  const filename = `_test_${test.name}.${test.ext}`;
  writeFileSync(filename, test.code);

  try {
    execSync(`npx eslint ${filename}`, { stdio: 'pipe' });
    console.log(`${test.shouldFail ? '❌' : '✅'} ${test.name}`);
  } catch {
    console.log(`${test.shouldFail ? '✅' : '❌'} ${test.name}`);
  }

  unlinkSync(filename);
}
```

Run:

```bash
node verify-rules.js
```

## Expected Results

| Rule | Enabled In | File Pattern |
|------|------------|--------------|
| `one-component-per-file` | recommended, strict | All `.tsx` |
| `no-empty-catch` | recommended, strict | All |
| `form-config-extraction` | strict | All `.tsx` |
| `single-svg-per-file` | strict | Icon files only |
| `svg-currentcolor` | strict | Icon files only |
| `memoized-export` | strict | Icon files only |
| `no-inline-objects` | recommended, strict | All `.tsx` |
| `no-inline-functions` | recommended, strict | All `.tsx` |
| `boolean-naming-convention` | recommended, strict | All |
| `no-nested-ternary` | recommended, strict | All |
| `no-response-data-return` | strict | `src/services/**` |

