// components/tasks/TasksTable.tsx
"use client";

import { useState } from 'react';
import {Task} from "@/app/types/task";
import {TaskPriority, TaskStatus} from "@/app/types/taskStatus";

interface TasksTableProps {
    tasks: Task[];
    taskStatuses: TaskStatus[];
    taskPriorities: TaskPriority[];
    onTaskUpdate: () => void;
}

type SortField = 'name' | 'startDate' | 'endDate' | 'taskStatus' | 'taskPriority';
type SortDirection = 'asc' | 'desc';

export default function TasksTable({ tasks, taskStatuses, taskPriorities, onTaskUpdate }: TasksTableProps) {
    const [sortField, setSortField] = useState<SortField>('startDate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        let aValue: any = a;
        let bValue: any = b;

        // Navegar por las propiedades anidadas
        if (sortField === 'taskStatus') {
            aValue = a.taskStatus?.name || '';
            bValue = b.taskStatus?.name || '';
        } else if (sortField === 'taskPriority') {
            aValue = a.taskPriority?.name || '';
            bValue = b.taskPriority?.name || '';
        } else {
            aValue = a[sortField];
            bValue = b[sortField];
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const getStatusColor = (statusId?: number) => {
        const status = taskStatuses.find(s => s.idTaskStatus === statusId);
        switch (status?.name?.toLowerCase()) {
            case 'completado':
                return 'bg-green-100 text-green-800';
            case 'en progreso':
                return 'bg-blue-100 text-blue-800';
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priorityId?: number) => {
        const priority = taskPriorities.find(p => p.idTaskPriority === priorityId);
        switch (priority?.name?.toLowerCase()) {
            case 'alta':
                return 'bg-red-100 text-red-800';
            case 'media':
                return 'bg-yellow-100 text-yellow-800';
            case 'baja':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <span className="text-gray-400">↕</span>;
        }
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                    Lista de Tareas ({tasks.length})
                </h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Nombre</span>
                                <SortIcon field="name" />
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('startDate')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Fecha Inicio</span>
                                <SortIcon field="startDate" />
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('endDate')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Fecha Fin</span>
                                <SortIcon field="endDate" />
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('taskStatus')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Estado</span>
                                <SortIcon field="taskStatus" />
                            </div>
                        </th>
                        <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort('taskPriority')}
                        >
                            <div className="flex items-center space-x-1">
                                <span>Prioridad</span>
                                <SortIcon field="taskPriority" />
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progreso
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {sortedTasks.map((task) => (
                        <tr key={task.idTask} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {task.name}
                                        </div>
                                        {task.description && (
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {task.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(task.startDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(task.endDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.IDTaskStatusRef)}`}>
                    {task.taskStatus?.name || 'Sin estado'}
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.IDTaskPriorityRef)}`}>
                    {task.taskPriority?.name || 'Sin prioridad'}
                  </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${task.percentageProgress || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-8">
                      {task.percentageProgress || 0}%
                    </span>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {tasks.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tareas</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No se encontraron tareas asignadas a tu usuario.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}