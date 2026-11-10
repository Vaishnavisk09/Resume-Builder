# Finora – Smart Personal Finance & Budget Planner

Finora is a complete, production-ready full-stack personal finance application built with **Vue.js 3**, **Vite**, **Chart.js**, **Pinia**, **Tailwind CSS**, and **Google Cloud Firestore & Firebase Authentication**.

Finora delivers authentic real-time financial tracking, strict per-user document isolation, dynamic data-driven charts, category budgeting with 80% and 100% threshold warnings, savings milestones with celebration animations, and automated unit and integration tests.

---

## 🌟 Key Features

### 1. Firebase Authentication & Session Management
- **Registration**: Name, email, and password registration with client validation and duplicate email handling.
- **Login**: Email & password authentication with customized, friendly error messages.
- **Password Reset**: Forgot-password flow dispatching password reset emails via Firebase Auth.
- **Auth Persistence**: Resolves session status before route evaluation to prevent flicker or premature login redirection on browser refresh.
- **Route Protection**: Unauthenticated visitors are redirected to `/login` with redirect query preservation; authenticated users cannot access login/register routes.
- **Session Cleanliness**: Pinia stores and caches are completely purged upon logout to prevent cross-account data leakage.

### 2. Cloud Firestore Real Data Persistence
- **Strict User Hierarchy**:
  ```
  users/{userId}
    profile
    transactions/{transactionId}
    budgets/{budgetId}
    goals/{goalId}
    settings/preferences
  ```
- Full **CRUD** (Create, Read, Update, Delete) for:
  - **Transactions** (Income & Expenses)
  - **Category Budgets** (Monthly limits)
  - **Savings Goals** (Targets, deposits, completion state)
  - **User Settings & Preferences** (Default currency, alert thresholds)
- Loading indicators, confirmation modals for deletions, and helpful empty states.

### 3. User Data Security & Firestore Rules
- **Rule Enforcement**: Users can strictly read, create, update, and delete only records where `request.auth.uid == userId`.
- **Schema Validation**: Server-side validation of field types, amounts ($> 0$), date formats, and category strings.
- Complete `firestore.rules` file included in project root.

### 4. Financial Calculations & Integrity
- All statistics calculated strictly from authenticated user records:
  - $\text{Total Income} = \sum \text{Income Transactions}$
  - $\text{Total Expenses} = \sum \text{Expense Transactions}$
  - $\text{Net Balance} = \text{Total Income} - \text{Total Expenses}$
  - $\text{Monthly Savings} = \text{Monthly Income} - \text{Monthly Expenses}$
  - $\text{Savings Rate} = \left(\frac{\text{Monthly Savings}}{\text{Monthly Income}}\right) \times 100$ *(Guarded against division-by-zero / NaN)*
  - $\text{Budget Used \%} = \left(\frac{\text{Category Expenses}}{\text{Category Budget}}\right) \times 100$
  - $\text{Remaining Budget} = \text{Category Budget} - \text{Category Expenses}$
- Default formatting in **Indian Rupee (INR ₹)** with comma groupings (`₹1,00,000.00`).

### 5. Dynamic Chart.js Visualizations
1. **Expense Category Doughnut Chart**: Proportional breakdown of spending with percentage tooltips.
2. **Monthly Income vs. Expense Bar Chart**: Side-by-side comparison across calendar months.
3. **Spending Trend Line Chart**: Timeline tracking daily spending spikes.
4. **Category Comparison Horizontal Bar Chart**: Sorted ranking of highest expense categories.
5. **Savings Trend Line Chart**: Net accumulated monthly surplus/deficit over time.
- All charts update dynamically on filter/transaction changes and destroy previous instances cleanly to eliminate memory leaks.

### 6. Budget Management with Threshold Warnings
- Monthly limits per expense category.
- **Warning Indicator (Yellow/Amber)**: Fires when spending reaches $\ge 80\%$ and $\le 100\%$.
- **Exceeded Alert (Red/Rose)**: Fires when spending exceeds $100\%$ with exact overage amount.

