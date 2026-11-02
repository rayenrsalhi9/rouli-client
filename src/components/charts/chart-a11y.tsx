"use client";

/**
 * Accessible alternatives for charts.
 *
 * A chart SVG is a picture: it conveys shape, not values. Screen readers
 * cannot read a path, so every chart ships a visually hidden data table
 * that carries the same numbers, plus an `aria-label` naming the chart.
 */

export interface ChartA11yData {
  /** Caption of the hidden table — describes what the numbers mean. */
  caption: string;
  /** Column headers, first one being the row label. */
  columns: string[];
  /** Rows of values. */
  rows: (string | number)[][];
}

/**
 * Visually hidden data table that mirrors the chart.
 *
 * `sr-only` keeps it out of the visual layout while leaving it fully
 * available to assistive technology.
 */
export const ChartDataTable: React.FC<ChartA11yData> = ({ caption, columns, rows }) => (
  <div className="sr-only">
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Turn a raw chart datum into a readable cell value. */
export const formatCell = (value: unknown): string | number => {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(value);
  }
  if (typeof value === "number") {
    return new Intl.NumberFormat("fr-FR").format(value);
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

/**
 * Build a table from a chart's data array and the keys worth showing.
 *
 * @param data      The chart's data array.
 * @param labelKey  The key holding the row label (x-axis category).
 * @param valueKeys The keys holding the numeric series.
 */
export const buildChartTable = (
  data: Record<string, unknown>[],
  labelKey: string,
  valueKeys: string[],
  caption: string,
): ChartA11yData => ({
  caption,
  columns: [labelKey, ...valueKeys],
  rows: data.map((datum) => [
    formatCell(datum[labelKey]),
    ...valueKeys.map((key) => formatCell(datum[key])),
  ]),
});
