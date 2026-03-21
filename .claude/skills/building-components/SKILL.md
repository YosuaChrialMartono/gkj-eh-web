---
name: building-components
description: Use this skill when creating, editing, or organizing React components in this project. Applies when the user asks to add a new UI component, build a page section, style with Tailwind, handle dark mode, create a form element, or place a new component in the right directory. USE WHEN: "create a component", "add a button", "build a form", "add dark mode", "style with Tailwind", "where should this component go".
allowed-tools: [Read, Edit, Write, Glob, Grep]
---

# Building Components

## Component Directory Guide

| Directory | What goes here | Examples |
|---|---|---|
| `components/ai/` | Components that render AI output or manage AI interaction | `ChatWindow`, `MessageBubble`, `PromptInput`, `ModelSelector` |
| `components/ui/` | Generic, reusable primitives with no business logic | `Button`, `Input`, `Badge`, `Card`, `Modal` |
| `components/layout/` | Structural shell components | `Header`, `Sidebar`, `Footer`, `PageWrapper` |

**Rule**: if a component is reusable across multiple features → `ui/`. If it's specific to AI workflows → `ai/`. If it's part of the page chrome → `layout/`.

## Standard Component Structure

```typescript
// components/ui/badge.tsx
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger";
}

// ✅ Named export — not default
export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200": variant === "default",
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200": variant === "success",
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200": variant === "warning",
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200": variant === "danger",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
```

## Forwarding Refs (UI Primitives)

Always use `forwardRef` for input-like primitives so parent components can access the DOM node.

```typescript
import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("flex h-10 w-full rounded-lg border ...", className)}
    {...props}
  />
));

Input.displayName = "Input"; // Required for React DevTools
export { Input };
```

## Tailwind Patterns

### Always pair light + dark variants
```tsx
// ✅ Correct — both light and dark
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800" />

// ❌ Wrong — dark mode will break
<div className="bg-white text-zinc-900" />
```

### Use cn() for conditional classes
```tsx
import { cn } from "@/lib/utils";

// ✅ Correct
<button className={cn(
  "base-styles",
  isActive && "active-styles",
  isDisabled && "opacity-50 cursor-not-allowed",
  className  // always accept className prop for extensibility
)} />

// ❌ Wrong — fragile string concatenation
<button className={`base-styles ${isActive ? "active-styles" : ""}`} />
```

### Common Tailwind patterns used in this project
```
Rounded containers:  rounded-lg, rounded-2xl
Borders:             border border-zinc-200 dark:border-zinc-800
Subtle backgrounds:  bg-zinc-50 dark:bg-zinc-950, bg-zinc-100 dark:bg-zinc-900
Primary action:      bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900
AI accent:           bg-violet-600 text-white (avatars, highlights)
Transitions:         transition-colors
Focus rings:         focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-0
```

## Client vs Server Components

```typescript
// Server Component (default in App Router) — no interactivity needed
// ✅ Fine for: static layout, data fetching, metadata
export function Header() { ... }

// Client Component — needs state, effects, or browser APIs
"use client"; // ← add at top of file
export function ChatWindow() {
  const [value, setValue] = useState("");
  ...
}
```

**Rule**: default to Server Components. Add `"use client"` only when you need:
- `useState`, `useReducer`, `useEffect`
- Event handlers (`onClick`, `onChange`)
- Browser APIs
- Third-party client libraries

## Accepting className for Extensibility

All leaf components should accept and forward `className`:
```typescript
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return <div className={cn("rounded-2xl border p-4", className)}>{children}</div>;
}
```

## Comments in Components

Add comments when the logic isn't immediately obvious:
```tsx
// Scroll to bottom whenever a new message is added
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages.length]);
```

## What NOT to Do

- ❌ No default exports for components
- ❌ No inline styles (`style={{ ... }}`) — use Tailwind
- ❌ No `any` type casts without a comment explaining why
- ❌ No business logic in UI primitives (`components/ui/`)

## Key Files to Reference
- `components/ui/button.tsx` — forwardRef + variant pattern
- `components/ui/input.tsx` — forwardRef + className forwarding
- `components/ai/message-bubble.tsx` — dark mode + conditional rendering
- `components/ai/prompt-input.tsx` — textarea auto-resize pattern
- `lib/utils.ts` — `cn()`, `generateId()`, `formatTimestamp()`
