export function validateEnv(config: Record<string, unknown>) {
  for (const key of ['DATABASE_URL', 'JWT_ACCESS_SECRET']) {
    if (!config[key]) throw new Error(`Variável de ambiente ausente: ${key}`);
  }
  if (String(config.JWT_ACCESS_SECRET).length < 16) {
    throw new Error('JWT_ACCESS_SECRET deve ter ao menos 16 caracteres');
  }
  return config;
}
