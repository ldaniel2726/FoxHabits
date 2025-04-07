"use client";
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import { HabitCard } from "@/components/habit-card";
import { HabitCardProps } from "@/types/HabitCardProps";

const dayVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Page() {
  const [habitsData, setHabitsData] = useState<{
    [offset: number]: HabitCardProps[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  const today = useMemo(() => new Date(), []);
  const relativeDays = useMemo(() => {
    return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      return {
        offset,
        date,
        label: date.toLocaleDateString("hu-HU", { weekday: "long" }),
        formatted: date.toLocaleDateString("hu-HU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      };
    });
  }, [today]);

  const todayIndex = relativeDays.findIndex((day) => day.offset === 0);
  const [activeDay, setActiveDay] = useState(relativeDays[todayIndex].label);

  const scrollToDay = (index: number) => {
    sectionsRef.current[index]?.scrollIntoView({ behavior: "smooth" });
    setActiveDay(relativeDays[index].label);
  };

  useEffect(() => {
    async function fetchHabitsForAllDays() {
      const fetched: { [offset: number]: HabitCardProps[] } = {};
      for (const day of relativeDays) {
        const isoDate = day.date.toISOString().split("T")[0];
        const response = await fetch(`/api/habits/today?date=${isoDate}`);
        const result = await response.json();
        fetched[day.offset] = result.habits || [];
      }
      setHabitsData(fetched);
      setIsLoading(false);
    }
    fetchHabitsForAllDays();
  }, [relativeDays]);

  useEffect(() => {
    if (Object.keys(habitsData).length > 0) {
      sectionsRef.current[todayIndex]?.scrollIntoView({ behavior: "smooth" });
    }
  }, [habitsData, todayIndex]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    let closestIndex = 0;
    let minDistance = Infinity;
    sectionsRef.current.forEach((section, index) => {
      if (section) {
        const distance = Math.abs(
          section.getBoundingClientRect().top - containerRect.top
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      }
    });
    setActiveDay(relativeDays[closestIndex].label);
  }, [relativeDays]);

  if (isLoading) {
    return (
      <div className="w-full flex absolute top-0 left-0 mt-20 h-[calc(100vh-5rem)] overflow-hidden">
        <aside className="bg-gray-50 p-4 flex flex-col justify-center">
          <div className="space-y-4">
            {relativeDays.map((_, index) => (
              <div key={index} className="w-12 h-12 rounded-full bg-gray-300 animate-pulse"/>
            ))}
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 grid gap-6">
          {relativeDays.map((_, index) => (
            <div key={index} className="min-h-screen snap-start space-y-4">
              <div className="w-1/2 h-8 bg-gray-300 animate-pulse" />
              <div className="w-1/3 h-6 bg-gray-300 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="w-full h-40 p-32 rounded-2xl bg-gray-300 animate-pulse"/>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex absolute top-0 left-0 mt-20 h-[calc(100vh-5rem)] overflow-hidden">
      <aside className="bg-gray-50 p-4 flex flex-col justify-center">
        <div className="space-y-4">
          {relativeDays.map((day, index) => (
            <button
              key={day.offset}
              onClick={() => scrollToDay(index)}
              className={`w-12 h-12 rounded-full flex items-center justify-center hover:shadow-xl duration-300 ${activeDay === day.label ? "text-orange-700 font-bold border-4 border-orange-700" : "border border-gray-500 text-gray-700"}`}
            >{day.label.substring(0, 2).toUpperCase()}
            </button>
          ))}
        </div>
      </aside>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 bg-gray-50 snap-y snap-mandatory"
      >
        {relativeDays.map((day, index) => {
          const habits = habitsData[day.offset] || [];
          return (
            <motion.section
              key={day.offset}
              ref={(el) => { sectionsRef.current[index] = el as HTMLDivElement; }}
              className="min-h-screen pt-12 pb-20 snap-start"
              initial="hidden"
              animate="visible"
              variants={dayVariants}
            >
              <h2 className="text-3xl font-semibold mb-4 text-orange-700 capitalize">
                {day.label}
              </h2>
              <p className="text-lg mb-6 text-gray-500">
                {habits.length} szokás található
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                {habits.map((habit: HabitCardProps) => (
                  <HabitCard key={habit.habit_id} {...habit} />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