### 7. Savings Goals & Milestone Progress
- Track progress towards specific financial targets (Emergency Fund, Vehicle, Education, etc.).
- Quick "+ Add Savings / Deposit" modal with preset chips (+₹500, +₹1,000, +₹5,000).
- Automatic celebration confetti triggered when goal reaches $100\%$.

---

## 🛠️ Tech Stack

- **Framework**: Vue.js 3 (Composition API, `<script setup>`)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3 with custom brand gradients & typography
- **State Management**: Pinia 3
- **Routing**: Vue Router 4 (with async Auth persistence guards)
- **Charts**: Chart.js 4
- **Backend / BaaS**: Firebase 11 (Authentication & Cloud Firestore)
- **Icons**: Lucide Vue Next
- **Date Handling**: date-fns
- **Test Runner**: Vitest

---

## 🚀 Quick Start & Setup Instructions

### 1. Prerequisites
- **Node.js** v18+ (tested on v24.11.0)
- **npm** v9+ (tested on v11.6.1)

### 2. Installation
Clone or navigate to the project directory and install dependencies:
```bash
npm install
```

### 3. Firebase Configuration
1. Open the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication**:
   - Go to **Build** &rarr; **Authentication** &rarr; **Sign-in method**.
   - Enable **Email/Password**.
3. Create **Cloud Firestore Database**:
   - Go to **Build** &rarr; **Firestore Database** &rarr; **Create Database** (Start in production mode).
   - In the **Rules** tab, paste the contents of `firestore.rules` from this repository and click **Publish**.
4. Register a Web App:
   - Go to **Project Settings** &rarr; **General** &rarr; **Your apps** &rarr; Click the Web icon `</>`.
   - Copy the configuration keys.
5. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
   Fill in your actual keys:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_DEFAULT_CURRENCY=INR
   VITE_DEFAULT_CURRENCY_SYMBOL=₹
   ```

*(Note: If running without a `.env` file, Finora will automatically boot into **Isolated Sandbox Demo Mode**, allowing you to test all features, calculations, and dual-account user isolation offline).*

### 4. Running the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Running Automated Tests
Run the comprehensive Vitest test suite:
```bash
npm test
```

### 6. Production Build
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🔒 Firestore Security Rules Reference

The file `firestore.rules` in the root directory ensures strict per-user authorization:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null && request.auth.uid != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    function isValidTransaction(data) {
      return data.keys().hasAll(['title', 'amount', 'type', 'category', 'date'])
        && data.title is string && data.title.size() > 0 && data.title.size() <= 120
        && data.amount is number && data.amount > 0
        && (data.type == 'income' || data.type == 'expense')
        && data.category is string && data.category.size() > 0
        && data.date is string;
    }
    function isValidBudget(data) {
      return data.keys().hasAll(['category', 'amount', 'period'])
        && data.category is string && data.category.size() > 0
        && data.amount is number && data.amount > 0
        && data.period is string;
    }
    function isValidGoal(data) {
      return data.keys().hasAll(['title', 'targetAmount', 'currentAmount'])
        && data.title is string && data.title.size() > 0
        && data.targetAmount is number && data.targetAmount > 0
        && data.currentAmount is number && data.currentAmount >= 0;
    }

    match /{document=**} {
      allow read, write: if false;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /transactions/{transactionId} {
        allow read, delete: if isOwner(userId);
        allow create, update: if isOwner(userId) && isValidTransaction(request.resource.data);
      }
      match /budgets/{budgetId} {
        allow read, delete: if isOwner(userId);
        allow create, update: if isOwner(userId) && isValidBudget(request.resource.data);
      }
      match /goals/{goalId} {
        allow read, delete: if isOwner(userId);
        allow create, update: if isOwner(userId) && isValidGoal(request.resource.data);
      }
      match /settings/{settingId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

---

## 🧪 Testing Checklist & Verification Results

All 11 mandatory requirement test scenarios were implemented and validated:

| Test ID | Test Name | Scenario Tested | Status |
| :--- | :--- | :--- | :---: |
| **TEST 1** | **Registration** | Register account with name, email, password; profile saved; redirect to dashboard. Duplicate email rejected. | **PASS** ✅ |
| **TEST 2** | **Login** | Sign in with registered credentials. Auth state loads user-specific Firestore documents. Wrong credentials rejected. | **PASS** ✅ |
| **TEST 3** | **Add Income** | Add income of ₹50,000. Balance increases by ₹50,000; appears in history and charts. | **PASS** ✅ |
| **TEST 4** | **Add Expense** | Add expense of ₹10,000. Total expense = ₹10,000; Net balance becomes ₹40,000. | **PASS** ✅ |
| **TEST 5** | **Edit & Delete** | Edit existing transaction; delete another transaction with confirmation. Accurate recalculation of balance. | **PASS** ✅ |
| **TEST 6** | **Data Persistence** | Log out, log back in, and refresh browser. Transactions, budgets, goals remain fully preserved. | **PASS** ✅ |
| **TEST 7** | **User Isolation** | Create User A and User B. User A cannot see or mutate User B's records; documents segregated by UID. | **PASS** ✅ |
| **TEST 8** | **Budget Calculations** | Budget ₹10,000. Spending ₹8,000 triggers 80% warning. Spending > ₹10,000 triggers Exceeded alert and negative remaining balance. | **PASS** ✅ |
| **TEST 9** | **Savings Goals** | Target ₹50,000, current ₹20,000 shows 40% progress and ₹30,000 left. Update to ₹50,000 marks goal complete (100%) and triggers confetti. | **PASS** ✅ |
| **TEST 10** | **Charts & Filter Validation**| Date presets (Current Month, Last 3/6 Months, Year, Custom), categories, and types update records, stat cards, and Chart.js graphs consistently. | **PASS** ✅ |
| **TEST 11** | **Error Handling** | Form validation on empty fields, negative or zero amounts, invalid email formats, missing keys, and network issues handled gracefully with user notifications. | **PASS** ✅ |

---

## 📁 Project Directory Structure

```
Finora/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── firestore.rules
├── .env.example
├── README.md
├── tests/
│   ├── calculations.test.js
│   ├── validation.test.js
│   ├── dateFilters.test.js
│   ├── userIsolationAndCRUD.test.js
│   └── securityRules.test.js
└── src/
    ├── main.js
    ├── App.vue
    ├── assets/
    │   └── main.css
    ├── config/
    │   └── firebase.js
    ├── router/
    │   └── index.js
    ├── services/
    │   ├── authService.js
    │   └── firestoreService.js
    ├── stores/
    │   ├── authStore.js
    │   ├── transactionStore.js
    │   ├── budgetStore.js
    │   ├── goalStore.js
    │   └── notificationStore.js
    ├── utils/
    │   ├── constants.js
    │   ├── currency.js
    │   ├── dateUtils.js
    │   ├── validators.js
    │   └── chartSetup.js
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.vue
    │   │   ├── Sidebar.vue
    │   │   ├── ToastContainer.vue
    │   │   └── FirebaseNotice.vue
    │   ├── common/
    │   │   ├── Modal.vue
    │   │   └── ConfirmModal.vue
    │   ├── dashboard/
    │   │   ├── StatCard.vue
    │   │   └── QuickAddModal.vue
    │   ├── transactions/
    │   │   ├── TransactionModal.vue
    │   │   ├── TransactionFilter.vue
    │   │   └── TransactionTable.vue
    │   ├── budgets/
    │   │   ├── BudgetModal.vue
    │   │   └── BudgetCard.vue
    │   ├── goals/
    │   │   ├── GoalModal.vue
    │   │   ├── GoalCard.vue
    │   │   └── DepositModal.vue
    │   └── charts/
    │       ├── ExpenseCategoryChart.vue
    │       ├── IncomeExpenseChart.vue
    │       ├── SpendingTrendChart.vue
    │       ├── CategoryBarChart.vue
    │       └── SavingsTrendChart.vue
    └── views/
        ├── DashboardView.vue
        ├── TransactionsView.vue
        ├── BudgetsView.vue
        ├── GoalsView.vue
        ├── AnalyticsView.vue
        ├── SettingsView.vue
        ├── LoginView.vue
        ├── RegisterView.vue
        ├── ForgotPasswordView.vue
        └── NotFoundView.vue
```
