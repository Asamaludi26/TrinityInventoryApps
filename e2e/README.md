# E2E Testing - Trinity Inventory Apps

End-to-End testing menggunakan **Cypress** untuk memvalidasi flow aplikasi secara keseluruhan.

## 📁 Struktur Folder

```
e2e/
├── cypress/
│   ├── e2e/              # Test specs
│   │   ├── auth.cy.ts        # Authentication tests
│   │   ├── dashboard.cy.ts   # Dashboard tests
│   │   ├── assets.cy.ts      # Assets management tests
│   │   └── requests.cy.ts    # Request workflow tests
│   ├── fixtures/         # Test data
│   │   └── example.json      # User credentials & test data
│   └── support/          # Support files
│       ├── commands.ts       # Custom Cypress commands
│       └── e2e.ts            # Global setup
├── cypress.config.ts     # Cypress configuration
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

## 🚀 Quick Start

### Prerequisites

- Backend running di `http://localhost:3001`
- Frontend running di `http://localhost:5173`

### Menjalankan Tests

```bash
# Buka Cypress GUI (interactive mode)
pnpm cypress:open

# Jalankan semua tests di terminal
pnpm cypress:run

# Jalankan dengan frontend dev server otomatis
pnpm test:e2e:dev
```

## 📝 Test Coverage

### Authentication (`auth.cy.ts`)

- ✅ Display login form
- ✅ Form validation
- ✅ Invalid credentials handling
- ✅ Successful login redirect
- ✅ Logout flow
- ✅ Protected routes

### Dashboard (`dashboard.cy.ts`)

- ✅ Dashboard widgets
- ✅ Statistics cards
- ✅ Recent activities
- ✅ Navigation
- ✅ Responsive design (mobile, tablet, desktop)

### Assets (`assets.cy.ts`)

- ✅ Assets list & table
- ✅ Pagination
- ✅ Search functionality
- ✅ Create asset
- ✅ View asset details
- ✅ Delete confirmation

### Requests (`requests.cy.ts`)

- ✅ Requests list
- ✅ Filter by status
- ✅ Create request
- ✅ Approve request
- ✅ Reject request with reason
- ✅ Full workflow test

## 🔧 Custom Commands

```typescript
// Login dengan session caching
cy.login("admin@trinity.com", "admin123");

// Login via API (lebih cepat)
cy.apiLogin("admin@trinity.com", "admin123");

// Get element by data-testid
cy.getByTestId("submit-button");

// Intercept API request
cy.interceptApi("GET", "/assets", "getAssets");

// Check toast notification
cy.checkToast("Berhasil disimpan", "success");
```

## ⚙️ Configuration

### Environment Variables

```typescript
// cypress.config.ts
env: {
  apiUrl: 'http://localhost:3001/api/v1',
}
```

### Test Fixtures

Edit `cypress/fixtures/example.json` untuk credentials dan test data:

```json
{
  "users": {
    "admin": {
      "email": "admin@trinity.com",
      "password": "admin123"
    }
  }
}
```

## 🏷️ Data-TestId Conventions

Untuk memudahkan testing, gunakan `data-testid` attributes di frontend:

| Component          | data-testid                  |
| ------------------ | ---------------------------- |
| Sidebar            | `sidebar`                    |
| Mobile menu button | `mobile-menu-button`         |
| Navigation links   | `nav-assets`, `nav-requests` |
| Stats cards        | `stats-card`                 |
| Create buttons     | `create-asset-button`        |
| Delete buttons     | `delete-button`              |
| User menu          | `user-menu`                  |

## 🔗 Related

- [Frontend Testing Guide](../frontend/MIGRATION_GUIDE.md)
- [Backend Testing Guide](../backend/README.md)
- [Docs: Testing Guide](../Docs/02_DEVELOPMENT_GUIDES/TESTING_GUIDE.md)
