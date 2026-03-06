---
title: TypeScript Tips for React Developers
date: 2025-03-01
description: Practical TypeScript tips that will make your React code safer, more readable, and easier to maintain.
tags: [TypeScript, React, webdev]
---

# TypeScript Tips for React Developers

TypeScript and React are a powerful combination. Here are some tips I've learned through building production apps.

## 1. Type Your Props Properly

Always define explicit interfaces for your component props:

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

## 2. Use Discriminated Unions for State

Instead of multiple booleans, use discriminated unions for loading states:

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
```

## 3. Generic Components

Make your components reusable with generics:

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

## 4. Custom Hooks with Types

```ts
function useLocalStorage<T>(key: string, initial: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  const setValue = (value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [state, setValue];
}
```

These patterns have saved me countless hours of debugging. TypeScript's type system, when used well, makes your code self-documenting.
