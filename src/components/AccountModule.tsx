import React, { useState } from 'react';
import ProfileModule from './ProfileModule';
import SystemSettings from './SystemSettings';
import { Bell, LogOut, Info, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { auth } from '../firebase/config';


interface AccountModuleProps {
    user: any;
    appVersion: string;
    onTestPush: () => void;
}

const AccountModule: React.FC<AccountModuleProps> = ({ user, appVersion, onTestPush }) => {
    const [showSystemSettings, setShowSystemSettings] = useState(false);
    const isAdmin = ['admin', 'director', 'global', 'agente', 'agent'].includes(user?.role);

    return (
        <div className="pb-32 space-y-2">

            {/* 1. Profile Section */}
            <ProfileModule
                user={{
                    email: user.email,
                    displayName: user.displayName || user.email?.split('@')[0],
                    photoURL: user.photoURL,
                    role: user.role
                }}
            />

            {/* 2. Admin System Settings Section */}
            {isAdmin && (
                <div className="px-6">
                    <button
                        onClick={() => setShowSystemSettings(!showSystemSettings)}
                        className="w-full bg-slate-900 text-white p-6 rounded-[32px] shadow-lg flex items-center justify-between group active:scale-95 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-black uppercase tracking-widest leading-none">Ajustes Admin</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ligas, Clubs, Listas</p>
                            </div>
                        </div>
                        {showSystemSettings ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </button>

                    {showSystemSettings && (
                        <div className="mt-4 bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
                            <SystemSettings />
                        </div>
                    )}
                </div>
            )}

            {/* 3. General Actions */}
            <div className="px-6 pt-4 space-y-4">

                {/* System Info Card */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                            <Info className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Sistema</p>
                            <p className="text-sm font-bold text-slate-600 tracking-tight">Versión {appVersion}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('¿Quieres reiniciar la aplicación para aplicar actualizaciones?')) {
                                window.location.reload();
                            }
                        }}
                        className="bg-slate-50 text-slate-400 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all font-bold text-[10px] uppercase tracking-widest"
                    >
                        Reiniciar
                    </button>
                </div>

                {/* Test Push Button */}
                <button
                    onClick={onTestPush}
                    className="w-full bg-blue-50 text-blue-600 p-5 rounded-[28px] border border-blue-100 flex items-center justify-center gap-3 font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                    <Bell className="w-5 h-5" />
                    <span className="text-[10px]">Probar Notificaciones</span>
                </button>

                {/* Logout Button */}
                <button
                    onClick={() => auth.signOut()}
                    className="w-full bg-red-50 text-red-500 p-6 rounded-[32px] flex items-center justify-center gap-3 font-black uppercase tracking-widest active:scale-95 transition-all hover:bg-red-100 border border-red-50"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>

                <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest pt-4 pb-8">
                    Proneo Mobile &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default AccountModule;
