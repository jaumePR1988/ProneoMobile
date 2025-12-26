import React, { useState, useEffect, memo } from 'react';
import {
    X, Save, User, Trophy, Building2, Briefcase, Plus, Trash, Camera, Check, ChevronDown, Search, Target
} from 'lucide-react';
import { db, storage } from '../firebase/config';
import { doc, updateDoc, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Player, Category, Position, PreferredFoot, PayerType, ContractYear, DynamicField } from '../types/player';

interface PlayerFormProps {
    initialData?: Player | null;
    isScoutingInit?: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// --- SUB-COMPONENTES OPTIMIZADOS (Fuera del render principal) ---

const SectionHeader = memo(({ id, activeSection, onClick, label, icon: Icon }: {
    id: string,
    activeSection: string,
    onClick: (id: any) => void,
    label: string,
    icon: any
}) => (
    <button
        onClick={() => onClick(id)}
        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${activeSection === id ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]' : 'bg-white text-slate-400 border-slate-100'}`}
    >
        <Icon className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
));

const Label = memo(({ children }: { children: string }) => (
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">{children}</label>
));

const Input = memo((props: React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>) => (
    <div className="bg-proneo-green/[0.03] border border-proneo-green/[0.08] rounded-2xl overflow-hidden focus-within:border-proneo-green focus-within:bg-white focus-within:ring-4 focus-within:ring-proneo-green/5 transition-all shadow-sm">
        {props.type === 'select' ? (
            <select {...(props as any)} className="w-full p-5 bg-transparent outline-none font-bold text-slate-900 appearance-none text-sm" />
        ) : (
            <input {...props} className="w-full p-5 bg-transparent outline-none font-bold text-slate-900 text-sm placeholder:text-slate-300" />
        )}
    </div>
));

const PlayerForm: React.FC<PlayerFormProps> = ({ initialData, isScoutingInit, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState<'personal' | 'sports' | 'contract' | 'agency' | 'finance' | 'scouting' | 'custom'>('personal');
    const [systemLists, setSystemLists] = useState<any>(null);
    const [schema, setSchema] = useState<DynamicField[]>([]);

    const [formData, setFormData] = useState<Partial<Player>>(() => {
        if (initialData) return { ...initialData };
        return {
            firstName: '',
            lastName1: '',
            lastName2: '',
            name: '',
            nationality: 'España',
            birthDate: '',
            age: 0,
            club: '',
            league: '',
            position: 'Ala' as Position,
            preferredFoot: 'Derecha' as PreferredFoot,
            category: 'Fútbol' as Category,
            isScouting: isScoutingInit || false,
            scouting: { status: 'Pendiente', notes: '', currentAgent: '', agentEndDate: '', contractType: '', contractEnd: '', lastContactDate: '' },
            contract: { endDate: '', clause: '', optional: 'No', conditions: '' },
            proneo: { contractDate: '', agencyEndDate: '', commissionPct: 10, payerType: 'Club' as PayerType },
            contractYears: [],
            customFields: {},
            documents: []
        };
    });

    useEffect(() => {
        const unsubLists = onSnapshot(doc(db, 'settings', 'system_lists'), (snapshot) => {
            if (snapshot.exists()) setSystemLists(snapshot.data());
        });

        const unsubSchema = onSnapshot(doc(db, 'settings', 'database_schema'), (snapshot) => {
            if (snapshot.exists()) setSchema(snapshot.data().fields || []);
        });

        return () => { unsubLists(); unsubSchema(); };
    }, []);

    const handleChange = (name: string, value: any) => {
        setFormData(prev => {
            let newState = { ...prev };
            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                newState = {
                    ...prev,
                    [parent]: {
                        ...(prev[parent as keyof typeof prev] as any),
                        [child]: value
                    }
                };
            } else {
                newState = { ...prev, [name]: value };
            }

            if (name === 'firstName' || name === 'lastName1') {
                const fName = name === 'firstName' ? value : newState.firstName || '';
                const lName = name === 'lastName1' ? value : newState.lastName1 || '';
                newState.name = `${fName} ${lName}`.trim();
            }
            return newState;
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const storageRef = ref(storage, `players/${crypto.randomUUID()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            handleChange('photoUrl', url);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error al subir la foto");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.firstName || !formData.lastName1) {
            alert("Nombre y Apellido son obligatorios");
            return;
        }
        setLoading(true);
        try {
            const dataToSave = {
                ...formData,
                updatedAt: Date.now()
            };

            if (initialData?.id) {
                await updateDoc(doc(db, 'players', initialData.id), dataToSave);
            } else {
                await addDoc(collection(db, 'players'), {
                    ...dataToSave,
                    createdAt: Date.now()
                });
            }
            onSuccess();
        } catch (error) {
            console.error("Save error:", error);
            alert("Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex flex-col justify-end">
            <div className="bg-white h-[95vh] rounded-t-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">
                {/* Header Slim */}
                <div className="p-6 flex items-center justify-between border-b border-slate-50">
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-900 rounded-2xl active:scale-95 transition-all">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-none">
                            {initialData ? 'Editar' : 'Nuevo'} <span className="text-proneo-green">Jugador/a</span>
                        </h2>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Professional Hub v2.0</p>
                    </div>
                    <div className="w-12" />
                </div>

                {/* Section Navigation - Horizontal Scroll */}
                <div className="flex gap-3 overflow-x-auto p-6 scrollbar-hide border-b border-slate-50">
                    <SectionHeader id="personal" activeSection={activeSection} onClick={setActiveSection} label="Personal" icon={User} />
                    <SectionHeader id="sports" activeSection={activeSection} onClick={setActiveSection} label="Deporte" icon={Trophy} />
                    <SectionHeader id="contract" activeSection={activeSection} onClick={setActiveSection} label="Club" icon={Building2} />
                    <SectionHeader id="agency" activeSection={activeSection} onClick={setActiveSection} label="Agencia" icon={Briefcase} />
                    {(formData.isScouting || activeSection === 'scouting') && <SectionHeader id="scouting" activeSection={activeSection} onClick={setActiveSection} label="Scouting" icon={Search} />}
                    {!formData.isScouting && <SectionHeader id="finance" activeSection={activeSection} onClick={setActiveSection} label="Economía" icon={Plus} />}
                    {schema.length > 0 && <SectionHeader id="custom" activeSection={activeSection} onClick={setActiveSection} label="Extra" icon={Check} />}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                    {activeSection === 'personal' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex justify-center mb-8 relative">
                                <div className="w-32 h-32 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                    {formData.photoUrl ? (
                                        <img src={formData.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-slate-300" />
                                    )}
                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                        <Camera className="w-6 h-6 text-white" />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label>Nombre</Label>
                                    <Input value={formData.firstName} onChange={(e: any) => handleChange('firstName', e.target.value)} placeholder="Ej: Pablo" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Primer Apellido</Label>
                                        <Input value={formData.lastName1} onChange={(e: any) => handleChange('lastName1', e.target.value)} placeholder="Ape 1" />
                                    </div>
                                    <div>
                                        <Label>Segundo Apellido</Label>
                                        <Input value={formData.lastName2} onChange={(e: any) => handleChange('lastName2', e.target.value)} placeholder="Ape 2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Nacionalidad</Label>
                                        <Input value={formData.nationality} onChange={(e: any) => handleChange('nationality', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Nacimiento</Label>
                                        <Input type="date" value={formData.birthDate} onChange={(e: any) => handleChange('birthDate', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'sports' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <Label>Deporte / Categoría</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Fútbol', 'F. Sala', 'Femenino', 'Entrenadores'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => handleChange('category', cat)}
                                            className={`p-4 rounded-2xl border font-bold text-xs uppercase transition-all ${formData.category === cat ? 'bg-proneo-green text-white border-proneo-green shadow-lg shadow-proneo-green/20' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.isScouting ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                    <Target className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none mb-1">Modo Scouting</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Activar como nuevo objetivo</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.isScouting}
                                        onChange={(e) => handleChange('isScouting', e.target.checked)}
                                    />
                                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div>
                                <Label>Posición</Label>
                                <div className="relative">
                                    <select
                                        value={formData.position}
                                        onChange={(e) => handleChange('position', e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none appearance-none"
                                    >
                                        {!systemLists && <option>Cargando posiciones...</option>}
                                        {systemLists?.positions?.map((p: string) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Pierna Hábil</Label>
                                    <div className="relative">
                                        <select
                                            value={formData.preferredFoot}
                                            onChange={(e) => handleChange('preferredFoot', e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm"
                                        >
                                            {systemLists?.feet?.map((f: string) => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Selección</Label>
                                    <div className="relative">
                                        <select
                                            value={formData.selection || 'No'}
                                            onChange={(e) => handleChange('selection', e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm"
                                        >
                                            {!systemLists && <option>Cargando selecion...</option>}
                                            {systemLists?.selections?.map((s: string) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Marca Deportiva</Label>
                                    <div className="relative">
                                        <select
                                            value={formData.sportsBrand || 'Joma'}
                                            onChange={(e) => handleChange('sportsBrand', e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm"
                                        >
                                            {!systemLists && <option>Cargando marcas...</option>}
                                            {systemLists?.brands?.map((b: string) => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Fin Marca</Label>
                                    <Input type="date" value={formData.sportsBrandEndDate} onChange={(e: any) => handleChange('sportsBrandEndDate', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'contract' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <Label>Equipo Actual</Label>
                                <div className="relative">
                                    <select
                                        value={formData.club}
                                        onChange={(e) => handleChange('club', e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none appearance-none"
                                    >
                                        <option value="">Seleccionar Club</option>
                                        {!systemLists && <option>Cargando clubs...</option>}
                                        {systemLists?.clubs?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div>
                                <Label>Liga / Competición</Label>
                                <div className="relative">
                                    <select
                                        value={formData.league}
                                        onChange={(e) => handleChange('league', e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none appearance-none"
                                    >
                                        <option value="">Seleccionar Liga</option>
                                        {!systemLists && <option>Cargando ligas...</option>}
                                        {systemLists?.leagues?.map((l: string) => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Fin Contrato Club</Label>
                                    <Input type="date" value={formData.contract?.endDate} onChange={(e: any) => handleChange('contract.endDate', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Cláusula (€)</Label>
                                    <Input value={formData.contract?.clause} onChange={(e: any) => handleChange('contract.clause', e.target.value)} placeholder="Ej: 1M" />
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Opcional / Prórroga</Label>
                                    <button
                                        onClick={() => handleChange('contract.optional', formData.contract?.optional === 'Si' ? 'No' : 'Si')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.contract?.optional === 'Si' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-100'}`}
                                    >
                                        {formData.contract?.optional === 'Si' ? 'Activado' : 'Desactivado'}
                                    </button>
                                </div>
                                {formData.contract?.optional === 'Si' && (
                                    <div className="animate-in zoom-in-95 duration-200">
                                        <Label>Fecha límite aviso prórroga</Label>
                                        <Input type="date" value={formData.contract?.optionalNoticeDate} onChange={(e: any) => handleChange('contract.optionalNoticeDate', e.target.value)} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'agency' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <Label>Agente de Seguimiento</Label>
                                <div className="relative">
                                    <select
                                        value={formData.monitoringAgent || ''}
                                        onChange={(e) => handleChange('monitoringAgent', e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none appearance-none"
                                    >
                                        <option value="">Seleccionar Agente</option>
                                        {systemLists?.agents?.map((a: string) => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Inicio Agencia</Label>
                                    <Input type="date" value={formData.proneo?.contractDate} onChange={(e: any) => handleChange('proneo.contractDate', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Fin Agencia</Label>
                                    <Input type="date" value={formData.proneo?.agencyEndDate} onChange={(e: any) => handleChange('proneo.agencyEndDate', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>% Comisión</Label>
                                    <Input type="number" value={formData.proneo?.commissionPct} onChange={(e: any) => handleChange('proneo.commissionPct', parseInt(e.target.value))} />
                                </div>
                                <div>
                                    <Label>Paga comisión</Label>
                                    <div className="relative">
                                        <select
                                            value={formData.proneo?.payerType || 'Club'}
                                            onChange={(e) => handleChange('proneo.payerType', e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm"
                                        >
                                            {['Club', 'Jugador/a', 'Ambos'].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!formData.isScouting && activeSection === 'finance' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center px-4 leading-relaxed">Gestión de temporadas y salarios acordados.</p>

                            {(formData.contractYears || []).map((year, index) => (
                                <div key={year.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4 relative group">
                                    <button
                                        onClick={() => {
                                            const newYears = formData.contractYears?.filter(y => y.id !== year.id);
                                            handleChange('contractYears', newYears);
                                        }}
                                        className="absolute -right-2 -top-2 w-8 h-8 bg-white text-red-400 border border-slate-100 rounded-full flex items-center justify-center shadow-sm"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Temporada</Label>
                                            <Input placeholder="24/25" value={year.year} onChange={(e: any) => {
                                                const newYears = [...(formData.contractYears || [])];
                                                newYears[index] = { ...newYears[index], year: e.target.value };
                                                handleChange('contractYears', newYears);
                                            }} />
                                        </div>
                                        <div>
                                            <Label>Salario (€)</Label>
                                            <Input type="number" value={year.salary} onChange={(e: any) => {
                                                const newYears = [...(formData.contractYears || [])];
                                                newYears[index] = { ...newYears[index], salary: parseInt(e.target.value) };
                                                handleChange('contractYears', newYears);
                                            }} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>% Club</Label>
                                            <Input type="number" value={year.clubCommissionPct} onChange={(e: any) => {
                                                const newYears = [...(formData.contractYears || [])];
                                                newYears[index] = { ...newYears[index], clubCommissionPct: parseInt(e.target.value) };
                                                handleChange('contractYears', newYears);
                                            }} />
                                        </div>
                                        <div>
                                            <Label>% Jugador/a</Label>
                                            <Input type="number" value={year.playerCommissionPct} onChange={(e: any) => {
                                                const newYears = [...(formData.contractYears || [])];
                                                newYears[index] = { ...newYears[index], playerCommissionPct: parseInt(e.target.value) };
                                                handleChange('contractYears', newYears);
                                            }} />
                                        </div>
                                    </div>
                                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                        <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Total Comisión</span>
                                        <span className="text-sm font-black text-proneo-green">
                                            {((year.salary * (year.clubCommissionPct / 100)) + (year.salary * (year.playerCommissionPct / 100))).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => {
                                    const newYear: ContractYear = {
                                        id: crypto.randomUUID(),
                                        year: '',
                                        salary: 0,
                                        clubCommissionPct: 10,
                                        playerCommissionPct: 0,
                                        clubPayment: { status: 'Pendiente', isPaid: false },
                                        playerPayment: { status: 'Pendiente', isPaid: false },
                                        globalStatus: 'Pendiente'
                                    };
                                    handleChange('contractYears', [...(formData.contractYears || []), newYear]);
                                }}
                                className="w-full h-16 border-2 border-dashed border-slate-200 rounded-[28px] flex items-center justify-center gap-3 text-slate-400 font-black text-xs uppercase tracking-widest active:bg-slate-50 transition-all"
                            >
                                <Plus className="w-5 h-5 text-proneo-green" />
                                Añadir Temporada
                            </button>
                        </div>
                    )}

                    {activeSection === 'scouting' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Target className="w-5 h-5 text-blue-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Gestión de Objetivo</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Estado del Seguimiento</Label>
                                        <div className="relative">
                                            <select
                                                value={formData.scouting?.status || 'Pendiente'}
                                                onChange={(e) => handleChange('scouting.status', e.target.value)}
                                                className="w-full p-4 bg-white border border-blue-100 rounded-xl font-bold text-slate-900 outline-none appearance-none text-sm"
                                            >
                                                {['Pendiente', 'Observado', 'Contactado', 'Negociando', 'Descartado'].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Agencia Actual</Label>
                                        <Input
                                            value={formData.scouting?.currentAgent || ''}
                                            onChange={(e: any) => handleChange('scouting.currentAgent', e.target.value)}
                                            placeholder="Ej: Stellar Group"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Fin de Contrato</Label>
                                            <Input
                                                value={formData.scouting?.contractEnd || ''}
                                                onChange={(e: any) => handleChange('scouting.contractEnd', e.target.value)}
                                                placeholder="2026"
                                            />
                                        </div>
                                        <div>
                                            <Label>Último Contacto</Label>
                                            <Input
                                                type="date"
                                                value={formData.scouting?.lastContactDate || ''}
                                                onChange={(e: any) => handleChange('scouting.lastContactDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Notas de Scouting</Label>
                                        <textarea
                                            value={formData.scouting?.notes || ''}
                                            onChange={(e) => handleChange('scouting.notes', e.target.value)}
                                            className="w-full p-5 bg-white border border-blue-100 rounded-2xl outline-none font-bold text-slate-900 text-sm min-h-[120px] placeholder:text-slate-300 shadow-sm"
                                            placeholder="Detalles sobre el seguimiento..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'custom' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {schema.filter(f => f.category === 'General' || f.category === formData.category).map(field => (
                                <div key={field.id}>
                                    <Label>{field.label}</Label>
                                    {field.type === 'boolean' ? (
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Activar</span>
                                            <button
                                                onClick={() => handleChange(`customFields.${field.id}`, !(formData.customFields as any)?.[field.id])}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors ${(formData.customFields as any)?.[field.id] ? 'bg-proneo-green' : 'bg-slate-200'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${(formData.customFields as any)?.[field.id] ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    ) : field.type === 'select' ? (
                                        <div className="relative">
                                            <select
                                                value={(formData.customFields as any)?.[field.id] || ''}
                                                onChange={(e) => handleChange(`customFields.${field.id}`, e.target.value)}
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-900 outline-none appearance-none"
                                            >
                                                <option value=""></option>
                                                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                    ) : (
                                        <Input
                                            type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                                            value={(formData.customFields as any)?.[field.id] || ''}
                                            onChange={(e: any) => handleChange(`customFields.${field.id}`, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-white border-t border-slate-50 flex flex-col gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white h-20 rounded-[30px] font-black uppercase tracking-widest text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                        {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-6 h-6 text-proneo-green" />}
                        {initialData ? 'Actualizar Ficha' : 'Crear Jugador/a'}
                    </button>
                    <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-widest">Los cambios se sincronizarán con ProneoManager PC al instante.</p>
                </div>
            </div>
        </div>
    );
};

export default PlayerForm;
