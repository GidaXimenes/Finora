export type AccountType = 'CHECKING' | 'SAVINGS' | 'WALLET' | 'INVESTMENT' | 'OTHER';
export type CategoryType = 'INCOME' | 'EXPENSE';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type PaymentMethod = 'PIX' | 'DEBIT' | 'CASH' | 'TRANSFER' | 'OTHER';
export type BudgetPeriod = 'MONTHLY' | 'YEARLY';
export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface User {
  id: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalanceCents: number;
  color: string;
  active: boolean;
  balanceCents: number;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isSystem: boolean;
  active: boolean;
}

export interface CategoryRef {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface AccountRef {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amountCents: number;
  description: string;
  date: string;
  accountId: string;
  destinationAccountId: string | null;
  categoryId: string | null;
  paymentMethod: PaymentMethod | null;
  account: AccountRef;
  destinationAccount: AccountRef | null;
  category: CategoryRef | null;
}

export interface TransactionList {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: { incomeCents: number; expenseCents: number };
}

export interface Budget {
  id: string;
  categoryId: string;
  limitCents: number;
  period: BudgetPeriod;
  spentCents: number;
  remainingCents: number;
  percent: number;
  status: BudgetStatus;
  category: CategoryRef;
}

export interface Dashboard {
  month: string;
  totalBalanceCents: number;
  incomeCents: number;
  expenseCents: number;
  resultCents: number;
  expensesByCategory: Array<{
    categoryId: string | null;
    name: string;
    color: string;
    icon: string;
    totalCents: number;
    percent: number;
  }>;
  evolution: Array<{ month: string; incomeCents: number; expenseCents: number }>;
  recentTransactions: Transaction[];
  budgets: Budget[];
  counts: { accounts: number; transactions: number; budgets: number };
}

export interface RemoveResult {
  deleted: boolean;
  deactivated: boolean;
}
