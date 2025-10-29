"use client";

import { useState } from 'react';
import {Task} from "@/app/types/task";
import {TaskPriority, TaskStatus} from "@/app/types/taskStatus";

interface TasksCalendarProps {
    tasks: Task[];
    taskStatuses: TaskStatus[];
    taskPriorities: TaskPriority[];
    onTaskUpdate: () => void;
}

export default function TasksCalendar({ tasks, taskStatuses, taskPriorities, onTaskUpdate }: TasksCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        return { firstDay, lastDay, daysInMonth };
    };

    const getTasksForDay = (day: number, month: number, year: number) => {
        return tasks.filter(task => {
            if (!task.startDate) return false;

            const taskDate = new Date(task.startDate);
            return taskDate.getDate() === day &&
                taskDate.getMonth() === month &&
                taskDate.getFullYear() === year;
        });
    };

    const { firstDay, lastDay, daysInMonth } = getDaysInMonth(currentDate);
    const startDay = firstDay.getDay(); // 0 = Domingo, 1 = Lunes, etc.

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getPriorityColor = (priorityId?: number) => {
        const priority = taskPriorities.find(p => p.idTaskPriority === priorityId);
        switch (priority?.name?.toLowerCase()) {
            case 'alta':
                return 'bg-red-500 text-white'; // ✅ ROJO como en la leyenda
            case 'media':
                return 'bg-yellow-500 text-white'; // ✅ AMARILLO como en la leyenda
            case 'baja':
                return 'bg-green-500 text-white'; // ✅ VERDE como en la leyenda
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getStatusColor = (statusId?: number) => {
        const status = taskStatuses.find(s => s.idTaskStatus === statusId);
        switch (status?.name?.toLowerCase()) {
            case 'completado':
                return 'bg-green-500';
            case 'en progreso':
                return 'bg-blue-500';
            case 'pendiente':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before the first day of month */}
                    {Array.from({ length: startDay }).map((_, index) => (
                        <div key={`empty-${index}`} className="h-32 border border-gray-100 rounded-lg bg-gray-50" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const dayTasks = getTasksForDay(day, currentDate.getMonth(), currentDate.getFullYear());
                        const isToday = new Date().getDate() === day &&
                            new Date().getMonth() === currentDate.getMonth() &&
                            new Date().getFullYear() === currentDate.getFullYear();

                        return (
                            <div
                                key={day}
                                className={`h-32 border rounded-lg p-2 overflow-y-auto ${
                                    isToday
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                      isToday ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {day}
                  </span>
                                    {isToday && (
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                </div>

                                {/* Tasks for this day */}
                                <div className="space-y-1">
                                    {dayTasks.slice(0, 3).map(task => (
                                        <div
                                            key={task.idTask}
                                            className={`text-xs p-1 rounded border ${getPriorityColor(task.IDTaskPriorityRef)}`}
                                            title={task.name}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <div
                                                    className={`w-2 h-2 rounded-full ${getStatusColor(task.IDTaskStatusRef)}`}
                                                />
                                                <span className="truncate flex-1">{task.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <div className="text-xs text-gray-500 text-center">
                                            +{dayTasks.length - 3} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
