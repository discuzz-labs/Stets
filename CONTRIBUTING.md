# Contributing Guidelines

Thank you for your interest in contributing to our project! This document outlines the process for making contributions.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your contribution

## Contribution Process

### 1. Create an Issue First

Before making any changes, create an issue describing what you want to implement or fix. This ensures:

- No duplicate work
- Discussion of the proposed changes
- Agreement on the approach before work begins

### 2. Branch Naming Convention

Create a dedicated branch for your issue using the following convention:

- `fix/issue-number/brief-description` - for bug fixes
- `feat/issue-number/brief-description` - for new features
- `docs/issue-number/brief-description` - for documentation changes
- `refactor/issue-number/brief-description` - for code refactoring
- `test/issue-number/brief-description` - for test-related changes

Example: `feat/123/add-user-authentication`

### 3. Commit Message Guidelines

Follow these conventions for commit messages:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:

- `fix:` - bug fixes
- `feat:` - new features
- `docs:` - documentation changes
- `style:` - formatting changes
- `refactor:` - code refactoring
- `test:` - adding or modifying tests
- `chore:` - maintenance tasks

Example:

```
feat: add user authentication system

- Implement JWT token generation
- Add password hashing
- Create login endpoints

Closes #123
```

### 4. Development Workflow

1. Create your branch from `dev`
2. Make your changes
3. Write or update tests if necessary
4. Update documentation if needed
5. Ensure all tests pass
6. Push your changes to your fork
7. Create a Pull Request to the `dev` branch

### 5. Pull Request Process

1. Open a PR against the `dev` branch
2. Link the related issue in the PR description
3. Provide a clear description of the changes
4. Wait for code review
5. Make requested changes if any
6. Wait for approval

### 6. Review and Merge Process

1. Changes will be reviewed in the `dev` branch
2. After approval, changes will be tested in the development environment
3. Once testing is successful, changes will be merged to `main`
4. A new release will be created with appropriate version number

## Release Process

1. Changes accumulated in `main` will be tagged with a version number
2. A release will be created following semantic versioning:
   - MAJOR version for incompatible API changes
   - MINOR version for backwards-compatible functionality
   - PATCH version for backwards-compatible bug fixes

## Questions or Need Help?

If you have questions or need help with the contribution process, please:

1. Check existing issues
2. Create a new issue with the `question` label
3. Wait for maintainer response

Thank you for contributing to our project!
