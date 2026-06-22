"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  ReferenceLine,
  Cell,
  Label,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/brand-colors";
import type { PortfolioUseCase } from "@/lib/portfolio-analytics";

const QUADRANT_COLORS: Record<string, string> = {
  "Quick Wins": BRAND.red,
  "Strategic Investments": "#6366f1",
  "Long-Term Opportunities": BRAND.coral,
  Moonshots: BRAND.charcoal,
};

export function PortfolioValueEffortMatrix({ data }: { data: PortfolioUseCase[] }) {
  const chartData = data.map((p) => ({
    ...p,
    x: p.effortScore,
    y: p.valueScore / 30,
  }));

  return (
    <Card className="glass-card col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Value vs Effort Matrix</CardTitle>
        <p className="text-sm text-muted">
          Quick Wins · Strategic Investments · Long-Term Opportunities · Moonshots
        </p>
      </CardHeader>
      <CardContent className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Effort"
              domain={[0.5, 3.5]}
              tick={{ fill: "#B7C4C8" }}
            >
              <Label value="Effort →" offset={-5} position="insideBottom" fill="#B7C4C8" />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              name="Value"
              domain={[0, 4]}
              tick={{ fill: "#B7C4C8" }}
            >
              <Label value="Value →" angle={-90} position="insideLeft" fill="#B7C4C8" />
            </YAxis>
            <ZAxis type="number" dataKey="readinessScore" range={[60, 400]} />
            <ReferenceLine x={2} stroke={`${BRAND.red}4D`} strokeDasharray="4 4" />
            <ReferenceLine y={2} stroke={`${BRAND.red}4D`} strokeDasharray="4 4" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const p = payload[0].payload as PortfolioUseCase & { y: number };
                return (
                  <div className="rounded-lg border border-white/10 bg-card p-3 text-sm shadow-lg max-w-xs">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-muted mt-1">{p.quadrant}</p>
                    <p className="text-primary">Readiness: {p.readinessScore}%</p>
                    <p className="text-xs text-muted">{p.department}</p>
                  </div>
                );
              }}
            />
            <Scatter data={chartData} fill={BRAND.red}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={QUADRANT_COLORS[entry.quadrant] ?? BRAND.red}
                  fillOpacity={0.85}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
