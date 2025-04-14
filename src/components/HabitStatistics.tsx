"use client";

import { format, differenceInDays, subDays, eachDayOfInterval } from "date-fns";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  SkipForward, 
  TrendingUp, 
  BarChart4, 
  Flame, 
  Clock,
  PieChart,
  Ban,
  ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateHabitStreak, isHabitCompletedOnDate, isHabitCompletedExactDay } from "@/utils/habit-utils";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, Pie, PieChart as RechartsPie, Cell, ResponsiveContainer, XAxis, Tooltip, Legend } from "recharts";

interface Entry {
  entry_id: number;
  time_of_entry: string;
  entry_type: "done" | "skipped";
  datetime: string;
}

interface HabitStatisticsProps {
  habitId: number;
  habitType: "normal_habit" | "bad_habit";
  habitName: string;
  startDate: string;
  interval: number;
  intervalType: string;
  entries: Entry[];
}

export function HabitStatistics({ 
  habitId, 
  habitType, 
  habitName, 
  startDate, 
  interval, 
  intervalType, 
  entries 
}: HabitStatisticsProps) {
  const today = new Date();
  const isBadHabit = habitType === "bad_habit";
  
  const habit = {
    habit_id: habitId,
    habit_type: habitType,
    interval: interval,
    habit_interval_type: intervalType as 'days' | 'weeks' | 'months' | 'years',
    start_date: startDate,
    is_active: true,
    entries: entries.map(e => ({
      entry_id: e.entry_id,
      datetime: e.datetime,
      entry_type: e.entry_type as 'done' | 'skipped'
    }))
  };
  
  const currentStreak = calculateHabitStreak(habit);
  
  const startDateObj = new Date(startDate);
  const totalDaysSinceStart = differenceInDays(today, startDateObj) || 1;
  const totalCompletedEntries = entries.filter(e => e.entry_type === "done").length;
  const totalSkippedEntries = entries.filter(e => e.entry_type === "skipped").length;
  
  const completionRate = isBadHabit
    ? Math.round(((totalDaysSinceStart - totalCompletedEntries) / totalDaysSinceStart) * 100)
    : Math.round((totalCompletedEntries / totalDaysSinceStart) * 100);
  
  const last30Days = eachDayOfInterval({
    start: subDays(today, 29),
    end: today
  });
  
  const last30DaysActivity = last30Days.map(date => {
    const dateCheck = isHabitCompletedExactDay(habit, date);
    return {
      date: format(date, "MM-dd"),
      status: dateCheck.isSkipped ? 'skipped' : dateCheck.isCompleted ? 'completed' : 'missed'
    };
  });
  
  const recentActivityData = last30DaysActivity.slice(-10).map(day => ({
    name: day.date,
    value: isBadHabit 
      ? day.status === 'completed' ? 0 : 1  
      : day.status === 'completed' ? 1 : 0,
  }));

  const successLabel = isBadHabit ? 'Elkerülve' : 'Teljesítve';
  const failureLabel = isBadHabit ? 'Megtörtént' : 'Elmulasztva';
  const successCount = isBadHabit ? totalDaysSinceStart - totalCompletedEntries : totalCompletedEntries;
  const failureCount = isBadHabit ? totalCompletedEntries : totalDaysSinceStart - totalCompletedEntries - totalSkippedEntries;
  
  const completionStats = [
    { name: successLabel, value: successCount, color: '#22c55e' },
    { name: 'Kihagyva', value: totalSkippedEntries, color: '#3b82f6' },
    { name: failureLabel, value: failureCount, color: '#ef4444' }
  ];

  const filteredCompletionStats = completionStats.filter(item => item.value > 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5" />
            Szokás statisztikák {isBadHabit && '(Káros szokás)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <Flame className="h-8 w-8 text-orange-500 mb-2" />
                  <h3 className="text-lg font-medium">
                    {isBadHabit ? 'Elkerülési sorozat' : 'Jelenlegi sorozat'}
                  </h3>
                  <p className="text-3xl font-bold mt-1">{currentStreak}</p>
                  <p className="text-sm text-muted-foreground mt-1">egymást követő alkalom</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center">
                  {isBadHabit ? (
                    <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2" />
                  ) : (
                    <PieChart className="h-8 w-8 text-blue-500 mb-2" />
                  )}
                  <h3 className="text-lg font-medium">
                    {isBadHabit ? 'Elkerülési arány' : 'Teljesítési arány'}
                  </h3>
                  <p className="text-3xl font-bold mt-1">{completionRate}%</p>
                  <Progress className="w-full mt-2" value={completionRate} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <Clock className="h-8 w-8 text-emerald-500 mb-2" />
                  <h3 className="text-lg font-medium">Összes bejegyzés</h3>
                  <p className="text-3xl font-bold mt-1">{entries.length}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    <Badge variant="default" className={isBadHabit ? "bg-red-500" : "bg-green-500"}>
                      {isBadHabit ? (
                        <><Ban className="mr-1 h-3 w-3" /> {totalCompletedEntries}</>
                      ) : (
                        <><CheckCircle className="mr-1 h-3 w-3" /> {totalCompletedEntries}</>
                      )}
                    </Badge>
                    <Badge variant="default" className="bg-blue-500">
                      <SkipForward className="mr-1 h-3 w-3" /> {totalSkippedEntries}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Utóbbi 10 nap aktivitás</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recentActivityData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <XAxis dataKey="name" />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border border-border p-2 rounded-md shadow-md">
                            <p className="text-xs text-muted-foreground">{data.name}</p>
                            <p className="font-bold text-sm">
                              {isBadHabit
                                ? data.value ? "Elkerülve" : "Megtörtént"
                                : data.value ? "Teljesítve" : "Nem teljesítve"
                              }
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={isBadHabit ? "#10b981" : "#3b82f6"} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Megoszlás</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                {filteredCompletionStats.length > 0 ? (
                  <div className="h-[200px] w-full max-w-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={filteredCompletionStats}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {filteredCompletionStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.2)" />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background border border-border p-2 rounded-md shadow-md">
                                <p className="text-xs text-foreground">{data.name}</p>
                                <p className="font-bold text-sm">
                                  {data.value} ({Math.round((data.value / totalDaysSinceStart) * 100)}%)
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground py-6">Nincs elegendő adat a megoszlás megjelenítéséhez.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
