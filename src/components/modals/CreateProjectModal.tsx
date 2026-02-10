import { useState } from 'react';
import type { Project } from '../../store';
import { useStore } from '../../store';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
    const { addProject } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        deadline: '',
        budgetHours: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim()) return;

        const newProject: Project = {
            id: crypto.randomUUID(),
            name: formData.name,
            client: formData.client || undefined,
            deadline: formData.deadline || undefined,
            budgetHours: formData.budgetHours ? parseFloat(formData.budgetHours) : undefined,
            status: 'active',
            createdAt: Date.now(),
        };

        addProject(newProject);
        onClose();
        setFormData({ name: '', client: '', deadline: '', budgetHours: '' });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Proyecto">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nombre del proyecto *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ej: Campaña Nike 2026"
                />
                <Input
                    label="Cliente / Productor"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Ej: Agencia X"
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
                        placeholder="Ej: 40"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit">
                        Crear Proyecto
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
