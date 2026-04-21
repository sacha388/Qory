'use client';

import { AiSearchIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

type ReportSummaryLoopDemoProps = {
  className?: string;
};

type ModelStatus = 'Cité' | 'Non cité' | 'Partiel';

const REPORT_CARD_SHELL =
  'rounded-[20px] bg-[#F5F5F7]';

const MODEL_STATUS_ROWS = [
  {
    query: 'Audit GEO pour site vitrine',
    openai: 'Cité',
    anthropic: 'Cité',
    perplexity: 'Non cité',
  },
  {
    query: 'Analyse visibilité IA marque',
    openai: 'Cité',
    anthropic: 'Partiel',
    perplexity: 'Cité',
  },
  {
    query: 'Outil audit référencement IA',
    openai: 'Non cité',
    anthropic: 'Cité',
    perplexity: 'Cité',
  },
] as const;

function getStatusClass(status: ModelStatus) {
  if (status === 'Cité') {
    return 'bg-success/20 text-success';
  }

  if (status === 'Partiel') {
    return 'bg-warning/20 text-warning';
  }

  return 'bg-error/20 text-error';
}

export function ReportSummaryLoopDemo({
  className = '',
}: ReportSummaryLoopDemoProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto aspect-[1.18/0.82] w-full max-w-[320px] overflow-hidden rounded-[24px] bg-[#FFFFFF] ${className}`.trim()}
    >
      <div className="relative h-full overflow-hidden px-3 py-3">
        <div className="space-y-3">
          <div className={`${REPORT_CARD_SHELL} relative z-10 p-3`}>
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6B7280]">
                Score global
              </p>
              <p className="mt-1.5 text-[2.2rem] font-semibold leading-none tracking-tight text-[#1D1D1F]">
                74
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full w-[74%] rounded-full bg-[linear-gradient(90deg,#4BA7F5_0%,#2997FF_52%,#5AC8FA_100%)]" />
            </div>
          </div>

          <div className="rounded-lg bg-[#F5F5F7] p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[#4BA7F5]">
                <HugeiconsIcon icon={AiSearchIcon} size={14} strokeWidth={1.9} />
              </span>
              <h3 className="text-[12px] font-bold text-[#1D1D1F]">
                Visibilité par Modèle IA
              </h3>
            </div>

            <div className="-mx-3 mt-3 overflow-hidden">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col className="w-[52%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                </colgroup>
                <thead>
                  <tr className="bg-white">
                    <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-[#1D1D1F]">
                      Requête
                    </th>
                    <th className="px-1 py-1.5 text-center text-[10px] font-semibold text-[#1D1D1F]">
                      <span className="inline-flex items-center justify-center">
                        <img
                          src="/openai.svg?v=3"
                          alt="ChatGPT"
                          className="h-3 w-3 object-contain shrink-0"
                        />
                      </span>
                    </th>
                    <th className="px-1 py-1.5 text-center text-[10px] font-semibold text-[#1D1D1F]">
                      <span className="inline-flex items-center justify-center">
                        <img
                          src="/claude.svg?v=3"
                          alt="Claude"
                          className="h-3 w-3 object-contain shrink-0"
                        />
                      </span>
                    </th>
                    <th className="px-1 py-1.5 text-center text-[10px] font-semibold text-[#1D1D1F]">
                      <span className="inline-flex items-center justify-center">
                        <img
                          src="/perplexity.svg?v=3"
                          alt="Perplexity"
                          className="h-3 w-3 object-contain shrink-0"
                        />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MODEL_STATUS_ROWS.map((row) => (
                    <tr key={row.query} className="align-top">
                      <td className="px-2 py-2 text-[10px] leading-[1.35] text-[#1D1D1F]">
                        <div className="max-w-[104px] whitespace-normal break-words font-medium">
                          {row.query}
                        </div>
                      </td>
                      {[
                        row.openai,
                        row.anthropic,
                        row.perplexity,
                      ].map((status, index) => (
                        <td
                          key={`${row.query}-${index}`}
                          className="px-1.5 py-2 text-center align-top"
                        >
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-1.5 py-1 text-[8px] font-semibold ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 rounded-lg bg-white px-3 py-2">
              <p className="text-[10px] leading-relaxed text-[#6B7280]">
                <span className="font-semibold text-[#1D1D1F]">Résumé :</span> 78% sur ChatGPT,
                71% sur Claude et 63% sur Perplexity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportSummaryLoopDemo;
