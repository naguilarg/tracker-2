import { useState, useEffect } from 'react';
import type { Project } from '../../store';
import { useStore } from '../../store';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
}

export const EditProjectModal = ({ isOpen, onClose, project }: EditProjectModalProps) => {
    const { updateProject, deleteProject } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        deadline: '',
        budgetHours: '',
        status: 'active' as 'active' | 'paused' | 'completed',
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                client: project.client || '',
                deadline: project.deadline || '',
                budgetHours: project.budgetHours?.toString() || '',
                status: project.status,
            });
        }
    }, [project]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !formData.name.trim()) return;

        updateProject(project.id, {
            name: formData.name,
            client: formData.client || undefined,
            deadline: formData.deadline || undefined,
            budgetHours: formData.budgetHours ? parseFloat(formData.budgetHours) : undefined,
            status: formData.status,
        });

        onClose();
    };

    const handleDelete = () => {
        if (!project) return;
        if (confirm(`¿Estás seguro de eliminar el proyecto "${project.name}"? Esto también eliminará todas sus tareas.`)) {
            deleteProject(project.id);
            onClose();
        }
    };

    if (!project) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Proyecto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nombre del proyecto *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <Input
                    label="Cliente / Productor"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />
                    <Input
                        label="Presupuesto (horas)"
                        type="number"
                        step="0.5"
                        value={formData.budgetHours}
                        onChange={(e) => setFormData({ ...formData, budgetHours: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                    >
                        <option value="active">Activo</option>
                        <option value="paused">Pausado</option>
                        <option value="completed">Completado</option>
                    </select>
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        Eliminar Proyecto
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};
