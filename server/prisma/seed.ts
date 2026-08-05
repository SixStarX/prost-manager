import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Bootstrap idempotente do primeiro administrador.
 *
 * Como o registro público (`POST /auth/register`) passou a exigir um ADMIN
 * autenticado, este seed é a forma segura de criar o ADMIN inicial. Ele:
 *   - só age se AINDA NÃO existir nenhum usuário com role "ADMIN";
 *   - lê as credenciais de ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD;
 *   - aplica o mesmo hash (bcrypt) usado no login;
 *   - nunca sobrescreve usuários existentes (idempotente — pode rodar N vezes).
 *
 * Uso:
 *   ADMIN_BOOTSTRAP_EMAIL=admin@prost.com ADMIN_BOOTSTRAP_PASSWORD=umaSenhaForte npx prisma db seed
 */
const prisma = new PrismaClient();

async function main() {
  // 1. Idempotência: se já há um ADMIN, não faz nada.
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { email: true },
  });
  if (existingAdmin) {
    console.log(
      `[seed] Já existe um administrador (${existingAdmin.email}). Nada a fazer.`,
    );
    return;
  }

  // 2. Credenciais só via variáveis de ambiente — nunca hardcoded.
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || 'Administrador';

  if (!email || !password) {
    throw new Error(
      'Defina ADMIN_BOOTSTRAP_EMAIL e ADMIN_BOOTSTRAP_PASSWORD antes de rodar o seed.',
    );
  }
  if (password.length < 8) {
    throw new Error('ADMIN_BOOTSTRAP_PASSWORD deve ter ao menos 8 caracteres.');
  }

  // 3. Segurança extra: não colidir com um e-mail já usado por um não-admin.
  const emailTaken = await prisma.user.findUnique({ where: { email } });
  if (emailTaken) {
    console.log(
      `[seed] O e-mail ${email} já está cadastrado (papel: ${emailTaken.role}). ` +
        'Promova-o a ADMIN manualmente se for a intenção. Abortando sem alterar.',
    );
    return;
  }

  // 4. Cria o primeiro administrador.
  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: { name, email, password: hashed, role: 'ADMIN' },
    select: { id: true, email: true },
  });
  console.log(`[seed] Administrador criado com sucesso: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(
      '[seed] Falha:',
      err instanceof Error ? err.message : String(err),
    );
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
