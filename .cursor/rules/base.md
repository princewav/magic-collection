# Next.js Code Generation Conventions for LLM

## General Principles
- Follow **KISS (Keep It Simple, Stupid)**, **DRY (Don't Repeat Yourself)**, **YAGNI (You Ain't Gonna Need It)**, and **SOLID** principles.
- Always evaluate if a **simpler, more elegant, and robust solution** exists.
- Provide confidence level (1-10) when suggesting alternative solutions, but **do not modify code until approved**.

## React Code Style and Patterns
- Define **interfaces for component props**.
- Modularize components into **smaller, reusable pieces**.
- Follow **Next.js App Router** patterns, correctly using **server and client components**.
- Use **Tailwind CSS** for styling.
- Use **Shadcn UI** for components.
- Use **React Hook Form** for form handling.
- Use **Zod** for validation.
- Use **React Context** for state management.
- Use **PascalCase** for filenames (e.g., `UserCard.tsx`, not `user-card.tsx`).
- Use **named exports** for components.
- Write functional components instead of class-based ones.
- If a **function exceeds 10 lines**, split it into **smaller functions**.
- If a **component exceeds 30 lines**, split it into **smaller components**.
- use pnpm instead of npm when you suggest installing packages

## Code Structure and Organization
- Include a **comment at the top** of each file specifying its **relative path**.
- Ensure code is **modular and maintainable**.
- Avoid **over-engineering**.

## Commit Message Conventions
- Use **lowercase** for commit messages.
- Do **not** include descriptions.
- use conventional commits
- keep the commit message concise
- Example: `fix: button alignment`

## Shadcn Installation Commands
- Use `shadcn@...`, not `shadcn-ui@...`.

## Prohibited Actions
- **Do not explain obvious programming concepts**.
- **Do not include project setup instructions**.
- **Do not generate over-engineered solutions** without prior discussion.

## Code of conduct
- Thoroughly analyze the existing code before making any changes.
- Explicitly state which parts of the code I intend to modify and why.
- Double-check the changes to ensure no unintended deletions occur.
- Ask for confirmation before implementing any changes that might affect existing functionality.
