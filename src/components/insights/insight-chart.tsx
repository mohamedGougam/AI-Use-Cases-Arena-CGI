"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#8DC63F", "#1F6F78", "#A8E063", "#4A9BA5", "#6B8E23", "#2D5A63"];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">{children}</CardContent>
    </Card>
  );
}

interface BarChartData {
  name: string;
  value: number;
}

export function InsightBarChart({ data, dataKey = "value" }: { data: BarChartData[]; dataKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="name" tick={{ fill: "#B7C4C8", fontSize: 11 }} />
        <YAxis tick={{ fill: "#B7C4C8", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "#0E2A2F",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey={dataKey} fill="#8DC63F" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function InsightPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#0E2A2F",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function InsightLineChart({
  data,
}: {
  data: { month: string; votes: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="month" tick={{ fill: "#B7C4C8", fontSize: 11 }} />
        <YAxis tick={{ fill: "#B7C4C8", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "#0E2A2F",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        />
        <Line type="monotone" dataKey="votes" stroke="#8DC63F" strokeWidth={2} dot={{ fill: "#8DC63F" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
