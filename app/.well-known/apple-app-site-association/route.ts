import { readFileSync } from 'fs';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

const SHORTLINK_HOST = process.env.NEXT_PUBLIC_SHORTLINK_HOST ?? 'link.maetry.com';

function normalizeHost(host: string): string {
  return host.replace(/^https?:\/\//, '');
}

function isShortlinkHost(host: string): boolean {
  const normalizedHost = normalizeHost(host);
  const normalizedShortlinkHost = normalizeHost(SHORTLINK_HOST);
  return normalizedHost === normalizedShortlinkHost;
}

export async function GET(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const isShortlink = isShortlinkHost(host);

  // Выбираем нужный файл в зависимости от домена
  const fileName = isShortlink
    ? 'apple-app-site-association-link.json'
    : 'apple-app-site-association-main.json';

  // Читаем статический файл
  const filePath = join(process.cwd(), 'public', '.well-known', fileName);
  const fileContent = readFileSync(filePath, 'utf-8');
  const association = JSON.parse(fileContent);

  return NextResponse.json(association, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600' // Кешируем на 1 час
    }
  });
}

