import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

/**
 * Teste de ponta a ponta contra um PostgreSQL real.
 * Pré-requisitos: banco no ar e migrações aplicadas (veja o README).
 */
describe('Finora API (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();
  const stamp = Date.now();
  const emailA = `a-${stamp}@example.com`;
  const emailB = `b-${stamp}@example.com`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: [emailA, emailB] } } });
    await prisma.$disconnect();
    await app.close();
  });

  it('bloqueia rotas privadas sem login', async () => {
    await request(app.getHttpServer()).get('/accounts').expect(401);
  });

  it('fluxo completo: cadastro, conta, transações, saldo, orçamento e isolamento', async () => {
    const a = request.agent(app.getHttpServer());
    const b = request.agent(app.getHttpServer());

    await a.post('/auth/register').send({ name: 'Ana', email: emailA, password: 'senha-segura-1' }).expect(201);
    await b.post('/auth/register').send({ name: 'Beto', email: emailB, password: 'senha-segura-2' }).expect(201);
    await a.get('/auth/me').expect(200);

    // Conta com saldo inicial de R$ 1.000,00
    const account = (
      await a.post('/accounts').send({ name: 'Nubank', type: 'CHECKING', initialBalanceCents: 100_000 }).expect(201)
    ).body;

    const categories = (await a.get('/categories').expect(200)).body as Array<{ id: string; type: string; name: string }>;
    const salary = categories.find((c) => c.name === 'Salário')!;
    const food = categories.find((c) => c.name === 'Alimentação')!;

    const today = new Date().toISOString().slice(0, 10);
    await a
      .post('/transactions')
      .send({ type: 'INCOME', amountCents: 300_000, description: 'Salário', date: today, accountId: account.id, categoryId: salary.id })
      .expect(201);
    const expense = (
      await a
        .post('/transactions')
        .send({ type: 'EXPENSE', amountCents: 25_000, description: 'Mercado', date: today, accountId: account.id, categoryId: food.id, paymentMethod: 'PIX' })
        .expect(201)
    ).body;

    // RN05: categoria de receita em despesa deve falhar
    await a
      .post('/transactions')
      .send({ type: 'EXPENSE', amountCents: 100, description: 'x', date: today, accountId: account.id, categoryId: salary.id })
      .expect(400);

    // Saldo: 1000 + 3000 - 250 = 3750
    let accounts = (await a.get('/accounts').expect(200)).body;
    expect(accounts[0].balanceCents).toBe(375_000);

    // RN09: editar reflete no saldo
    await a.patch(`/transactions/${expense.id}`).send({ amountCents: 50_000 }).expect(200);
    accounts = (await a.get('/accounts').expect(200)).body;
    expect(accounts[0].balanceCents).toBe(350_000);

    // Orçamento: R$ 600 em Alimentação, gasto R$ 500 => 83,3% (atenção)
    await a.post('/budgets').send({ categoryId: food.id, limitCents: 60_000, period: 'MONTHLY' }).expect(201);
    const budgets = (await a.get('/budgets').expect(200)).body;
    expect(budgets[0].spentCents).toBe(50_000);
    expect(budgets[0].status).toBe('warning');

    const dash = (await a.get('/dashboard').expect(200)).body;
    expect(dash.incomeCents).toBe(300_000);
    expect(dash.expenseCents).toBe(50_000);
    expect(dash.totalBalanceCents).toBe(350_000);

    // RN01: usuário B não enxerga nada de A
    expect((await b.get('/accounts').expect(200)).body).toHaveLength(0);
    await b.get(`/accounts/${account.id}`).expect(404);
    await b.get(`/transactions/${expense.id}`).expect(404);
    await b.delete(`/transactions/${expense.id}`).expect(404);
    await b
      .post('/transactions')
      .send({ type: 'EXPENSE', amountCents: 100, description: 'invasão', date: today, accountId: account.id, categoryId: food.id })
      .expect(404);

    // Conta com histórico é desativada, não apagada
    const removal = (await a.delete(`/accounts/${account.id}`).expect(200)).body;
    expect(removal).toEqual({ deleted: false, deactivated: true });

    // CSV
    const csv = await a.get('/transactions/export').expect(200);
    expect(csv.headers['content-type']).toContain('text/csv');

    // LGPD: excluir a conta apaga os dados
    await a.delete('/auth/me').send({ password: 'senha-segura-1' }).expect(204);
    expect(await prisma.user.findUnique({ where: { email: emailA } })).toBeNull();
  });
});
