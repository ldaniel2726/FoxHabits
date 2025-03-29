import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, BarChart, PieChart, TrendingUp } from "lucide-react";

const analyticsData = [
  { title: "Elvégzett szokások aránya a mai napon", value: "86%", change: "+4.5%", positive: true },
  { title: "Elvégzett szokások aránya ezen a héten", value: "31%", change: "-13%", positive: false },
  { title: "Elvégzett szokások aránya ebben a hónapban", value: "90%", change: "+0.5%", positive: true },
];

const overallStats = [
  { title: "Mindenkori elvégzett teendők és szokások száma", value: "1206", change: "+0.1%", positive: true },
  { title: "Mindenkori elhalasztott teendők és szokások száma", value: "8", change: "+1.5%", positive: false },
];

export default function Page() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold mb-8">Analitika</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2 transition transform hover:-translate-y-1 hover:shadow-2xl duration-300">
          <CardContent className="p-6">
            <h2 className="text-2xl font-extrabold mb-4 flex items-center"><BarChart className="mr-2" /> Napi Statisztikák</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {analyticsData.map((item, index) => (
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
                  <span className="text-2xl font-extrabold">Kutyasétáltatás</span>
                  <span className="text-2xl font-extrabold text-orange-700">168 nap</span>
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700 mb-1">Jelenleg is töretlen</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-2xl font-extrabold">Olvasás</span>
                  <span className="text-2xl font-extrabold text-orange-700">19 nap</span>
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
    </div>
  );
}
