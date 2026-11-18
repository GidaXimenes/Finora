'use client';

import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CategoryFormModal } from '@/components/features/category-form';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CategoryBadge, EmptyState, Loading, PageHeader, Pill } from '@/components/ui/misc';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { useApiMutation, useCategories } from '@/lib/queries';
import type { Category, CategoryType, RemoveResult } from '@/lib/types';

function Column({
  title,
  type,
  items,
  onEdit,
  onDelete,
}: {
  title: string;
  type: CategoryType;
  items: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const list = items.filter((c) => c.type === type);
  return (
    <section className="card overflow-hidden">
      <h2 className="border-b border-line px-5 py-4 font-semibold">{title}</h2>
      {list.length === 0 ? (
        <EmptyState icon={<Tags className="h-6 w-6" aria-hidden />} title="Sem categorias" description="Crie uma categoria personalizada." />
      ) : (
        <ul className="divide-y divide-line">
          {list.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-5 py-3">
              <CategoryBadge color={c.color} icon={c.icon} />
              <span className="flex-1 truncate text-sm font-medium">{c.name}</span>
              {c.isSystem ? (
                <Pill>Padrão</Pill>
              ) : (
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    aria-label={`Editar ${c.name}`}
                    onClick={() => onEdit(c)}
                    className="rounded-lg p-2 text-ink-muted transition hover:bg-brand-50 hover:text-ink"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Excluir ${c.name}`}
                    onClick={() => onDelete(c)}
                    className="rounded-lg p-2 text-ink-muted transition hover:bg-expense-soft hover:text-expense"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const toast = useToast();
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const remove = useApiMutation((id: string) => api<RemoveResult>(`/categories/${id}`, { method: 'DELETE' }));

  return (
    <>
      <PageHeader
        title="Categorias"
        description="Organize suas movimentações. As categorias padrão já estão prontas, e você pode criar as suas."
        actions={
          <Button
            data-tour="categories-new"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nova categoria
          </Button>
        }
      />

      {isLoading || !data ? (
        <Loading />
      ) : (
        <div data-tour="categories-list" className="grid gap-6 lg:grid-cols-2">
          <Column
            title="Despesas"
            type="EXPENSE"
            items={data}
            onEdit={(c) => {
              setEditing(c);
              setFormOpen(true);
            }}
            onDelete={setToDelete}
          />
          <Column
            title="Receitas"
            type="INCOME"
            items={data}
            onEdit={(c) => {
              setEditing(c);
              setFormOpen(true);
            }}
            onDelete={setToDelete}
          />
        </div>
      )}

      <CategoryFormModal open={formOpen} onClose={() => setFormOpen(false)} category={editing} />

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir categoria"
        message={`Excluir "${toDelete?.name ?? ''}"? Se ela já estiver em uso, será apenas ocultada para preservar o histórico.`}
        confirmLabel="Excluir"
        loading={remove.isPending}
        onClose={() => setToDelete(null)}
        onConfirm={() =>
          toDelete &&
          remove.mutate(toDelete.id, {
            onSuccess: (r) => {
              toast.success(r.deactivated ? 'Categoria ocultada, pois está em uso' : 'Categoria excluída');
              setToDelete(null);
            },
          })
        }
      />
    </>
  );
}
