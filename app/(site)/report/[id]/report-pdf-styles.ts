export const REPORT_PDF_STYLES = String.raw`
        @page {
          size: A4;
          margin: 0;
        }

        .pdf-report-shell {
          width: 210mm;
          background: #fff;
          box-sizing: border-box;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          line-height: 1.3;
          -webkit-font-smoothing: antialiased;
          text-rendering: auto;
          font-kerning: normal;
          font-variant-ligatures: none;
          --pdf-space-1: 4px;
          --pdf-space-2: 8px;
          --pdf-space-3: 12px;
          --pdf-space-4: 16px;
          --pdf-space-5: 20px;
          --pdf-space-6: 24px;
          --pdf-radius-section: 24px;
          --pdf-radius-card: 16px;
          --pdf-radius-pill: 999px;
        }

        .pdf-report-shell *,
        .pdf-report-shell *::before,
        .pdf-report-shell *::after {
          box-sizing: border-box;
        }

        nextjs-portal,
        #__next-build-watcher,
        [data-nextjs-dev-tools-button],
        [data-nextjs-toast],
        [data-nextjs-dialog-overlay],
        [data-nextjs-dialog] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        .pdf-report-shell h1,
        .pdf-report-shell h2,
        .pdf-report-shell h3,
        .pdf-report-shell h4,
        .pdf-report-shell p {
          margin: 0;
        }

        .pdf-document {
          display: flex;
          flex-direction: column;
          gap: 0;
          align-items: stretch;
        }

        .pdf-sheet {
          width: 210mm;
          height: 297mm;
          padding: 16mm 14mm 14mm;
          background: #fff;
          box-shadow: none;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          overflow: hidden;
        }

        .pdf-sheet__body {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-height: 0;
        }

        .pdf-sheet--cover .pdf-sheet__body {
          justify-content: center;
        }

        .pdf-cover {
          display: flex;
          flex: 1;
          flex-direction: column;
          justify-content: space-between;
          gap: 28px;
        }

        .pdf-cover__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0071e3;
        }

        .pdf-cover__eyebrow-dot {
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #0071e3;
        }

        .pdf-cover__brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .pdf-cover__logo {
          width: 82px;
          height: 82px;
        }

        .pdf-cover__brand-name {
          display: inline-flex;
          align-items: stretch;
          height: 82px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0;
          margin: 0;
        }

        .pdf-cover__wordmark {
          display: inline-flex;
          align-items: flex-start;
          height: 82px;
          font-size: 100px;
          line-height: 0.82;
          transform: translateY(-1px);
        }

        .pdf-cover__wordmark > span {
          display: inline-block;
          line-height: 0.82;
        }

        .pdf-cover__wordmark > span:last-child {
          margin-left: 0.04em !important;
        }

        .pdf-cover__hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: 28px;
          align-items: end;
        }

        .pdf-cover__label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6b7280;
        }

        .pdf-cover__title {
          margin-top: 12px;
          font-size: 42px;
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 700;
        }

        .pdf-cover__description {
          margin-top: 16px;
          max-width: 48ch;
          font-size: 15px;
          line-height: 1.65;
          color: #4b5563;
        }

        .pdf-cover__score-card {
          border-radius: 30px;
          background: #f5f5f7;
          padding: 24px;
          text-align: center;
        }

        .pdf-cover__score-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #6b7280;
        }

        .pdf-cover__score-value {
          display: block;
          margin-top: 10px;
          font-size: 72px;
          line-height: 1;
          letter-spacing: -0.05em;
          font-weight: 700;
        }

        .pdf-cover__score-caption {
          display: block;
          margin-top: 6px;
          font-size: 15px;
          color: #6b7280;
        }

        .pdf-page-grid {
          display: grid;
          gap: var(--pdf-space-4);
        }

        .pdf-section {
          border-radius: var(--pdf-radius-section);
          background: #f5f5f7;
          padding: var(--pdf-space-5);
          display: flex;
          flex-direction: column;
        }

        .pdf-section__header {
          display: flex;
          flex-direction: column;
          gap: var(--pdf-space-1);
          margin-bottom: var(--pdf-space-3);
        }

        .pdf-section__title {
          margin: 0;
          font-size: 22px;
          line-height: 1.12;
          font-weight: 700;
          letter-spacing: -0.03em;
        }

        .pdf-section__content {
          display: flex;
          flex-direction: column;
          gap: var(--pdf-space-3);
          flex: 1;
          min-height: 0;
        }

        .pdf-empty-state {
          height: 100%;
          min-height: 72px;
          border-radius: var(--pdf-radius-card);
          background: #fff;
          padding: var(--pdf-space-4);
          display: flex;
          align-items: center;
        }

        .pdf-empty-state p {
          font-size: 14px;
          line-height: 1.5;
          color: #4b5563;
          margin: 0;
        }

        .pdf-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: var(--pdf-space-3);
        }

        .pdf-metrics-grid--five {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }

        .pdf-metrics-grid--two {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .pdf-two-column-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--pdf-space-4);
        }

        .pdf-score-hero {
          border-radius: 0;
          background: transparent;
          padding: 0;
          text-align: center;
        }

        .pdf-score-hero__title {
          font-size: 24px;
          line-height: 1.12;
          font-weight: 700;
          letter-spacing: -0.04em;
        }

        .pdf-score-hero__value-wrap {
          display: inline-flex;
          align-items: flex-end;
          gap: 2px;
          margin-top: var(--pdf-space-3);
        }

        .pdf-score-hero__value {
          font-size: 58px;
          line-height: 0.92;
          letter-spacing: -0.05em;
          font-weight: 700;
        }

        .pdf-score-hero__suffix {
          font-size: 58px;
          line-height: 0.92;
          font-weight: 700;
          letter-spacing: -0.05em;
        }

        .pdf-score-hero__label {
          margin-top: var(--pdf-space-2);
          font-size: 16px;
          color: #1d1d1f;
          line-height: 1.3;
        }

        .pdf-score-hero__track {
          width: 100%;
          height: 13px;
          margin-top: var(--pdf-space-4);
          border-radius: var(--pdf-radius-pill);
          overflow: hidden;
          background: #e7ebf3;
        }

        .pdf-score-hero__fill {
          height: 100%;
          border-radius: var(--pdf-radius-pill);
        }

        .pdf-highlight--score {
          margin-top: var(--pdf-space-4);
          background: #fff;
          border-radius: 14px;
          text-align: left;
        }

        .pdf-quality-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--pdf-space-3);
          margin-bottom: var(--pdf-space-3);
        }

        .pdf-quality-header__label {
          font-size: 13px;
          font-weight: 600;
          color: #1d1d1f;
        }

        .pdf-provider-health {
          display: flex;
          flex-direction: column;
          gap: var(--pdf-space-3);
        }

        .pdf-provider-health__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--pdf-space-3);
          border-radius: 14px;
          background: #fff;
          padding: 11px 14px;
          font-size: 13px;
          line-height: 1.3;
          color: #1d1d1f;
        }

        .pdf-provider-health__row strong {
          font-size: 14px;
          font-weight: 700;
          color: #1d1d1f;
          line-height: 1;
        }

        .pdf-metric-card {
          border-radius: var(--pdf-radius-card);
          background: #fff;
          padding: 13px 14px;
        }

        .pdf-metric-card--score-detail {
          border-radius: 14px;
          background: #fff;
          padding: 10px 12px;
        }

        .pdf-metric-card--market {
          min-height: 92px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 12px 10px;
        }

        .pdf-metric-card--market .pdf-metric-card__label {
          text-align: center;
        }

        .pdf-metric-card__label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          line-height: 1.2;
        }

        .pdf-metric-card__label--score-detail {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0;
          text-transform: none;
          color: #1d1d1f;
          line-height: 1.2;
        }

        .pdf-metric-card__value {
          display: block;
          margin-top: 7px;
          font-size: 24px;
          line-height: 1.08;
          letter-spacing: -0.03em;
          font-weight: 700;
        }

        .pdf-metric-card__value--signal {
          font-size: 16px;
          line-height: 1.2;
          letter-spacing: -0.01em;
          margin-top: 5px;
        }

        .pdf-metric-card--tone-success {
          background: rgba(52, 199, 89, 0.1);
        }

        .pdf-metric-card--tone-warning {
          background: rgba(255, 159, 10, 0.12);
        }

        .pdf-metric-card--tone-error {
          background: rgba(255, 59, 48, 0.1);
        }

        .pdf-metric-card--tone-brand {
          background: rgba(75, 167, 245, 0.1);
        }

        .pdf-metric-card--tone-neutral {
          background: rgba(138, 145, 157, 0.15);
        }

        .pdf-highlight {
          border-radius: var(--pdf-radius-card);
          background: #fff;
          padding: 15px 16px;
        }

        .pdf-highlight p {
          font-size: 13.5px;
          line-height: 1.55;
          color: #1d1d1f;
          margin: 0;
        }

        .pdf-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          overflow: hidden;
          border-radius: var(--pdf-radius-card);
          background: #fff;
        }

        .pdf-table th,
        .pdf-table td {
          border: 1px solid #dde2ea;
          padding: 10px 12px;
          font-size: 12px;
          line-height: 1.35;
          vertical-align: top;
        }

        .pdf-table th {
          background: #e7ebf3;
          font-size: 13px;
          font-weight: 700;
          text-align: left;
        }

        .pdf-table__sub {
          display: block;
          margin-top: 3px;
          color: #6b7280;
          font-size: 10.5px;
        }

        .pdf-provider-head {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .pdf-provider-head__icon {
          width: 13px;
          height: 13px;
          flex: none;
          object-fit: contain;
          display: block;
        }

        .pdf-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--pdf-radius-pill);
          height: 24px;
          padding: 0 10px;
          font-size: 10.5px;
          font-weight: 700;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          vertical-align: middle;
        }

        .pdf-bars {
          display: flex;
          flex-direction: column;
          gap: var(--pdf-space-3);
        }

        .pdf-bars__row {
          border-radius: var(--pdf-radius-card);
          background: #fff;
          padding: 12px 14px;
        }

        .pdf-bars__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--pdf-space-3);
          margin-bottom: var(--pdf-space-2);
        }

        .pdf-bars__label {
          font-size: 13px;
          font-weight: 600;
          color: #1d1d1f;
        }

        .pdf-bars__label--you {
          color: #0071e3;
        }

        .pdf-bars__value {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.2;
        }

        .pdf-bars__track {
          width: 100%;
          height: 12px;
          border-radius: var(--pdf-radius-pill);
          overflow: hidden;
          background: #e7ebf3;
        }

        .pdf-bars__fill {
          height: 100%;
          border-radius: var(--pdf-radius-pill);
          background: #8a919d;
        }

        .pdf-recommendations {
          display: flex;
          flex-direction: column;
          gap: var(--pdf-space-3);
        }

        .pdf-recommendation-card {
          border-radius: var(--pdf-radius-card);
          background: #fff;
          padding: 14px 16px;
          break-inside: avoid;
        }

        .pdf-recommendation-card__copy {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .pdf-recommendation-card h3 {
          font-size: 15px;
          line-height: 1.32;
          font-weight: 700;
        }

        .pdf-recommendation-card p {
          font-size: 13px;
          line-height: 1.45;
          color: #4b5563;
        }

        .pdf-recommendation-card__meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--pdf-space-2);
          margin-top: var(--pdf-space-4);
        }

        .pdf-badge--recommendation {
          height: 25px;
          padding: 0 12px;
          font-size: 11px;
          letter-spacing: 0;
          text-transform: none;
        }

        .pdf-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--pdf-space-3);
          margin-top: var(--pdf-space-3);
          padding-top: 10px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
        }

        .pdf-footer__brand {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .pdf-footer__word {
          font-size: 14px;
          font-weight: 700;
          line-height: 1;
        }

        .pdf-footer__page {
          font-size: 12px;
          color: #6b7280;
          line-height: 1;
        }

        .pdf-cover__logo {
          width: 82px;
          height: 82px;
          flex: none;
        }

        .pdf-market-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--pdf-space-4);
        }

        .pdf-market-column {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--pdf-space-3);
        }

        .pdf-market-title {
          margin-bottom: 0;
          font-size: 14px;
          line-height: 1.25;
          font-weight: 700;
          color: #1d1d1f;
        }

        .pdf-market-title--success {
          color: #34c759;
        }

        .pdf-market-title--error {
          color: #ff3b30;
        }

        .pdf-market-list {
          display: flex;
          flex-direction: column;
          gap: var(--pdf-space-2);
        }

        .pdf-market-item {
          border-radius: 14px;
          background: #fff;
          padding: 10px 12px;
        }

        .pdf-market-item--success {
          background: rgba(52, 199, 89, 0.1);
        }

        .pdf-market-item--error {
          background: rgba(255, 59, 48, 0.1);
        }

        .pdf-market-item__label {
          font-size: 12px;
          line-height: 1.25;
          font-weight: 700;
          color: #1d1d1f;
        }

        .pdf-market-item__text {
          margin-top: 5px;
          font-size: 12px;
          line-height: 1.38;
          color: #4b5563;
        }

        .pdf-market-alternatives {
          margin-top: var(--pdf-space-4);
          display: flex;
          flex-direction: column;
          gap: var(--pdf-space-3);
        }

        .pdf-market-summary {
          margin-top: var(--pdf-space-4);
          display: flex;
          flex-direction: column;
          gap: var(--pdf-space-3);
        }

        @media print {
          .pdf-report-shell {
            background: #fff;
          }

          .pdf-document {
            gap: 0;
          }

          .pdf-sheet {
            box-shadow: none;
            margin: 0;
          }
        }
`;
