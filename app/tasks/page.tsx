"use client";

import { useState, useEffect } from 'react';
import {useAuth} from "@/app/contexts/AuthContext";
import {Task} from "@/app/types/task";
import {TaskPriority, TaskStatus} from "@/app/types/taskStatus";
import {taskService} from "@/app/services/taskService";
import {taskStatusService} from "@/app/services/taskStatusService";
import {taskPriorityService} from "@/app/services/taskPriorityService";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import TasksCalendar from "@/app/components/TasksCalendar";
import TasksTable from "@/app/components/TasksTable";
import SidebarProfile from "@/app/components/SidebarProfile";

type ViewMode = 'table' | 'calendar';

export default function TasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
    const [taskPriorities, setTaskPriorities] = useState<TaskPriority[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('calendar');

    useEffect(() => {
        if (user?.id) {
            loadTasksData();
        }
    }, [user?.id]);

    const loadTasksData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Cargar tareas del usuario
            const userTasks = await taskService.getAllActiveTasks();
            // Filtrar tareas del usuario actual
            const userSpecificTasks = userTasks.filter(task =>
                task.user?.idUser === user?.id || task.IDUserRef === user?.id
            );
            setTasks(userSpecificTasks);

            // Cargar estados de tareas
            const statuses = await taskStatusService.getAllTaskStatuses();
            setTaskStatuses(statuses);

            // Cargar prioridades de tareas
            const priorities = await taskPriorityService.getAllTaskPriorities();
            setTaskPriorities(priorities);

        } catch (error) {
            console.error('Error loading tasks data:', error);
            setError('Error al cargar las tareas. Por favor, intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshTasks = () => {
        loadTasksData();
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="h-screen">
                    <SidebarProfile /> {/* SIDEBAR */}
                    <div className="flex-1 flex flex-col overflow-hidden ml-64">
                        <main className="flex-1 overflow-auto bg-gray-50 p-6">
                            <div className="min-h-[60vh] flex items-center justify-center">
                                <LoadingSpinner size="lg" text="Cargando tareas..." />
                            </div>
                        </main>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="h-screen"> {/* ESTRUCTURA CON SIDEBAR */}
                <SidebarProfile /> {/* SIDEBAR */}

                <div className="flex-1 flex flex-col overflow-hidden ml-64">
                    <main className="flex-1 overflow-auto bg-gray-50 p-6"> {/* ← bg-gray-50 AQUÍ */}
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Mis Tareas</h1>
                                <p className="text-gray-600 mt-2">
                                    Gestiona y organiza todas tus tareas en un solo lugar
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                                            <p className="text-sm text-red-700 mt-1">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* View Mode Toggle - ESTE SE MANTIENE IGUAL */}
                            <div className="mb-6 flex justify-between items-center">
                                <div className="flex space-x-1 bg-white rounded-lg border border-gray-200 p-1">
                                    <button
                                        onClick={() => setViewMode('table')}
                                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                            viewMode === 'table'
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Tabla
                                    </button>
                                    <button
                                        onClick={() => setViewMode('calendar')}
                                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                            viewMode === 'calendar'
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Calendario
                                    </button>
                                </div>

                                <button
                                    onClick={refreshTasks}
                                    className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Actualizar
                                </button>
                            </div>

                            {/* Content - ESTE SE MANTIENE IGUAL */}
                            {viewMode === 'calendar' ? (
                                <TasksCalendar
                                    tasks={tasks}
                                    taskStatuses={taskStatuses}
                                    taskPriorities={taskPriorities}
                                    onTaskUpdate={refreshTasks}
                                />
                            ) : (
                                <TasksTable
                                    tasks={tasks}
                                    taskStatuses={taskStatuses}
                                    taskPriorities={taskPriorities}
                                    onTaskUpdate={refreshTasks}
                                />
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
