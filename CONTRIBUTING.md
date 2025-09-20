# Contributing to Career Counseling Platform

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests Process

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub Issues

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/ajrotech/career-counseling-platform/issues).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/yourusername/career-counseling-platform.git
cd career-counseling-platform

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start development servers
npm run dev:all
```

### Project Structure
```
career-counseling-platform/
├── backend/          # NestJS API
├── frontend/         # Next.js Application
├── docs/            # Documentation
└── scripts/         # Build scripts
```

## Coding Style

### TypeScript Guidelines
- Use TypeScript strict mode
- Provide proper type definitions
- Use meaningful variable names
- Follow ESLint configuration

### Code Formatting
- Use Prettier for code formatting
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas where valid

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add new assessment algorithm
fix: resolve login authentication issue
docs: update API documentation
style: fix code formatting
refactor: optimize database queries
test: add unit tests for auth service
```

## Testing

### Backend Testing
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # Integration tests
npm run test:cov      # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm run test          # Component tests
npm run test:e2e      # End-to-end tests
```

## Documentation

- Update README.md if you change functionality
- Document new APIs in the API documentation
- Add JSDoc comments for functions and classes
- Update type definitions

## Code Review Process

1. All submissions require review before merging
2. We may ask for changes to be made before a PR can be merged
3. We reserve the right to reject submissions that don't align with project goals

## Community Guidelines

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers feel welcome
- Follow our Code of Conduct

## Feature Requests

We welcome feature requests! Please:
1. Check if the feature already exists
2. Open an issue with detailed description
3. Explain the use case and benefits
4. Be open to discussion and iteration

## Security Issues

Please report security issues privately to: security@ajrotech.com

Do not open public issues for security vulnerabilities.

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

## Questions?

Feel free to reach out:
- Create an issue for technical questions
- Email: ajrotech@example.com
- Discussions tab for general questions

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

---

Thank you for contributing to the Career Counseling Platform! 🚀