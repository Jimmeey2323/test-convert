
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { yellowApi } from '../../services/yellowApi';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PencilIcon } from '../icons/PencilIcon';

const UserForm: React.FC<{ user?: User | null, onSave: (user: User) => void, onCancel: () => void }> = ({ user, onSave, onCancel }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (user) {
                const updatedUser = await yellowApi.updateUser(user.id, { name, email });
                onSave(updatedUser);
            } else {
                const newUser = await yellowApi.createUser({ name, email });
                onSave(newUser);
            }
        } catch (error) {
            console.error('Failed to save user', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" required />
            </div>
            <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" required />
            </div>
            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="primary">Save User</Button>
            </div>
        </form>
    );
};

const UserManagementView: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedUsers = await yellowApi.getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSaveUser = (savedUser: User) => {
        if(editingUser) {
            setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
        } else {
            setUsers([...users, savedUser]);
        }
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (userId: string) => {
        if(window.confirm('Are you sure you want to delete this user?')) {
            await yellowApi.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        }
    };
    
    const handleBatchDelete = async () => {
        if(selectedUserIds.size === 0) return;
        if(window.confirm(`Are you sure you want to delete ${selectedUserIds.size} selected users?`)) {
            const idsToDelete = Array.from(selectedUserIds);
            await yellowApi.deleteUsers(idsToDelete);
            setUsers(users.filter(u => !idsToDelete.includes(u.id)));
            setSelectedUserIds(new Set());
        }
    };

    const handleSelectUser = (userId: string, isSelected: boolean) => {
        const newSelection = new Set(selectedUserIds);
        if(isSelected) {
            newSelection.add(userId);
        } else {
            newSelection.delete(userId);
        }
        setSelectedUserIds(newSelection);
    };
    
    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedUserIds(new Set(users.map(u => u.id)));
        } else {
            setSelectedUserIds(new Set());
        }
    };

    const allSelected = selectedUserIds.size > 0 && selectedUserIds.size === users.length;


    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
                    <p className="text-text-secondary mt-1">Manage all users on the platform.</p>
                </div>
                <div className="flex gap-4">
                     <Button variant="danger" onClick={handleBatchDelete} disabled={selectedUserIds.size === 0}>
                        <TrashIcon className="w-4 h-4 mr-2" /> Delete Selected ({selectedUserIds.size})
                    </Button>
                    <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>
                        <PlusIcon className="w-4 h-4 mr-2" /> Add New User
                    </Button>
                </div>
            </header>
            
            <div className="bg-surface rounded-lg shadow-lg overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center p-16">Loading users...</div>
                    ) : (
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs text-text-secondary uppercase bg-secondary">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <div className="flex items-center">
                                            <input id="checkbox-all" type="checkbox" checked={allSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary" />
                                            <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">User</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Date Added</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="bg-surface border-b border-gray-700 hover:bg-secondary">
                                        <td className="w-4 p-4">
                                            <div className="flex items-center">
                                                <input id={`checkbox-${user.id}`} type="checkbox" checked={selectedUserIds.has(user.id)} onChange={(e) => handleSelectUser(user.id, e.target.checked)} className="w-4 h-4 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary" />
                                                <label htmlFor={`checkbox-${user.id}`} className="sr-only">checkbox</label>
                                            </div>
                                        </td>
                                        <th scope="row" className="flex items-center px-6 py-4 text-text-primary whitespace-nowrap">
                                            <img className="w-10 h-10 rounded-full" src={user.avatar} alt={`${user.name} avatar`} />
                                            <div className="pl-3">
                                                <div className="text-base font-semibold">{user.name}</div>
                                                <div className="font-normal text-text-secondary">{user.email}</div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className={`h-2.5 w-2.5 rounded-full ${user.lastSeen === 'Online' ? 'bg-green-500' : 'bg-gray-500'} mr-2`}></div> {user.lastSeen}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEdit(user)} className="p-2 text-text-secondary hover:text-primary"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(user.id)} className="p-2 text-text-secondary hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} title={editingUser ? 'Edit User' : 'Add New User'}>
                <UserForm user={editingUser} onSave={handleSaveUser} onCancel={() => { setIsModalOpen(false); setEditingUser(null); }} />
            </Modal>
        </div>
    );
};

export default UserManagementView;
