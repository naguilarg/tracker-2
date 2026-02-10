import { useState } from 'react';
import type { Task } from '../store';
import { useStore } from '../store';
import { EditTaskModal } from '../components/modals/EditTaskModal';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Clock, Edit, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const TasksView = () => {
    const { tasks, projects } = useStore();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState<'all' | 'Nacho' | 'Flo'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesUser = userFilter === 'all' || task.user === userFilter;
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        return matchesSearch && matchesUser && matchesStatus;
    });

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const getProjectName = (projectId?: string) => {
        if (!projectId) return 'Sin proyecto';
        return projects.find(p => p.id === projectId)?.name || 'Desconocido';
    };

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tareas</h2>
                    <p className="text-muted-foreground mt-1">
                        Edita manualmente los tiempos de tus tareas.
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Tarea
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar tareas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={userFilter === 'all' ? 'primary' : 'outline'}
                        onClick={() => setUserFilter('all')}
                        size="sm"
                    >
                        Todos
                    </Button>
                    <Button
                        variant={userFilter === 'Nacho' ? 'primary' : 'outline'}
                        onClick={() => setUserFilter('Nacho')}
                        size="sm"
                    >
                        Nacho
                    </Button>
                    <Button
                        variant={userFilter === 'Flo' ? 'primary' : 'outline'}
                        onClick={() => setUserFilter('Flo')}
                        size="sm"
                    >
                        Flo
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === 'all' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('all')}
                        size="sm"
                    >
                        Todas
                    </Button>
                    <Button
                        variant={statusFilter === 'active' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('active')}
                        size="sm"
                    >
                        Activas
                    </Button>
                    <Button
                        variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('completed')}
                        size="sm"
                    >
                        Completadas
                    </Button>
                </div>
            </div>

            {/* Tasks Table */}
            {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-muted rounded-lg bg-muted/50">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No hay tareas</h3>
                    <p className="text-muted-foreground max-w-sm">
                        No se encontraron tareas con los filtros seleccionados.
                    </p>
                </div>
            ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-3 text-sm font-medium">Tarea</th>
                                    <th className="text-left p-3 text-sm font-medium">Proyecto</th>
                                    <th className="text-left p-3 text-sm font-medium">Usuario</th>
                                    <th className="text-left p-3 text-sm font-medium">Estado</th>
                                    <th className="text-left p-3 text-sm font-medium">Tiempo</th>
                                    <th className="text-left p-3 text-sm font-medium">Sesiones</th>
                                    <th className="text-left p-3 text-sm font-medium">Creada</th>
                                    <th className="text-right p-3 text-sm font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map((task) => (
                                    <tr key={task.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                                        <td className="p-3">
                                            <div className="font-medium">{task.name}</div>
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {getProjectName(task.projectId)}
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${task.user === 'Nacho' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${task.user === 'Nacho' ? 'bg-blue-500' : 'bg-purple-500'
                                                    }`} />
                                                {task.user}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex text-xs px-2 py-1 rounded-full ${task.status === 'active'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                {task.status === 'active' ? 'Activa' : 'Completada'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm font-medium">
                                            {formatTime(Math.floor(task.accumulatedTime / 1000))}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {task.sessions.length}
                                        </td>
                                        <td className="p-3 text-sm text-muted-foreground">
                                            {format(task.createdAt, 'd MMM yyyy', { locale: es })}
                                        </td>
                                        <td className="p-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingTask(task)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditTaskModal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                task={editingTask}
            />
        </div>
    );
};
