import { useState } from 'react';
import type { Project } from '../store';
import { useStore } from '../store';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { EditProjectModal } from '../components/modals/EditProjectModal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Plus, Search, Layers, Download } from 'lucide-react';

export const ProjectsView = () => {
    const { projects, tasks } = useStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.client?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const exportToCSV = () => {
        const headers = ['Proyecto', 'Cliente', 'Estado', 'Deadline', 'Presupuesto (h)', 'Tiempo Real (h)', 'Tareas'];
        const rows = projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const totalSeconds = projectTasks.reduce((acc, t) => acc + t.accumulatedTime, 0);
            const totalHours = (totalSeconds / 3600).toFixed(2);

            return [
                project.name,
                project.client || '-',
                project.status === 'active' ? 'Activo' : project.status === 'paused' ? 'Pausado' : 'Completado',
                project.deadline || '-',
                project.budgetHours?.toString() || '-',
                totalHours,
                projectTasks.length.toString()
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `colmillo-proyectos-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
                    <p className="text-muted-foreground mt-1">
                        Gestiona tus trabajos, plazos y presupuestos.
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={exportToCSV} variant="outline" className="flex-1 md:flex-initial">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar CSV
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-initial">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Proyecto
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar proyectos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={statusFilter === 'all' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('all')}
                        size="sm"
                    >
                        Todos
                    </Button>
                    <Button
                        variant={statusFilter === 'active' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('active')}
                        size="sm"
                    >
                        Activos
                    </Button>
                    <Button
                        variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('completed')}
                        size="sm"
                    >
                        Completados
                    </Button>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-muted rounded-lg bg-muted/50">
                    <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No hay proyectos aún</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Empieza creando tu primer proyecto para trackear el tiempo.
                    </p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Proyecto
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            tasks={tasks.filter(t => t.projectId === project.id)}
                            onEdit={(p) => setEditingProject(p)}
                        />
                    ))}
                </div>
            )}

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <EditProjectModal
                isOpen={!!editingProject}
                onClose={() => setEditingProject(null)}
                project={editingProject}
            />
        </div>
    );
};
