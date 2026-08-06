import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

/**
 * Armazenamento de arquivos (assinaturas) fora do banco. Implementação em disco
 * local (montar um volume em produção); a interface isola o resto do app, então
 * trocar por S3/compatível depois é local. Chaves são planas (sem subdiretório)
 * para simplificar o serviço e evitar path traversal.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly root = resolve(
    process.env.STORAGE_DIR || join(process.cwd(), 'uploads'),
  );

  /**
   * Se `value` for um dataURL de imagem, grava no storage e devolve a CHAVE.
   * Se já for uma chave, valor legado (dataURL não-imagem) ou vazio, devolve
   * como veio — preserva `null`/`undefined` (semântica do Prisma) e é
   * retrocompatível com dados antigos.
   */
  async persistDataUrl(
    value: string | null | undefined,
    prefix: string,
  ): Promise<string | null | undefined> {
    if (!value || !value.startsWith('data:')) return value;

    const m = /^data:(image\/[\w.+-]+);base64,(.+)$/s.exec(value);
    if (!m) return value; // não é imagem base64 reconhecível — não mexe

    const ext = (m[1].split('/')[1] || 'png').replace(/[^\w]/g, '') || 'png';
    const key = `${prefix}-${randomUUID()}.${ext}`;

    await mkdir(this.root, { recursive: true });
    await writeFile(join(this.root, key), Buffer.from(m[2], 'base64'));
    return key;
  }

  /** Lê um arquivo pela chave. A chave é validada (sem `/` nem `..`). */
  async read(key: string): Promise<{ buf: Buffer; contentType: string }> {
    if (!/^[\w.-]+$/.test(key)) {
      throw new NotFoundException('Arquivo não encontrado.');
    }
    try {
      const buf = await readFile(join(this.root, key));
      return { buf, contentType: this.contentType(key) };
    } catch {
      throw new NotFoundException('Arquivo não encontrado.');
    }
  }

  private contentType(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'svg') return 'image/svg+xml';
    if (ext === 'webp') return 'image/webp';
    return 'image/png';
  }
}
