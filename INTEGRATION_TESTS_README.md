# Integration Tests

This project includes both unit tests (with mocks) and integration tests (with real database connections).

## Unit Tests vs Integration Tests

### Unit Tests ( `npm test` )

* Located in `src/__tests__/lib/`,  `src/__tests__/components/`, etc.
* Use mocked Supabase client
* Fast execution, no external dependencies
* Test individual functions in isolation
* Generate `test-report.html`

### Integration Tests ( `npm run test:integration` )

* Located in `src/__tests__/integration/`
* Use real Supabase database connections
* Slower execution, require database setup
* Test complete workflows end-to-end
* Generate `integration-test-report.html`

## Setting Up Integration Tests

### 1. Create Test Database

Create a separate Supabase project/database for testing to avoid affecting production data.

### 2. Configure Environment Variables

1. Copy `.env.test` and fill in your test database credentials:

```bash
cp .env.test .env.test.local
```

2. Edit `.env.test.local` with your test database URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
```

### 3. Database Schema

Ensure your test database has the same schema as production. You can:
* Copy migrations from `supabase/migrations/`
* Use Supabase CLI to push schema to test database
* Manually create tables if needed

### 4. Run Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run integration tests in watch mode
npm run test:integration:watch

# Run specific integration test file
npm run test:integration -- src/__tests__/integration/brand.integration.test.ts
```

## Integration Test Features

### Automatic Cleanup

* Tests automatically clean up created data using `beforeAll`/`afterAll` hooks
* Unique test data names prevent conflicts between test runs

### Error Testing

* Tests both successful operations and error conditions
* Validates database constraints and validation rules

### Real-World Scenarios

* Tests actual database operations (CREATE, UPDATE, DELETE)
* Validates data persistence and retrieval
* Tests edge cases with special characters, long strings, etc.

## Test Reports

Integration tests generate `integration-test-report.html` with:
* Detailed test execution information
* Console logs and error messages
* Performance metrics
* Visual pass/fail indicators

## Best Practices

### When to Use Integration Tests

* Testing complete user workflows
* Validating database constraints
* Testing API integrations
* Performance testing

### When to Use Unit Tests

* Testing individual functions
* Fast feedback during development
* Testing error conditions with mocks
* CI/CD pipelines (faster execution)

### Test Data Management

* Use unique identifiers (timestamps) to avoid conflicts
* Always clean up test data
* Don't rely on specific IDs from previous tests
* Test both success and failure scenarios

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   

```
   Error: Supabase environment variables not configured for integration tests
   ```

   Solution: Ensure `.env.test.local` exists with valid credentials

2. **Database Connection Failed**
   

```
   Error: Database connection failed
   ```

   Solution: Check Supabase URL and key, ensure database is accessible

3. **Permission Denied**
   

```
   Error: Permission denied
   ```

   Solution: Check RLS policies in test database

4. **Timeout Errors**
   

```
   Timeout - Async callback was not invoked within the 30000 ms timeout
   ```

   Solution: Increase `testTimeout` in `jest.integration.config.js` or check database performance

### Database Setup Checklist

* [ ] Separate Supabase project created
* [ ] Environment variables configured in `.env.test.local`
* [ ] Database schema matches production
* [ ] RLS policies allow test operations
* [ ] Network connectivity to Supabase
