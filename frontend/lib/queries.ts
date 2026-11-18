'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/toast';
import { api, type Query } from './api';
import type {
  Account,
  Budget,
  Category,
  CategoryType,
  Dashboard,
  TransactionList,
  TransactionType,
  User,
} from './types';

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => api<User>('/auth/me'), retry: false, staleTime: 60_000 });
}

export function useAccounts(includeInactive = false) {
  return useQuery({
    queryKey: ['accounts', includeInactive],
    queryFn: () => api<Account[]>('/accounts', { query: { includeInactive } }),
  });
}

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ['categories', type ?? 'all'],
    queryFn: () => api<Category[]>('/categories', { query: { type } }),
  });
}

export function useAllCategories() {
  return useQuery({
    queryKey: ['categories', 'all-with-inactive'],
    queryFn: () => api<Category[]>('/categories', { query: { includeInactive: true } }),
  });
}

export type TxFilters = {
  from?: string;
  to?: string;
  type?: TransactionType | '';
  accountId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export function useTransactions(filters: TxFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => api<TransactionList>('/transactions', { query: filters as Query }),
    placeholderData: keepPreviousData,
  });
}

export function useBudgets(month: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: () => api<Budget[]>('/budgets', { query: { month } }),
  });
}

export function useDashboard(month: string) {
  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: () => api<Dashboard>('/dashboard', { query: { month } }),
  });
}

/** Mutação padrão: avisa o resultado e recarrega os dados (saldos, gráficos e listas dependem uns dos outros). */
export function useApiMutation<TData = unknown, TVars = void>(
  fn: (vars: TVars) => Promise<TData>,
  successMessage?: string,
) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation<TData, Error, TVars>({
    mutationFn: fn,
    onSuccess: () => {
      void qc.invalidateQueries();
      if (successMessage) toast.success(successMessage);
    },
    onError: (error) => toast.error(error.message),
  });
}
