import type { AccountType, BudgetPeriod, PaymentMethod, TransactionType } from './types';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: 'Conta corrente',
  SAVINGS: 'Poupança',
  WALLET: 'Carteira',
  INVESTMENT: 'Investimentos',
  OTHER: 'Outra',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  PIX: 'Pix',
  DEBIT: 'Débito',
  CASH: 'Dinheiro',
  TRANSFER: 'Transferência',
  OTHER: 'Outro',
};

export const TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferência',
};

export const PERIOD_LABELS: Record<BudgetPeriod, string> = {
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
};

/** Paleta suave usada para contas e categorias. */
export const COLOR_CHOICES = [
  '#468B7C',
  '#5E9FB0',
  '#6F9BC4',
  '#8E86B8',
  '#A98BB5',
  '#C98DA3',
  '#C97B7B',
  '#D49A6A',
  '#C4A25E',
  '#7C9A6D',
  '#9AA8A4',
];
