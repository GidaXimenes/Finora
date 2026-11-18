export interface SystemCategory {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
}

/** Categorias padrão (userId nulo, somente leitura). IDs fixos tornam o upsert idempotente. */
export const SYSTEM_CATEGORIES: SystemCategory[] = [
  { id: 'sys-inc-salario', name: 'Salário', type: 'INCOME', color: '#468B7C', icon: 'briefcase' },
  { id: 'sys-inc-freelance', name: 'Freelance', type: 'INCOME', color: '#5E9FB0', icon: 'laptop' },
  { id: 'sys-inc-investimentos', name: 'Investimentos', type: 'INCOME', color: '#7C9A6D', icon: 'trending-up' },
  { id: 'sys-inc-outras', name: 'Outras receitas', type: 'INCOME', color: '#9AA8A4', icon: 'wallet' },
  { id: 'sys-exp-alimentacao', name: 'Alimentação', type: 'EXPENSE', color: '#D49A6A', icon: 'utensils' },
  { id: 'sys-exp-transporte', name: 'Transporte', type: 'EXPENSE', color: '#6F9BC4', icon: 'car' },
  { id: 'sys-exp-moradia', name: 'Moradia', type: 'EXPENSE', color: '#8E86B8', icon: 'home' },
  { id: 'sys-exp-saude', name: 'Saúde', type: 'EXPENSE', color: '#C97B7B', icon: 'heart-pulse' },
  { id: 'sys-exp-educacao', name: 'Educação', type: 'EXPENSE', color: '#6FA8A0', icon: 'graduation-cap' },
  { id: 'sys-exp-lazer', name: 'Lazer', type: 'EXPENSE', color: '#C4A25E', icon: 'gamepad' },
  { id: 'sys-exp-assinaturas', name: 'Assinaturas', type: 'EXPENSE', color: '#A98BB5', icon: 'repeat' },
  { id: 'sys-exp-compras', name: 'Compras', type: 'EXPENSE', color: '#C98DA3', icon: 'shopping-bag' },
  { id: 'sys-exp-outras', name: 'Outras despesas', type: 'EXPENSE', color: '#9AA8A4', icon: 'tag' },
];
