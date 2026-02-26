import { formatCurrency, formatPercent } from '@/utils/format';

type Tone = 'good' | 'watch' | 'risk' | 'neutral';

interface KpiCardProps {
  title: string;
  value: number | null | undefined;
  format: 'currency' | 'percent';
  tone?: Tone;
}

const toneBorder: Record<Tone, string> = {
  good: 'border-l-green-500',
  watch: 'border-l-amber-500',
  risk: 'border-l-red-500',
  neutral: 'border-l-gray-200',
};

export function KpiCard({ title, value, format, tone = 'neutral' }: KpiCardProps) {
  const formatted =
    value == null
      ? '--'
      : format === 'currency'
        ? formatCurrency(value)
        : formatPercent(value);

  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${toneBorder[tone]}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{formatted}</p>
    </div>
  );
}
