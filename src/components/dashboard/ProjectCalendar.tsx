import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Generic project schedule data
const deliveryDates: Date[] = [
  new Date(2025, 6, 10), // Jul 10
  new Date(2025, 6, 25), // Jul 25
  new Date(2025, 7, 8),  // Aug 8
  new Date(2025, 7, 22), // Aug 22
  new Date(2025, 8, 5),  // Sep 5
  new Date(2025, 8, 19), // Sep 19
  new Date(2025, 9, 3),  // Oct 3
  new Date(2025, 9, 17), // Oct 17
];

const meetingDates: Date[] = [
  new Date(2025, 6, 15), // Jul 15 - client meeting
  new Date(2025, 7, 12), // Aug 12 - client meeting
  new Date(2025, 8, 9),  // Sep 9  - client meeting
  new Date(2025, 9, 7),  // Oct 7  - client meeting
];

const isSameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() &&
  a.getMonth() === b.getMonth() &&
  a.getFullYear() === b.getFullYear();

const ProjectCalendar = () => {
  const [month, setMonth] = useState<Date>(new Date(2025, 6, 1));

  const isDelivery = (date: Date) => deliveryDates.some((d) => isSameDay(d, date));
  const isMeeting = (date: Date) => meetingDates.some((d) => isSameDay(d, date));

  // Legend counts for current displayed month
  const monthDeliveries = deliveryDates.filter(
    (d) => d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
  ).length;
  const monthMeetings = meetingDates.filter(
    (d) => d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <Card className="bg-card border-none shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Agenda do Projeto
          </h3>

          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            className="p-0 pointer-events-auto"
            classNames={{
              months: "flex flex-col",
              month: "space-y-3",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-semibold text-foreground",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 border border-border rounded-md flex items-center justify-center"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.75rem] text-center",
              row: "flex w-full mt-1",
              cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-muted transition-colors text-sm",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary",
              day_today: "font-bold text-primary",
              day_outside: "text-muted-foreground opacity-40",
              day_disabled: "text-muted-foreground opacity-30",
              day_hidden: "invisible",
            }}
            components={{
              Day: ({ date, displayMonth }) => {
                const outside = date.getMonth() !== displayMonth.getMonth();
                const delivery = isDelivery(date);
                const meeting = isMeeting(date);
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    className={cn(
                      "relative h-9 w-9 flex items-center justify-center rounded-md text-sm font-normal transition-colors",
                      outside && "opacity-30 text-muted-foreground",
                      !outside && "text-foreground hover:bg-muted cursor-default",
                      isToday && "font-bold ring-1 ring-primary",
                      meeting && "bg-red-500/90 text-white hover:bg-red-500 font-semibold",
                      delivery && !meeting && "bg-primary/80 text-primary-foreground hover:bg-primary font-semibold"
                    )}
                  >
                    {date.getDate()}
                    {(delivery || meeting) && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-70" />
                    )}
                  </div>
                );
              },
            }}
          />

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-primary/80 inline-block" />
                <span className="text-muted-foreground">Entrega de relatório</span>
              </div>
              <span className="font-semibold text-foreground">{monthDeliveries} este mês</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
                <span className="text-muted-foreground">Reunião com cliente</span>
              </div>
              <span className="font-semibold text-foreground">{monthMeetings} este mês</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectCalendar;
