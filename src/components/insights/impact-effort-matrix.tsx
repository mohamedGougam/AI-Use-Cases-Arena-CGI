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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND } from "@/lib/brand-colors";

interface MatrixPoint {
  id: string;
  title: string;
  impact: number;
  effort: number;
  votes: number;
  score: number;
}

export function ImpactEffortMatrix({ data }: { data: MatrixPoint[] }) {
  return (
    <Card className="glass-card col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Impact vs Effort Matrix</CardTitle>
        <p className="text-sm text-muted">
          Top-right: Quick wins · Top-left: Strategic bets
        </p>
      </CardHeader>
      <CardContent className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              type="number"
              dataKey="effort"
              name="Effort"
              domain={[0.5, 3.5]}
              tick={{ fill: "#B7C4C8" }}
              label={{ value: "Effort →", position: "bottom", fill: "#B7C4C8" }}
            />
            <YAxis
              type="number"
              dataKey="impact"
              name="Impact"
              domain={[0.5, 3.5]}
              tick={{ fill: "#B7C4C8" }}
              label={{ value: "Impact →", angle: -90, position: "left", fill: "#B7C4C8" }}
            />
            <ZAxis type="number" dataKey="votes" range={[80, 400]} />
            <ReferenceLine x={2} stroke={`${BRAND.red}4D`} />
            <ReferenceLine y={2} stroke={`${BRAND.red}4D`} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const p = payload[0].payload as MatrixPoint;
                return (
                  <div className="rounded-lg border border-white/10 bg-card p-3 text-sm shadow-lg">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-muted">Impact: {p.impact} · Effort: {p.effort}</p>
                    <p className="text-primary">Score: {p.score}</p>
                  </div>
                );
              }}
            />
            <Scatter data={data} fill={BRAND.red}>
              {data.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={
                    entry.impact >= 3 && entry.effort <= 1.5
                      ? BRAND.red
                      : entry.impact >= 3 && entry.effort >= 2.5
                        ? BRAND.charcoal
                        : BRAND.coral
                  }
                  fillOpacity={0.8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
