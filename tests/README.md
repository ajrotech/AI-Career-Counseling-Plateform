# 🧪 Testing Suite

Comprehensive testing framework for the Career Counseling Platform.

## 📋 Testing Strategy

### Test Types
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint and database interaction testing
- **End-to-End Tests**: Complete user workflow testing
- **Performance Tests**: Load and stress testing

## 🚀 Quick Start

### Run All Tests
```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:e2e          # Integration tests
npm run test:cov          # Coverage report

# Frontend tests
cd frontend
npm run test              # Component tests
npm run test:e2e          # End-to-end tests
```

## 📁 Test Structure

```
tests/
├── backend/
│   ├── unit/             # Unit tests for services, controllers
│   ├── integration/      # API endpoint tests
│   └── fixtures/         # Test data and mocks
├── frontend/
│   ├── components/       # Component unit tests
│   ├── pages/           # Page integration tests
│   └── e2e/             # End-to-end tests
├── shared/
│   ├── utils/           # Shared testing utilities
│   └── fixtures/        # Common test data
└── performance/
    ├── load/            # Load testing scripts
    └── stress/          # Stress testing scripts
```

## 🔧 Backend Testing

### Unit Tests (Jest)
```typescript
// Example: Testing authentication service
describe('AuthService', () => {
  it('should validate user credentials', async () => {
    const result = await authService.validateUser(email, password);
    expect(result).toBeDefined();
    expect(result.id).toBeTruthy();
  });
});
```

### Integration Tests (Supertest)
```typescript
// Example: Testing API endpoints
describe('POST /auth/login', () => {
  it('should return JWT token for valid credentials', () => {
    return request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(201)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });
});
```

## 🖥️ Frontend Testing

### Component Tests (React Testing Library)
```typescript
// Example: Testing navigation component
describe('Navigation', () => {
  it('should render all navigation links', () => {
    render(<Navigation />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Assessments')).toBeInTheDocument();
    expect(screen.getByText('Mentorship')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)
```typescript
// Example: Testing user registration flow
test('user can complete registration process', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'securePassword123');
  await page.click('[data-testid=submit]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 📊 Test Coverage

### Coverage Requirements
- **Unit Tests**: Minimum 80% coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user flows covered

### Coverage Reports
```bash
# Generate coverage report
npm run test:cov

# View coverage in browser
open coverage/lcov-report/index.html
```

## 🔬 Test Data Management

### Fixtures
```typescript
// User test data
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  }
};
```

### Database Seeding for Tests
```typescript
// Setup test database
beforeEach(async () => {
  await testDb.clear();
  await testDb.seed(testFixtures);
});
```

## ⚡ Performance Testing

### Load Testing (Artillery)
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/health"
```

### Stress Testing
```bash
# Run stress tests
npm run test:stress

# Monitor performance
npm run test:performance
```

## 🔧 Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
  ],
  testMatch: [
    '**/__tests__/**/*.(ts|js)',
    '**/*.(test|spec).(ts|js)'
  ]
};
```

### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure'
  }
});
```

## 🚨 Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:all
      - run: npm run test:e2e
```

## 📝 Testing Best Practices

### Writing Good Tests
1. **Descriptive Names**: Test names should clearly describe what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **Independent Tests**: Each test should be able to run in isolation
4. **Mock External Dependencies**: Use mocks for databases, APIs, and external services
5. **Test Edge Cases**: Include tests for error conditions and boundary cases

### Test Maintenance
- Update tests when adding new features
- Remove tests for deprecated functionality
- Keep test data current and realistic
- Regularly review and refactor test code

## 🔍 Debugging Tests

### Debug Commands
```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file
npm run test -- auth.spec.ts

# Run tests with verbose output
npm run test -- --verbose
```

### IDE Integration
- VS Code with Jest extension
- WebStorm with built-in test runner
- Debugger breakpoints in tests

---

## 📞 Support

For testing questions or issues:
- Check existing test examples
- Review Jest/Playwright documentation
- Create an issue for test-related bugs
- Contact the development team

**Happy Testing! 🧪✨**