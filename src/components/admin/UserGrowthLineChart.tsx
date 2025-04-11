"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
import { UserGrowthLineChartProps } from "@/types/UserGrowthLineChartProps";

const chartConfig = {
  users: {
    label: "Felhasználók",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function UserGrowthLineChart({ users }: UserGrowthLineChartProps) {
  const chartData = React.useMemo(() => {
    if (!users?.length) return [];

    const sortedUsers = [...users].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const usersByMonth = sortedUsers.reduce(
      (acc: Record<string, number>, user) => {
        const date = new Date(user.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!acc[monthYear]) {
          acc[monthYear] = 0;
        }

        acc[monthYear]++;
        return acc;
      },
      {}
    );

    let cumulativeTotal = 0;
    const months = Object.keys(usersByMonth).sort();

    return months.map((month) => {
      cumulativeTotal += usersByMonth[month];

      const [year, monthNum] = month.split("-");
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      let monthName = date.toLocaleString("hu-HU", { month: "long" });
      monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      return {
        month: monthName,
        users: cumulativeTotal,
      };
    });
  }, [users]);

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Felhasználók száma</CardTitle>
          <CardDescription>Nincs elegendő adat a megjelenítéshez</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Nincs megjeleníthető adat</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 border-b mb-4">
        <CardTitle>Felhasználók száma</CardTitle>
        <CardDescription>Felhasználók számának alakulása az idő során</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12, top: 5, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="users"
              type="monotone"
              fill="var(--color-users)"
              fillOpacity={0.4}
              stroke="var(--color-users)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none text-muted-foreground">Összesen: {users.length} felhasználó</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
