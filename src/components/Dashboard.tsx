import React from 'react';
import { Users, Activity, PlusCircle, Target as TargetIcon, ArrowRight } from 'lucide-react';

const Dashboard = ({ stats, onAddPlayer, onAddScout }: { stats: any, onAddPlayer: () => void, onAddScout: () => void }) => (
    <div className="p-6 space-y-8 animate-in mt-4 fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col gap-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-proneo-green">Panel de Control</p>
            <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Inicio</h2>
        </header>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Users className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Cantera</p>
                    <p className="text-3xl font-black text-slate-900">{stats.canteraCount}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-proneo-green/5 rounded-2xl flex items-center justify-center">
                    <Activity className="text-proneo-green w-6 h-6" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jugadores/as Scouting</p>
                    <p className="text-3xl font-black text-slate-900">{stats.scoutingCount}</p>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <button
                onClick={onAddPlayer}
                className="w-full bg-slate-900 text-white p-6 rounded-[32px] flex items-center justify-between shadow-2xl active:scale-[0.98] transition-all"
            >
                <div className="text-left flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center">
                        <PlusCircle className="w-8 h-8 text-proneo-green" />
                    </div>
                    <div>
                        <p className="font-black text-lg uppercase tracking-tight">Nuevo Jugador/a</p>
                        <p className="font-bold text-slate-400 text-[9px] uppercase tracking-widest opacity-60">Sincronización en tiempo real</p>
                    </div>
                </div>
                <ArrowRight className="w-6 h-6 text-slate-600" />
            </button>

            <button
                onClick={onAddScout}
                className="w-full bg-blue-600 text-white p-6 rounded-[32px] flex items-center justify-between shadow-2xl active:scale-[0.98] transition-all"
            >
                <div className="text-left flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center">
                        <TargetIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="font-black text-lg uppercase tracking-tight">Nuevo Objetivo</p>
                        <p className="font-bold text-blue-100 text-[9px] uppercase tracking-widest opacity-60">Seguimiento y Scouting</p>
                    </div>
                </div>
                <ArrowRight className="w-6 h-6 text-blue-300" />
            </button>
        </div>
    </div>
);

export default Dashboard;
