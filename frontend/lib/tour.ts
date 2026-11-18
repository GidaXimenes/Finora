import { driver, type DriveStep } from 'driver.js';

export type TourId = 'dashboard' | 'transactions' | 'accounts' | 'categories' | 'budgets';

/** Escolhe o primeiro elemento visível (o menu existe em duas versões: desktop e celular). */
const visible = (selector: string) => () =>
  (Array.from(document.querySelectorAll(selector)).find((el) => el.getClientRects().length > 0) ??
    document.body) as Element;

const tour = (name: string) => visible(`[data-tour="${name}"]`);

const STEPS: Record<TourId, DriveStep[]> = {
  dashboard: [
    {
      popover: {
        title: 'Bem-vindo(a) ao Finora',
        description:
          'Em menos de um minuto você vê onde fica cada coisa. Pode sair do passeio quando quiser, e refazê-lo pelo botão de ajuda.',
      },
    },
    {
      element: tour('nav'),
      popover: {
        title: 'Menu principal',
        description:
          'Aqui você troca entre Painel, Transações, Contas, Categorias e Orçamentos. Comece pelas Contas: é onde o seu dinheiro fica guardado.',
      },
    },
    {
      element: tour('new-transaction'),
      popover: {
        title: 'Registre uma movimentação',
        description: 'Gastou ou recebeu? Toque aqui, informe o valor e pronto. Leva poucos segundos.',
      },
    },
    {
      element: tour('month'),
      popover: {
        title: 'Escolha o mês',
        description: 'Todo o painel mostra o mês selecionado. Use as setas para ver os meses anteriores.',
      },
    },
    {
      element: tour('summary'),
      popover: {
        title: 'Seu resumo',
        description:
          'O saldo soma todas as suas contas ativas. Receitas, despesas e resultado se referem ao mês escolhido.',
      },
    },
    {
      element: tour('chart'),
      popover: {
        title: 'Para onde vai seu dinheiro',
        description: 'As categorias com mais gastos no mês aparecem aqui, da maior para a menor.',
      },
    },
    {
      element: tour('budgets'),
      popover: {
        title: 'Orçamentos',
        description:
          'Defina um limite por categoria e acompanhe quanto já foi usado. A barra muda de cor perto do limite.',
      },
    },
    {
      element: tour('help'),
      popover: {
        title: 'Ajuda sempre à mão',
        description: 'Este botão repete o passeio da tela em que você estiver.',
      },
    },
  ],
  transactions: [
    {
      element: tour('new-transaction'),
      popover: {
        title: 'Nova transação',
        description:
          'Escolha entre despesa, receita ou transferência entre suas contas. Transferências não contam como gasto.',
      },
    },
    {
      element: tour('tx-filters'),
      popover: {
        title: 'Filtros',
        description: 'Combine mês, tipo, conta, categoria e busca por texto para achar qualquer lançamento.',
      },
    },
    {
      element: tour('tx-list'),
      popover: {
        title: 'Seus lançamentos',
        description: 'Agrupados por dia. Use o lápis para editar e a lixeira para excluir. O saldo se ajusta sozinho.',
      },
    },
    {
      element: tour('tx-export'),
      popover: {
        title: 'Exportar',
        description: 'Baixe os lançamentos filtrados em CSV para abrir no Excel ou no Google Planilhas.',
      },
    },
  ],
  accounts: [
    {
      element: tour('accounts-new'),
      popover: {
        title: 'Adicione suas contas',
        description:
          'Cadastre cada lugar onde você guarda dinheiro: banco, carteira, poupança. Informe o saldo de hoje como saldo inicial.',
      },
    },
    {
      element: tour('accounts-grid'),
      popover: {
        title: 'Saldo de cada conta',
        description:
          'O saldo é calculado a partir do saldo inicial e dos lançamentos. Contas com histórico são desativadas em vez de apagadas, para não perder relatórios.',
      },
    },
  ],
  categories: [
    {
      element: tour('categories-list'),
      popover: {
        title: 'Categorias padrão',
        description: 'Já vêm prontas para você. Elas não podem ser editadas, mas você pode criar as suas.',
      },
    },
    {
      element: tour('categories-new'),
      popover: {
        title: 'Crie as suas',
        description: 'Escolha nome, tipo, cor e ícone. Elas aparecem na hora nos formulários e nos gráficos.',
      },
    },
  ],
  budgets: [
    {
      element: tour('month'),
      popover: {
        title: 'Acompanhe por mês',
        description: 'O gasto de cada orçamento é calculado com as despesas do mês escolhido.',
      },
    },
    {
      element: tour('budgets-new'),
      popover: {
        title: 'Defina um limite',
        description: 'Escolha uma categoria de despesa e quanto você quer gastar nela por mês ou por ano.',
      },
    },
    {
      element: tour('budgets-list'),
      popover: {
        title: 'Cores da barra',
        description: 'Verde: dentro do limite. Amarelo: acima de 80%. Vermelho: limite ultrapassado.',
      },
    },
  ],
};

export function tourIdFromPath(pathname: string): TourId | null {
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/transactions')) return 'transactions';
  if (pathname.startsWith('/accounts')) return 'accounts';
  if (pathname.startsWith('/categories')) return 'categories';
  if (pathname.startsWith('/budgets')) return 'budgets';
  return null;
}

export function startTour(id: TourId, onEnd?: () => void) {
  const instance = driver({
    showProgress: true,
    allowClose: true,
    overlayOpacity: 0.45,
    stagePadding: 6,
    stageRadius: 14,
    popoverClass: 'finora-tour',
    nextBtnText: 'Próximo',
    prevBtnText: 'Voltar',
    doneBtnText: 'Concluir',
    progressText: '{{current}} de {{total}}',
    steps: STEPS[id],
    onDestroyed: () => onEnd?.(),
  });
  instance.drive();
}
