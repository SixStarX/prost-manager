import { NotFoundException } from '@nestjs/common';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { StorageService } from './storage.service';

// PNG 1×1 transparente.
const PNG_1x1 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

describe('StorageService', () => {
  let dir: string;
  let svc: StorageService;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'prost-storage-'));
    process.env.STORAGE_DIR = dir; // lido no construtor
    svc = new StorageService();
  });

  afterEach(() => {
    delete process.env.STORAGE_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('persistDataUrl grava um dataURL e devolve a chave', async () => {
    const key = await svc.persistDataUrl(
      `data:image/png;base64,${PNG_1x1}`,
      'sig',
    );
    expect(key).toMatch(/^sig-[\w-]+\.png$/);
    expect(existsSync(join(dir, key as string))).toBe(true);

    const { buf, contentType } = await svc.read(key as string);
    expect(contentType).toBe('image/png');
    expect(buf.length).toBeGreaterThan(0);
  });

  it('persistDataUrl deixa passar valores não-dataURL (retrocompatível)', async () => {
    expect(await svc.persistDataUrl('sig-abc.png', 'sig')).toBe('sig-abc.png');
    expect(await svc.persistDataUrl(null, 'sig')).toBeNull();
    expect(await svc.persistDataUrl(undefined, 'sig')).toBeUndefined();
  });

  it('read bloqueia path traversal e chave inexistente', async () => {
    await expect(svc.read('../secret')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(svc.read('nao-existe.png')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
