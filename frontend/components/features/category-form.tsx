'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Segmented } from '@/components/ui/field';
import { CategoryBadge, ColorPicker } from '@/components/ui/misc';
import { Modal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { CategoryIcon, ICON_CHOICES } from '@/lib/icons';
import { COLOR_CHOICES } from '@/lib/labels';
import { useApiMutation } from '@/lib/queries';
import type { Category, CategoryType } from '@/lib/types';

export function CategoryFormModal({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title={category ? 'Editar categoria' : 'Nova categoria'}>
      {open && <CategoryForm key={category?.id ?? 'new'} category={category ?? null} onDone={onClose} />}
    </Modal>
  );
}

function CategoryForm({ category, onDone }: { category: Category | null; onDone: () => void }) {
  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState<CategoryType>(category?.type ?? 'EXPENSE');
  const [color, setColor] = useState(category?.color ?? COLOR_CHOICES[0]);
  const [icon, setIcon] = useState(category?.icon ?? 'tag');
  const [error, setError] = useState('');

  const save = useApiMutation(
    (body: Record<string, unknown>) =>
      category
        ? api(`/categories/${category.id}`, { method: 'PATCH', body })
        : api('/categories', { method: 'POST', body }),
    'Categoria salva',
  );

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError('Informe o nome da categoria');
    setError('');
    const body = category ? { name: name.trim(), color, icon } : { name: name.trim(), type, color, icon };
    save.mutate(body, { onSuccess: onDone });
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="flex items-center gap-3">
        <CategoryBadge color={color} icon={icon} />
        <div className="flex-1">
          <Field label="Nome" htmlFor="cat-name" error={error}>
            <Input id="cat-name" value={name} maxLength={40} placeholder="Ex.: Pets" onChange={(e) => setName(e.target.value)} />
          </Field>
        </div>
      </div>

      {!category && (
        <Field label="Tipo">
          <Segmented
            label="Tipo"
            value={type}
            onChange={setType}
            options={[
              { value: 'EXPENSE', label: 'Despesa' },
              { value: 'INCOME', label: 'Receita' },
            ]}
          />
        </Field>
      )}

      <Field label="Cor">
        <ColorPicker value={color} onChange={setColor} choices={COLOR_CHOICES} />
      </Field>

      <Field label="Ícone">
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {ICON_CHOICES.map((name) => (
            <button
              key={name}
              type="button"
              aria-label={name}
              aria-pressed={icon === name}
              onClick={() => setIcon(name)}
              className={cn(
                'flex h-10 items-center justify-center rounded-xl border transition',
                icon === name ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-line text-ink-muted hover:bg-canvas',
              )}
            >
              <CategoryIcon name={name} className="h-[18px] w-[18px]" />
            </button>
          ))}
        </div>
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          Salvar categoria
        </Button>
      </div>
    </form>
  );
}
