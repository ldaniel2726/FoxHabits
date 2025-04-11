"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CompletionPieChartProps } from "@/types/CompletionPieChartProps";

const chartConfig = {
  completion: {
    label: "Teljesítve",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "Függőben",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function CompletionPieChart({ completionRate, activeHabits }: CompletionPieChartProps) {
  const completed = Math.round((completionRate / 100) * activeHabits);
  const pending = activeHabits - completed;

  const chartData = [
    { status: "Teljesítve", value: completed, fill: "var(--color-completion)" },
    { status: "Függőben", value: pending, fill: "var(--color-pending)" },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-right p-3 border-b">
        <CardTitle>Szokások teljesítése</CardTitle>
        <CardDescription>Teljesítési arány: {completionRate.toFixed(1)}%</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">{activeHabits}</tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">Szokás</tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Aktív és teljesített szokások aránya
        </div>
      </CardFooter>
    </Card>
  );
}
