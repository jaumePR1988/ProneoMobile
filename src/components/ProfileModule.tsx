import React, { useState } from 'react';
import { Camera, Lock, User, Save } from 'lucide-react';
import { updateProfile, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../firebase/config';

interface ProfileModuleProps {
    user: any;
}

const ProfileModule: React.FC<ProfileModuleProps> = ({ user }) => {
    const [name, setName] = useState(user?.displayName || '');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        setLoading(true);
        try {
            await updateProfile(auth.currentUser, { displayName: name });
            if (newPassword) {
                await updatePassword(auth.currentUser, newPassword);
            }
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            setNewPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser) return;

        setLoading(true);
        try {
            const storageRef = ref(storage, `profiles/${auth.currentUser.email}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            await updateProfile(auth.currentUser, { photoURL: url });
            window.location.reload();
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Error al subir imagen: ' + error.message });
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <header>
                <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Mi Perfil</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de Identidad</p>
            </header>

            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <img
                            src={user?.photoURL || 'https://i.pravatar.cc/150'}
                            alt="Profile"
                            className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-50 shadow-lg"
                        />
                        <label className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity cursor-pointer text-white">
                            <Camera className="w-8 h-8" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                    <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Cambiar Foto</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl h-14 pl-12 pr-4 font-bold text-slate-700 outline-none focus:border-proneo-green transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl h-14 pl-12 pr-4 font-bold text-slate-700 outline-none focus:border-proneo-green transition-all"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white h-16 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Sincronizando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileModule;
