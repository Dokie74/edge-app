# Contributing to EDGE

Thank you for your interest in contributing to EDGE! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- **Be respectful**: Treat all contributors with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be collaborative**: Work together to achieve common goals
- **Be constructive**: Provide helpful feedback and suggestions

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 18+ installed
- Git configured with your name and email
- A Supabase account for testing
- Familiarity with React, TypeScript, and PostgreSQL

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/edge-app.git
   cd edge-app
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-org/edge-app.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Configure your Supabase credentials
   ```

## 🔄 Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

Examples:
- `feature/user-profile-enhancement`
- `fix/dashboard-loading-issue`
- `docs/api-documentation-update`

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Run tests** to ensure everything works:
   ```bash
   npm test
   npm run type-check
   ```

4. **Commit your changes** with descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add user profile enhancement feature"
   ```

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add employee search functionality
fix: resolve dashboard loading timeout issue
docs: update API documentation for development plans
refactor: optimize dashboard component performance
test: add unit tests for AdminService
```

## 📏 Coding Standards

### TypeScript Guidelines

- **Always use TypeScript** for new files
- **Define interfaces** for all data structures
- **Use strict mode** settings in tsconfig.json
- **Avoid `any` type** - use proper typing
- **Export types** from `src/types/index.ts`

### React Guidelines

- **Functional components** with hooks
- **Use React.memo** for performance optimization
- **Custom hooks** for reusable logic
- **Proper prop types** with TypeScript interfaces
- **Handle loading and error states**

### Code Style

- **Use Prettier** for code formatting
- **Follow ESLint** rules and recommendations
- **Use meaningful variable names**
- **Write self-documenting code**
- **Add comments** for complex logic only

### File Organization

```
src/
├── components/
│   ├── ComponentName.tsx        # Component implementation
│   ├── ComponentName.test.tsx   # Component tests
│   └── index.ts                 # Export barrel
├── services/
│   ├── ServiceName.ts           # Service implementation
│   ├── ServiceName.test.ts      # Service tests
│   └── index.ts                 # Export barrel
└── types/
    └── index.ts                 # All type definitions
```

## 🧪 Testing

### Testing Requirements

All contributions must include appropriate tests:

- **Unit tests** for utility functions and services
- **Component tests** for React components
- **Integration tests** for API interactions
- **E2E tests** for critical user workflows (when applicable)

### Writing Tests

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run TypeScript type checking
npm run type-check
```

## 🔍 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Run the full test suite**
3. **Check TypeScript compilation**
4. **Verify your changes work locally**
5. **Rebase on latest main branch**

### PR Requirements

- **Descriptive title** and detailed description
- **Link related issues** using keywords (fixes #123)
- **Include screenshots** for UI changes
- **List breaking changes** if any
- **Update CHANGELOG.md** for significant changes

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by at least one maintainer
3. **Address feedback** and make requested changes
4. **Final approval** and merge by maintainers

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (browser, OS, version)
- **Screenshots or logs** if applicable

### Feature Requests

For feature requests, please provide:

- **Clear description** of the proposed feature
- **Use case** and business justification
- **Proposed implementation** (if you have ideas)
- **Alternative solutions** considered

### Issue Templates

Use the appropriate issue template:
- 🐛 Bug Report
- ✨ Feature Request
- 📚 Documentation
- ❓ Question

## 🏷️ Labels and Milestones

### Common Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issues
- `status: needs review` - Awaiting review

## 🎯 Development Focus Areas

We especially welcome contributions in these areas:

1. **Performance optimization** - React.memo, lazy loading, bundle optimization
2. **Testing coverage** - Unit tests, integration tests, E2E tests
3. **Accessibility** - WCAG compliance, keyboard navigation, screen readers
4. **Documentation** - API docs, user guides, developer tutorials
5. **Internationalization** - Multi-language support
6. **Mobile optimization** - Responsive design improvements

## 📞 Getting Help

If you need help contributing:

- **GitHub Discussions** - For general questions and ideas
- **GitHub Issues** - For bug reports and feature requests
- **Email** - contact@your-company.com for sensitive matters

## 🙏 Recognition

Contributors are recognized in:
- README.md contributors section
- CHANGELOG.md for each release
- GitHub contributors page
- Annual contributor highlights

Thank you for contributing to EDGE! 🚀