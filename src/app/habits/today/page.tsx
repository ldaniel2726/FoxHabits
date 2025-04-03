"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HabitCard } from "@/components/habit-card";
import { HabitCardProps } from "@/types/HabitCardProps";

const dayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Page() {
    const [habitsData, setHabitsData] = useState([]);
    
    useEffect(() => {
      async function fetchHabits() {
        const response = await fetch("/api/habits/today/");
        const result = await response.json();
        setHabitsData(result.habits);
      }
      fetchHabits();
    }, []);

    const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const relativeDays = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
        const date = new Date(today);
        date.setDate(today.getDate() + offset);
        return { 
            offset, 
            label: date.toLocaleDateString("hu-HU", { weekday: "long" }), 
            formatted: date.toLocaleDateString("hu-HU", { day: "numeric", month: "long", year: "numeric" }) 
        };
    });

    const todayIndex = relativeDays.findIndex((day) => day.offset === 0);
    const [activeDay, setActiveDay] = useState(relativeDays[todayIndex].label);

    const scrollToDay = (index: number) => {
        sectionsRef.current[index]?.scrollIntoView({ behavior: "smooth" });
        setActiveDay(relativeDays[index].label);
    };

    useEffect(() => {
        sectionsRef.current[todayIndex]?.scrollIntoView({ behavior: "smooth" });
    }, [todayIndex]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleScroll = () => {
          let closestIndex = 0;
          let minDistance = Infinity;
          const containerRect = container.getBoundingClientRect();
          sectionsRef.current.forEach((section, index) => {
              if (section) {
                  const rect = section.getBoundingClientRect();
                  const distance = Math.abs(rect.top - containerRect.top);
                  if (distance < minDistance) {
                      minDistance = distance;
                      closestIndex = index;
                  }
              }
          });
          setActiveDay(relativeDays[closestIndex].label);
      };

      container.addEventListener("scroll", handleScroll);
      return () => { container.removeEventListener("scroll", handleScroll); };
  }, [relativeDays]);

    const getHabitsForDay = (offset: number) => {
        const day = new Date();
        day.setDate(today.getDate() + offset);
        return habitsData.filter((habit: { start_date: string }) => {
            const habitDate = new Date(habit.start_date);
            return habitDate.toDateString() === day.toDateString();
        });
    };

    return (
        <div className="w-full flex absolute top-0 left-0 pt-20 h-screen overflow-hidden">
          <aside className="bg-gray-50 p-4 flex flex-col justify-center">
            <div className="space-y-4">
              {relativeDays.map((day, index) => (
                <button
                  key={day.offset}
                  onClick={() => scrollToDay(index)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center hover:shadow-xl border transition-colors duration-300 ${
                    activeDay === day.label ? "text-orange-700 font-bold border-orange-700 border-4" : "border-gray-500 text-gray-700"
                  }`}
                >
                  {day.label.substring(0, 2).toUpperCase()}
                </button>
              ))}
            </div>
          </aside>

          <div ref={containerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50 snap-y snap-mandatory">
            {relativeDays.map((day, index) => {
              const habits = getHabitsForDay(day.offset);
              return (
                <motion.section
                  key={day.offset}
                  ref={(el) => { (sectionsRef.current[index] as HTMLElement | null) = el; }}
                  className="min-h-screen pt-12 border-b border-gray-200 snap-start"
                  initial="hidden"
                  animate="visible"
                  variants={dayVariants}
                >
                  <h2 className="text-3xl font-semibold mb-4 text-gray-700 capitalize">{day.label}</h2>
                  <p className="text-lg mb-6 text-gray-500">{habits.length} szokás található</p>
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
