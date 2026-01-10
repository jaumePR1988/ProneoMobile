import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Users, Edit2, Trash2, X, Check, Shield, Activity } from 'lucide-react';

interface UserData {
    id: string; // email
    role: string;
    sport: string; // 'category' in app state
    firstName?: string;
    lastName?: string;
    category?: string;
    approved?: boolean;
}

const UsersModule = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    // Modal Form States
    const [editForm, setEditForm] = useState({
        role: '',
        sport: ''
    });

    useEffect(() => {
        const q = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as UserData));
            setUsers(usersData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleEditClick = (user: UserData) => {
        setEditingUser(user);
        setEditForm({
            role: user.role || 'scout',
            sport: user.sport || 'Fútbol'
        });
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        try {
            await updateDoc(doc(db, 'users', editingUser.id), {
                role: editForm.role,
                sport: editForm.sport
            });
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Error al actualizar usuario");
        }
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            try {
                await deleteDoc(doc(db, 'users', userId));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Error al eliminar usuario");
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Cargando usuarios...</div>;

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="px-6 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Gestión Usuarios</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Administración</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {users.map(user => (
                        <div key={user.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-extrabold text-slate-900 break-all">{user.id}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' || user.role === 'director' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                        <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600">
                                            {user.sport}
                                        </span>
                                        {user.approved && (
                                            <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Activo
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
                                <button
                                    onClick={() => handleEditClick(user)}
                                    className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 uppercase">Editar Usuario</h3>
                            <button onClick={() => setEditingUser(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Rol</label>
                                <select
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="scout">Scout</option>
                                    <option value="director">Director</option>
                                    <option value="admin">Administrador</option>
                                    <option value="global">Global</option>
                                    <option value="agente">Agente</option>
                                    <option value="tesorero">Tesorero/a</option>
                                    <option value="comunicacion">Comunicación</option>
                                    <option value="scout_externo">Scout Externo</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-2">Especialidad</label>
                                <select
                                    value={editForm.sport}
                                    onChange={(e) => setEditForm({ ...editForm, sport: e.target.value })}
                                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Fútbol">Fútbol</option>
                                    <option value="F. Sala">F. Sala</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Entrenadores">Entrenadores</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSaveEdit}
                                className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold uppercase tracking-widest mt-4 hover:bg-slate-800 active:scale-95 transition-all"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersModule;
