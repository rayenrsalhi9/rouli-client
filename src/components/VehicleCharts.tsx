import React, { useMemo } from 'react';
import { Calendar, GraphUp } from 'iconoir-react';
import { BarChart } from './charts/bar-chart';
import { Bar } from './charts/bar';
import { Grid } from './charts/grid';
import { BarXAxis } from './charts/bar-x-axis';
import { ChartTooltip } from './charts/tooltip';
import { CatalogBike } from '../types';
import {
  getVehicleAvailability,
  getVehicleDemandByWeekday,
  getVehicleDemandSummary,
} from '../data/mockData';

const nf = new Intl.NumberFormat('fr-FR');

interface VehicleChartsProps {
  vehicle: CatalogBike;
}

export const VehicleCharts: React.FC<VehicleChartsProps> = ({ vehicle }) => {
  const availability = useMemo(
    () => getVehicleAvailability(vehicle.id),
    [vehicle.id]
  );
  const demand = useMemo(
    () => getVehicleDemandByWeekday(vehicle.id),
    [vehicle.id]
  );
  const demandSummary = useMemo(
    () => getVehicleDemandSummary(vehicle.id),
    [vehicle.id]
  );

  const todayAvailability = availability[0];
  const totalUnits = todayAvailability?.totalUnits ?? vehicle.stockAvailable;

  return (
    <section className="max-w-catalog mx-auto px-4 sm:px-6 mt-12 mb-16">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          Disponibilité et demande
        </h2>
        <p className="text-xs text-neutral-500">
          Unités libres sur 14 jours et jours les plus demandés — pour choisir la
          meilleure date
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Availability bar chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                <span>Disponibilité</span>
              </h3>
              <p className="text-2xs text-neutral-500 mt-0.5">
                Unités libres par jour sur un total de {totalUnits} unités
              </p>
            </div>
            {todayAvailability && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-2xs font-semibold text-brand-ink bg-brand/10 px-3 py-1.5 rounded-full shrink-0">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  {todayAvailability.availableUnits} libres aujourd'hui
                </span>
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-2xs font-medium text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand" />
              Libres
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
              Réservées
            </span>
            <span className="text-neutral-400">14 prochains jours</span>
          </div>

          <div className="relative w-full flex-1 min-h-[260px] mt-2">
            <BarChart
              ariaLabel={`Disponibilité de ${vehicle.name} sur les 14 prochains jours`}
              a11yCaption={`Unités libres et réservées par jour pour ${vehicle.name}, sur un total de ${totalUnits} unités`}
              data={availability}
              xDataKey="label"
              stacked
              stackGap={2}
              className="h-full"
            >
              <Grid horizontal stroke="var(--chart-grid)" />
              <Bar dataKey="availableUnits" fill="var(--color-brand)" />
              <Bar dataKey="bookedUnits" fill="var(--color-neutral-200)" />
              <BarXAxis maxLabels={5} />
              <ChartTooltip
                rows={(point) => [
                  {
                    color: 'var(--color-brand)',
                    label: 'Unités libres',
                    value: `${(point.availableUnits as number) ?? 0} / ${(point.totalUnits as number) ?? 0}`,
                  },
                  {
                    color: 'var(--color-neutral-300)',
                    label: 'Unités réservées',
                    value: (point.bookedUnits as number) ?? 0,
                  },
                ]}
              />
            </BarChart>
          </div>
        </div>

        {/* Weekday demand bar chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <GraphUp className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                <span>Quand réserver ?</span>
              </h3>
              <p className="text-2xs text-neutral-500 mt-0.5">
                Réservations des 90 derniers jours, par jour de la semaine
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-2xs font-semibold text-brand-ink bg-brand/10 px-3 py-1.5 rounded-full shrink-0">
              <span className="tabular-nums">
                {nf.format(demandSummary.total)}
              </span>
              <span>réservations</span>
            </span>
          </div>

          <div className="relative w-full flex-1 min-h-[260px] mt-4">
            <BarChart
              ariaLabel={`Réservations de ${vehicle.name} par jour de la semaine sur 90 jours`}
              a11yCaption="Nombre de réservations par jour de la semaine sur les 90 derniers jours"
              data={demand}
              xDataKey="label"
              className="h-full"
            >
              <Grid horizontal stroke="var(--chart-grid)" />
              <Bar dataKey="reservations" fill="var(--color-brand)" />
              <BarXAxis showAllLabels />
              <ChartTooltip
                rows={(point) => [
                  {
                    color: 'var(--color-brand)',
                    label: 'Réservations',
                    value: (point.reservations as number) ?? 0,
                  },
                ]}
              />
            </BarChart>
          </div>

          <p className="mt-3 pt-4 border-t border-neutral-100 text-2xs font-medium text-neutral-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
            <span>
              Jour le plus demandé :{' '}
              <strong className="font-bold text-neutral-900">
                {demandSummary.busiestDay}
              </strong>{' '}
              · le plus calme :{' '}
              <strong className="font-bold text-neutral-900">
                {demandSummary.calmDay}
              </strong>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};
