import React, { useState, useEffect } from 'react';
import {
    Bell,
    AlertTriangle,
    Cake,
    CheckCircle2,
    Check,
    Clock4,
    UserPlus,
    X,
    Settings
} from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Player } from '../types/player';

interface AvisosModuleProps {
    players: Player[];
    userRole: string;
}

const AvisosModule: React.FC<AvisosModuleProps> = ({ players, userRole }) => {
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [showSettings, setShowSettings] = useState(false);
    const [alertSettings, setAlertSettings] = useState(() => {
        const saved = localStorage.getItem('proneo_alert_settings_mobile');
        return saved ? { ...JSON.parse(saved), expirations: true, clauses: true } : {
            approvals: true,
            birthdays: true,
            expirations: true,
            clauses: true
        };
    });
    const [completedAlerts, setCompletedAlerts] = useState<string[]>(() => {
        const saved = localStorage.getItem('proneo_completed_alerts_mobile');
        return saved ? JSON.parse(saved) : [];
    });
    const [snoozedAlerts, setSnoozedAlerts] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('proneo_snoozed_alerts_mobile');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('proneo_alert_settings_mobile', JSON.stringify(alertSettings));
    }, [alertSettings]);

    useEffect(() => {
        localStorage.setItem('proneo_completed_alerts_mobile', JSON.stringify(completedAlerts));
    }, [completedAlerts]);

    useEffect(() => {
        localStorage.setItem('proneo_snoozed_alerts_mobile', JSON.stringify(snoozedAlerts));
    }, [snoozedAlerts]);

    useEffect(() => {
        const q = query(collection(db, 'users'), where('approved', '==', false));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setPendingUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleComplete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCompletedAlerts(prev => [...prev, id]);
    };

    const handleSnooze = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const snoozeUntil = Date.now() + (24 * 60 * 60 * 1000);
        setSnoozedAlerts(prev => ({ ...prev, [id]: snoozeUntil }));
    };

    const handleQuickApprove = async (email: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`¿Aprobar acceso a ${email}?`)) {
            await updateDoc(doc(db, 'users', email), { approved: true, role: 'scout' });
        }
    };

    const handleQuickReject = async (email: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`¿Rechazar y ELIMINAR solicitud de ${email}?`)) {
            await deleteDoc(doc(db, 'users', email));
        }
    };

    let alerts: any[] = [];
    const today = new Date();

    const parseDate = (dateStr?: string) => {
        if (!dateStr) return null;
        if (dateStr.includes('-')) return new Date(dateStr);
        const [d, m, y] = dateStr.split('/');
        return new Date(Number(y), Number(m) - 1, Number(d));
    };

    const getDaysDiff = (date?: Date) => {
        if (!date) return 9999;
        const diff = date.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    // 1. Solicitudes de Usuarios (Solo Directores/Admin)
    if (userRole === 'director' || userRole === 'admin') {
        pendingUsers.forEach(u => {
            alerts.push({
                id: `user-req-${u.id}`,
                type: 'user_approval',
                priority: 'critical',
                title: 'Acceso Pendiente',
                message: `${u.name} solicita acceso al sistema.`,
                player: { name: u.name },
                category: 'Seguridad',
                icon: UserPlus,
                color: 'bg-slate-900',
                data: u
            });
        });
    }

    // 2. Cumpleaños
    players.forEach(p => {
        if (!p.birthDate) return;
        const dob = parseDate(p.birthDate);
        if (!dob) return;

        const isToday = dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const isTomorrow = dob.getDate() === tomorrow.getDate() && dob.getMonth() === tomorrow.getMonth();

        if (isToday || isTomorrow) {
            alerts.push({
                id: `bday-${p.id}`,
                type: 'birthday',
                priority: 'normal',
                title: isToday ? `¡Cumpleaños!` : `Cumpleaños (Mañana)`,
                message: `${p.name} cumple ${today.getFullYear() - dob.getFullYear()} años.`,
                player: p,
                category: p.category || 'Fútbol',
                icon: Cake,
                color: 'bg-purple-500'
            });
        }
    });

    // 3. Fin de Contrato Agencia (< 6 meses)
    players.filter(p => !p.isScouting).forEach(p => {
        const endDate = parseDate(p.proneo?.agencyEndDate);
        if (!endDate) return;
        const days = getDaysDiff(endDate);

        if (days >= 0 && days < 180) {
            alerts.push({
                id: `agency-end-${p.id}`,
                priority: 'high',
                title: 'Renovación Agencia',
                message: `Vence en ${Math.floor(days / 30)} meses (${p.proneo?.agencyEndDate}).`,
                player: p,
                category: p.category || 'Fútbol',
                daysRemaining: days,
                icon: AlertTriangle,
                color: 'bg-red-500'
            });
        }
    });

    // 4. Cláusulas Opcionales
    players.forEach(p => {
        const noticeDate = parseDate(p.contract?.optionalNoticeDate);
        if (!noticeDate) return;
        const days = getDaysDiff(noticeDate);

        if (days >= 0 && days < 60) {
            alerts.push({
                id: `clause-${p.id}`,
                priority: 'critical',
                title: 'Cláusula Opcional',
                message: `Límite: ${p.contract?.optionalNoticeDate} (${days} días).`,
                player: p,
                category: p.category || 'Fútbol',
                daysRemaining: days,
                icon: Bell,
                color: 'bg-red-600 animate-pulse'
            });
        }
    });

    // Filtros por Ajustes
    if (!alertSettings.approvals) alerts = alerts.filter(a => a.type !== 'user_approval');
    if (!alertSettings.birthdays) alerts = alerts.filter(a => a.type !== 'birthday');
    if (!alertSettings.expirations) alerts = alerts.filter(a => a.type !== 'agency_end' && a.id.includes('agency-end'));
    if (!alertSettings.clauses) alerts = alerts.filter(a => a.type !== 'clause' && a.id.includes('clause'));

    // Filtrado de completados y silenciados
    alerts = alerts.filter(a => !completedAlerts.includes(a.id));
    alerts = alerts.filter(a => {
        const snoozeUntil = snoozedAlerts[a.id];
        if (snoozeUntil && Date.now() < snoozeUntil) return false;
        return true;
    });

    if (selectedCategory !== 'Todos') {
        alerts = alerts.filter(a => a.category === selectedCategory);
    }

    alerts.sort((a, b) => {
        const priorityScore: any = { critical: 4, high: 3, normal: 2 };
        return priorityScore[b.priority] - priorityScore[a.priority];
    });

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
            <header className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Avisos</h2>
                        {alerts.length > 0 && (
                            <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                                {alerts.length}
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Notificaciones Críticas</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-3 rounded-2xl transition-all ${showSettings ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                >
                    <Settings className="w-5 h-5" />
                </button>
            </header>

            {showSettings && (
                <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black uppercase text-xs tracking-[0.2em]">Configurar Alertas</h3>
                        <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { id: 'approvals', label: 'Solicitudes de Acceso', icon: UserPlus, mandatory: false },
                            { id: 'birthdays', label: 'Cumpleaños', icon: Cake, mandatory: false },
                            { id: 'expirations', label: 'Vencimientos Agencia', icon: Clock4, mandatory: true },
                            { id: 'clauses', label: 'Cláusulas Críticas', icon: AlertTriangle, mandatory: true },
                        ].map((pref) => (
                            <button
                                key={pref.id}
                                onClick={() => !pref.mandatory && setAlertSettings((prev: any) => ({ ...prev, [pref.id]: !prev[pref.id] }))}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${alertSettings[pref.id] ? 'bg-white/10 border-white/20' : 'border-white/5 opacity-40'} ${pref.mandatory ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <pref.icon className="w-4 h-4 text-proneo-green" />
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest block">{pref.label}</span>
                                        {pref.mandatory && <span className="text-[8px] font-black text-proneo-green uppercase tracking-tighter">Obligatorio</span>}
                                    </div>
                                </div>
                                <div className={`w-10 h-6 rounded-full relative transition-colors ${alertSettings[pref.id] ? 'bg-proneo-green' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alertSettings[pref.id] ? 'right-1' : 'left-1'}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['Todos', 'Fútbol', 'F. Sala', 'Femenino', 'Entrenadores'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                        <CheckCircle2 className="w-12 h-12 text-slate-200 mx-auto" />
                        <p className="font-bold text-slate-300 uppercase text-[10px] tracking-widest">Sin avisos pendientes</p>
                    </div>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} className={`bg-white p-6 rounded-[32px] border flex gap-5 items-start relative overflow-hidden shadow-sm ${alert.priority === 'critical' ? 'border-red-200' : 'border-slate-100'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${alert.color}`}>
                                <alert.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className={`font-black uppercase text-xs tracking-tight ${alert.priority === 'critical' ? 'text-red-600' : 'text-slate-900'}`}>{alert.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{alert.player.name}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={(e) => handleSnooze(alert.id, e)} className="p-2 bg-slate-50 rounded-lg text-slate-300 hover:text-blue-500">
                                            <Clock4 className="w-4 h-4" />
                                        </button>
                                        <button onClick={(e) => handleComplete(alert.id, e)} className="p-2 bg-slate-50 rounded-lg text-slate-300 hover:text-green-500">
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[11px] font-bold uppercase text-slate-500 leading-tight">{alert.message}</p>

                                {alert.type === 'user_approval' && (
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={(e) => handleQuickApprove(alert.data.email, e)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-proneo-green transition-all shadow-md">
                                            Aprobar
                                        </button>
                                        <button onClick={(e) => handleQuickReject(alert.data.email, e)} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest">
                                            Rechazar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AvisosModule;
