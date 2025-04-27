"use client";

import { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateHabitStreak, isHabitCompletedOnDate, isHabitCompletedExactDay } from "@/utils/habit-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentEntries, setCurrentEntries] = useState<Entry[]>(entries);
  
  const habit = {
    habit_id: habitId,
    habit_type: habitType,
    interval: interval,
    habit_interval_type: intervalType as 'days' | 'weeks' | 'months' | 'years',
    start_date: startDate,
    is_active: true,
    entries: currentEntries.map(e => ({
      entry_id: e.entry_id,
      datetime: e.datetime,
      entry_type: e.entry_type as 'done' | 'skipped'
    }))
  };
  
  const currentStreak = calculateHabitStreak(habit);
  console.log(currentStreak + "Current Streak");
  
  const startDateObj = new Date(startDate);
  const totalDaysSinceStart = differenceInDays(today, startDateObj) || 1;
  const totalCompletedEntries = currentEntries.filter(e => e.entry_type === "done").length;
  const totalSkippedEntries = currentEntries.filter(e => e.entry_type === "skipped").length;
  
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
  
  const successColor = '#22c55e';
  const skipColor = '#3b82f6';
  const failureColor = '#ef4444';
  
  const completionStats = [
    { name: successLabel, value: successCount, color: successColor },
    { name: 'Kihagyva', value: totalSkippedEntries, color: skipColor },
    { name: failureLabel, value: failureCount, color: failureColor }
  ];

  const filteredCompletionStats = completionStats.filter(item => item.value > 0);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/entries/habit/${habitId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habit_id: habitId,
          time_of_entry: new Date().toISOString(),
          entry_type: "done"
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || "Hiba történt a művelet során");
      }

      const newEntry = responseData.data && responseData.data[0] ? responseData.data[0] : null;
      if (newEntry) {
        setCurrentEntries(prev => [...prev, newEntry]);
      }
    } catch (error) {
      console.error("Failed to complete habit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/entries/habit/${habitId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habit_id: habitId,
          time_of_entry: new Date().toISOString(),
          entry_type: "skipped"
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.error || "Hiba történt a művelet során");
      }

      const newEntry = responseData.data && responseData.data[0] ? responseData.data[0] : null;
      if (newEntry) {
        setCurrentEntries(prev => [...prev, newEntry]);
      }
    } catch (error) {
      console.error("Failed to skip habit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const todayEntry = currentEntries.find(entry => {
    const entryDate = new Date(entry.datetime);
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  });

  const hasCompletedToday = todayEntry?.entry_type === "done";
  const hasSkippedToday = todayEntry?.entry_type === "skipped";
  const hasLoggedToday = hasCompletedToday || hasSkippedToday;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5" />
            Szokás statisztikák {isBadHabit && '(ártó szokás)'}
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
                  {isBadHabit ? (
                    <Ban className="h-8 w-8 text-red-500 mb-2" />
                  ) : (
                    <Clock className="h-8 w-8 text-emerald-500 mb-2" />
                  )}
                  <h3 className="text-lg font-medium">{isBadHabit ? "Összes megszakítás" : "Összes bejegyzés"}</h3>
                  <p className="text-3xl font-bold mt-1">{currentEntries.length}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {!isBadHabit && (
                      <>
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="mr-1 h-3 w-3" /> {totalCompletedEntries}
                        </Badge>
                        <Badge variant="default" className="bg-blue-500">
                          <SkipForward className="mr-1 h-3 w-3" /> {totalSkippedEntries}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Mai bejegyzés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {hasLoggedToday ? (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    {hasCompletedToday ? (
                      <div className="flex flex-col items-center">
                        {isBadHabit ? (
                          <>
                            <Ban className="h-12 w-12 text-red-500 mb-2" />
                            <p className="text-lg font-medium">Az ártó szokás ma megtörtént</p>
                            <p className="text-sm text-muted-foreground mt-1">Újraindíthatod a sorozatot holnap</p>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                            <p className="text-lg font-medium">A szokást a mai napon teljesítetted!</p>
                            <p className="text-sm text-muted-foreground mt-1">Szép munka, folytasd holnap is!</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <SkipForward className="h-12 w-12 text-blue-500 mb-2" />
                        <p className="text-lg font-medium">Ma kihagytad ezt a szokást</p>
                        <p className="text-sm text-muted-foreground mt-1">Holnap újra próbálhatod</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm text-center text-muted-foreground mb-2">
                      {isBadHabit 
                        ? "Megszakítottad ma ennek a szokásnak a mellőzését?"
                        : "Mit szeretnél naplózni a mai napra?"}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        variant={isBadHabit ? "destructive" : "default"}
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="min-w-[140px]"
                      >
                        {isBadHabit ? (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Megtörtént
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Teljesítve
                          </>
                        )}
                      </Button>
                      {!isBadHabit && (
                        <Button
                          variant="outline"
                          onClick={handleSkip}
                          disabled={isLoading}
                          className="min-w-[140px]"
                        >
                          <SkipForward className="mr-2 h-4 w-4" />
                          Kihagyva
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">A legutóbbi 10 nap aktivitása</CardTitle>
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
                                ? data.value ? "Megszakadt" : "Elkerülve"
                                : data.value ? "Teljesítve" : "Nem teljesítve"
                              }
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar 
                      dataKey={d => isBadHabit ? 1 - d.value : d.value}
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
              <CardTitle className="text-base">
                Megoszlás {isBadHabit && '- elkerülés / megtörténés'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                {filteredCompletionStats.length > 0 ? (
                  <div className="h-[220px] w-full max-w-md">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={filteredCompletionStats}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {filteredCompletionStats.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              stroke="rgba(255,255,255,0.3)" 
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const data = payload[0].payload;
                            
                            const percentage = Math.round((data.value / totalDaysSinceStart) * 100);
                            
                            let explanation = '';
                            if (isBadHabit) {
                              if (data.name === successLabel) {
                                explanation = 'Sikeresen elkerülted az ártó szokást';
                              } else if (data.name === failureLabel) {
                                explanation = 'Megtörtént az ártó szokás';
                              } else {
                                explanation = 'Kihagytad a naplózást';
                              }
                            } else {
                              if (data.name === successLabel) {
                                explanation = 'Sikeresen elvégezted a szokást';
                              } else if (data.name === failureLabel) {
                                explanation = 'Elmulasztottad a szokást';
                              } else {
                                explanation = 'Kihagytad a naplózást';
                              }
                            }
                            
                            return (
                              <div className="bg-background border border-border p-3 rounded-md shadow-md max-w-xs">
                                <div className="flex items-center gap-2 mb-1">
                                  <div 
                                    className="h-3 w-3 rounded-full" 
                                    style={{ backgroundColor: data.color }}
                                  />
                                  <p className="font-semibold text-foreground">{data.name}</p>
                                </div>
                                <p className="text-sm font-bold mb-1">
                                  {data.value} nap ({percentage}%)
                                </p>
                                <p className="text-xs text-muted-foreground">{explanation}</p>
                              </div>
                            );
                          }}
                        />
                        <Legend
                          formatter={(value) => (
                            <span className="text-xs">{value}</span>
                          )}
                        />
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
