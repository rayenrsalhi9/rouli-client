import React, { useMemo, useState } from 'react';
import { BarChart } from './charts/bar-chart';
import { Bar } from './charts/bar';
import { Grid } from './charts/grid';
import { BarXAxis } from './charts/bar-x-axis';
import { ChartTooltip } from './charts/tooltip';
import {
  getAgencyCalmSummary,
  getAgencyLoadByHour,
  getAgencyLoadByWeekday,
} from '../data/mockData';

interface AgencyLoadChartProps {
  agencyId: string;
}

type LoadMode = 'hour' | 'day';

export const AgencyLoadChart: React.FC<AgencyLoadChartProps> = ({ agencyId }) => {
  const [mode, setMode] = useState<LoadMode>('hour');

  const data = useMemo(
    () => (mode === 'hour' ? getAgencyLoadByHour(agencyId) : getAgencyLoadByWeekday(agencyId)),
    [agencyId, mode]
  );
  const summary = useMemo(() => getAgencyCalmSummary(agencyId), [agencyId]);

  return (
    <div className="mt-5 pt-5 border-t border-neutral-100">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="text-xs font-bold text-neutral-900">Quand réserver ?</h3>
          <p className="text-2xs text-neutral-500 mt-0.5">
            Taux d'occupation estimé — les creux sont les moments les plus calmes
          </p>
        </div>
        <div className="inline-flex rounded-full bg-neutral-100 p-0.5 shrink-0">
          {(['hour', 'day'] as LoadMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-2.5 py-1 text-2xs font-semibold rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${
                mode === m ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {m === 'hour' ? 'Par heure' : 'Par jour'}
            </button>
          ))}
        </div>
      </div>

      <BarChart
        ariaLabel={
          mode === 'hour'
            ? "Taux d'occupation de l'agence par heure"
            : "Taux d'occupation de l'agence par jour de la semaine"
        }
        a11yCaption="Taux d'occupation estimé, en pourcentage"
        data={data}
        xDataKey="label"
        aspectRatio="16 / 9"
      >
        <Grid horizontal stroke="var(--chart-grid)" />
        <Bar dataKey="occupancy" fill="var(--color-brand)" minBarHeight={4} />
        <BarXAxis showAllLabels />
        <ChartTooltip
          rows={(point) => [
            {
              color: 'var(--color-brand)',
              label: mode === 'hour' ? 'Occupation à cette heure' : 'Occupation ce jour',
              value: `${(point.occupancy as number) ?? 0} %`,
            },
          ]}
        />
      </BarChart>

      <p className="mt-2.5 text-2xs text-neutral-600 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
        <span>
          Créneaux les plus calmes : <strong className="font-bold text-neutral-900">{summary.calmHours}</strong> · jour le
          plus calme : <strong className="font-bold text-neutral-900">{summary.calmDay}</strong>
        </span>
      </p>
    </div>
  );
};

export default AgencyLoadChart;
