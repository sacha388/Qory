import fs from 'node:fs';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { isValidUuid } from '@/lib/security/validation';
import { getAuditAccessCookieName } from '@/lib/security/audit-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function resolveChromeExecutablePath() {
  const explicitPath = process.env.CHROME_BIN || process.env.PUPPETEER_EXECUTABLE_PATH;
  const candidates = [
    explicitPath,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter((value): value is string => Boolean(value));

  return candidates.find((path) => fs.existsSync(path)) || null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const startedAt = Date.now();
  const marks: Record<string, number> = {};
  const mark = (label: string) => {
    marks[label] = Date.now();
  };
  const duration = (from: string, to?: string) => {
    const fromTs = marks[from] ?? startedAt;
    const toTs = to ? (marks[to] ?? Date.now()) : Date.now();
    return Math.max(toTs - fromTs, 0);
  };

  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'ID d’audit invalide' }, { status: 400 });
  }

  const chromePath = resolveChromeExecutablePath();
  if (!chromePath) {
    return NextResponse.json({ error: 'Navigateur Chrome introuvable sur le serveur' }, { status: 500 });
  }

  const sourceParams = request.nextUrl.searchParams;
  const renderParams = new URLSearchParams();
  const sessionId = sourceParams.get('session_id');
  const accessTokenFromQuery = sourceParams.get('t');
  const accessTokenFromCookie = request.cookies.get(getAuditAccessCookieName(id))?.value;
  const accessToken = accessTokenFromQuery || accessTokenFromCookie || null;
  const shareToken = sourceParams.get('st');
  if (sessionId) renderParams.set('session_id', sessionId);
  if (accessToken) renderParams.set('t', accessToken);
  if (shareToken) renderParams.set('st', shareToken);

  const renderUrl = new URL(`/report/${id}/pdf`, request.nextUrl.origin);
  renderUrl.search = renderParams.toString();

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    mark('launch_start');
    browser = await puppeteer.launch({
      headless: true,
      executablePath: chromePath,
      args: [
        '--headless=new',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
      defaultViewport: {
        width: 1240,
        height: 1754,
        deviceScaleFactor: 2,
      },
    });
    mark('launch_done');

    mark('new_page_start');
    const page = await browser.newPage();
    mark('new_page_done');

    mark('goto_start');
    await page.goto(renderUrl.toString(), {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    mark('goto_done');

    mark('wait_render_start');
    await Promise.race([
      page.waitForSelector('[data-report-pdf-document="ready"]', { timeout: 120_000 }),
      page.waitForSelector('[data-report-pdf-document="error"]', { timeout: 120_000 }),
    ]);
    mark('wait_render_done');

    const renderErrorNode = await page.$('[data-report-pdf-document="error"]');
    if (renderErrorNode) {
      const renderErrorMessage = await page
        .$eval(
          '[data-report-pdf-document="error"]',
          (element) => element.getAttribute('data-report-pdf-error-message') || null
        )
        .catch(() => null);
      throw new Error(
        `pdf_render_route_failed${renderErrorMessage ? `: ${renderErrorMessage}` : ''}`
      );
    }

    mark('fonts_start');
    await page.emulateMediaType('screen');
    await page.evaluate(async () => {
      if ('fonts' in document && document.fonts?.ready) {
        await document.fonts.ready;
      }
    });
    mark('fonts_done');

    mark('pdf_start');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });
    mark('pdf_done');

    console.info('server_pdf_generation_timing', {
      auditId: id,
      totalMs: Date.now() - startedAt,
      launchMs: duration('launch_start', 'launch_done'),
      newPageMs: duration('new_page_start', 'new_page_done'),
      gotoMs: duration('goto_start', 'goto_done'),
      renderWaitMs: duration('wait_render_start', 'wait_render_done'),
      fontsMs: duration('fonts_start', 'fonts_done'),
      pdfMs: duration('pdf_start', 'pdf_done'),
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-qory-${id}.pdf"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('server_pdf_generation_failed', {
      auditId: id,
      totalMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'Impossible de générer le PDF pour le moment' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
