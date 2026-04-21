'use client';

import { useState } from 'react';
import CommentCaMarcheReportPreviewModal from '@/app/components/comment-ca-marche-report-preview-modal';

type ReportPreviewTriggerProps = {
  className?: string;
};

export default function ReportPreviewTrigger({ className }: ReportPreviewTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          'mt-6 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#050506] transition-colors hover:bg-white/88 sm:h-14 sm:px-7 sm:text-base'
        }
      >
        Voir l’aperçu
      </button>
      <CommentCaMarcheReportPreviewModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
