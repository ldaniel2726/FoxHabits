import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, BarChart, PieChart, TrendingUp, SkipForward } from "lucide-react";
import { cookies } from "next/headers";

async function getStatistics() {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.VERCEL_URL || "localhost:3000";
  const cookieStore = await cookies();
  
  const response = await fetch(`${protocol}://${host}/api/statistics`, {
    credentials: "include",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch statistics:", response.statusText);
    return null;
  }

  return response.json();
}

export default async function Page() {
  const stats = await getStatistics();
  
  const dailyStats = stats ? [
    { 
      title: "Elvégzett szokások aránya a mai napon", 
      value: `${(stats.dailyStats.todayCompletionRate*100).toFixed(2)}%`, 
      change: `${(stats.dailyStats.dayCompletionRateChange*100).toFixed(2)}%`, 
      positive: stats.dailyStats.dayCompletionRateChange > 0 ? true : false 
    },
    { 
      title: "Elvégzett szokások aránya ezen a héten", 
      value: `${(stats.dailyStats.weeklyCompletionRate*100).toFixed(2)}%`, 
      change: `${(stats.dailyStats.weekCompletionRateChange*100).toFixed(2)}%`, 
      positive: stats.dailyStats.weekCompletionRateChange > 0 ? true : false 
    },
    { 
      title: "Elvégzett szokások aránya ebben a hónapban", 
      value: `${(stats.dailyStats.monthlyCompletionRate*100).toFixed(2)}%`, 
      change: `${(stats.dailyStats.monthCompletionRateChange*100).toFixed(2)}%`, 
      positive: stats.dailyStats.monthCompletionRateChange > 0 ? true : false 
    },
  ] : [
    { title: "Elvégzett szokások aránya a mai napon", value: "0%", change: "0%", positive: true },
    { title: "Elvégzett szokások aránya ezen a héten", value: "0%", change: "0%", positive: true },
    { title: "Elvégzett szokások aránya ebben a hónapban", value: "0%", change: "0%", positive: true },
  ];

  const skippedStats = stats ? [
    { 
      title: "Kihagyott szokások száma a mai napon", 
      value: stats.dailyStats.daySkippedCount || 0
    },
    { 
      title: "Kihagyott szokások száma ezen a héten", 
      value: stats.dailyStats.weekSkippedCount || 0
    },
    { 
      title: "Kihagyott szokások száma ebben a hónapban", 
      value: stats.dailyStats.monthSkippedCount || 0
    },
  ] : [
    { title: "Kihagyott szokások száma a mai napon", value: 0 },
    { title: "Kihagyott szokások száma ezen a héten", value: 0 },
    { title: "Kihagyott szokások száma ebben a hónapban", value: 0 },
  ];

  const longestStreak = stats ? {
    name: stats.streaks.longestStreak.habitName || "Nincs adat",
    days: stats.streaks.longestStreak.days || 0
  } : { name: "Nincs adat", days: 0 };

  const currentStreak = stats ? {
    name: stats.streaks.currentStreak.habitName || "Nincs adat",
    days: stats.streaks.currentStreak.days || 0
  } : { name: "Nincs adat", days: 0 };

  const overallStats = stats ? [
    { 
      title: "Mindenkori elvégzett teendők és szokások száma", 
      value: `${stats.overallStats.totalCompletedCount}`, 
      // change: "+0.1%", 
      // positive: true 
    },
    // { 
    //   title: "Mindenkori elhalasztott teendők és szokások száma", 
    //   value: `${stats.overallStats.totalSkippedCount}`, 
    //   change: "+1.5%", 
    //   positive: false 
    // },
  ] : [
    { title: "Mindenkori elvégzett teendők és szokások száma", value: "0", change: "0%", positive: true },
    // { title: "Mindenkori elhalasztott teendők és szokások száma", value: "0", change: "0%", positive: true },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold mb-8">Statisztika</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2 transition transform hover:-translate-y-1 hover:shadow-2xl duration-300">
          <CardContent className="p-6">
            <h2 className="text-2xl font-extrabold mb-4 flex items-center"><BarChart className="mr-2" /> Időszakos Statisztikák</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dailyStats.map((item, index) => (
                <div key={index} className="bg-gray-50 flex flex-col justify-between p-5 rounded-lg border border-gray-200 shadow-md">
                  <p className="text-lg font-medium text-gray-700 mb-1">{item.title}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-2xl font-extrabold">{item.value}</span>
                    <span className={`flex items-center text-base font-semibold ${item.positive ? "text-green-500" : "text-red-500"}`}>
                      {item.positive ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition transform hover:-translate-y-1 hover:shadow-2xl duration-300">
          <CardContent className="p-6">
            <h2 className="text-2xl font-extrabold mb-4 flex items-center"><PieChart className="mr-2" /> Leghosszabb Szokások</h2>
            <div className="space-y-5">
              <div>
                <p className="text-lg font-medium text-gray-700 mb-1">Mindenkori leghosszabban teljesített</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-2xl font-extrabold">{longestStreak.name}</span>
                  <span className="text-2xl font-extrabold text-orange-700">{longestStreak.days} nap</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700 mb-1">Jelenleg is töretlen</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-2xl font-extrabold">{currentStreak.name}</span>
                  <span className="text-2xl font-extrabold text-orange-700">{currentStreak.days} nap</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="transition transform hover:-translate-y-1 hover:shadow-2xl duration-300">
        <CardContent className="p-6">
          <h2 className="text-2xl font-extrabold mb-4 flex items-center"><TrendingUp className="mr-2" /> Összesített Statisztikák</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {overallStats.map((item, index) => (
              <div key={index} className="bg-gray-50 flex flex-col justify-between p-5 rounded-lg border border-gray-200 shadow-md">
                <p className="text-lg font-medium text-gray-700 mb-1">{item.title}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-2xl font-extrabold">{item.value}</span>
                  {/* <span className={`flex items-center text-base font-semibold ${item.positive ? "text-green-500" : "text-red-500"}`}>
                    {item.positive ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                    {item.change}
                  </span> */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
