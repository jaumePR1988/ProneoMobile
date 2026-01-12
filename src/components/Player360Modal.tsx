import React, { useState } from 'react';
import { X, Save, Printer, Plus, Trash2 } from 'lucide-react';
import type { Player, PlayerSeason } from '../types/player';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface Player360ModalProps {
    player: Player;
    onClose: () => void;
    onUpdate: (updatedPlayer: Player) => void;
}

const Player360Modal: React.FC<Player360ModalProps> = ({ player, onClose, onUpdate }) => {
    const [achievements, setAchievements] = useState(player.achievements || '');
    const [seasons, setSeasons] = useState<PlayerSeason[]>(player.seasons || []);
    const [loading, setLoading] = useState(false);
    const [isEditingSeasons, setIsEditingSeasons] = useState(false);

    // New Season State
    const [newSeason, setNewSeason] = useState<PlayerSeason>({
        season: '2024/25',
        team: '',
        league: ''
    });

    const displayName = player.name || `${player.firstName} ${player.lastName1}`;
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const handleSave = async () => {
        setLoading(true);
        try {
            const playerRef = doc(db, 'players', player.id);
            const updates = {
                achievements,
                seasons
            };

            await updateDoc(playerRef, updates);

            // Update local state via callback
            onUpdate({
                ...player,
                ...updates
            });

            alert('Perfil 360 guardado correctamente');
            // Don't close, user might want to continue editing
        } catch (error) {
            console.error('Error saving player:', error);
            alert('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSeason = () => {
        if (!newSeason.team) return;
        setSeasons([...seasons, newSeason]);
        setNewSeason({ season: '2025/26', team: '', league: '' });
    };

    const removeSeason = (index: number) => {
        const newSeasons = [...seasons];
        newSeasons.splice(index, 1);
        setSeasons(newSeasons);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300">

                {/* LEFT PANEL (GREEN) */}
                <div className="w-full md:w-[400px] bg-[#AEC98E] p-8 flex flex-col relative shrink-0">
                    <div className="absolute top-6 left-6 text-[10px] font-black tracking-widest text-[#4A6330] opacity-50">
                        POWERED BY PRONEO MANAGER
                    </div>

                    <div className="mt-12 flex flex-col items-center">
                        {/* Photo Card */}
                        <div className="w-64 h-64 bg-white p-2 rounded-[32px] shadow-xl rotate-[-2deg] mb-8">
                            <div className="w-full h-full rounded-[24px] overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                {player.photoUrl ? (
                                    <img src={player.photoUrl} className="w-full h-full object-cover" alt={displayName} />
                                ) : (
                                    <span className="text-6xl font-black text-slate-300">{initials}</span>
                                )}
                            </div>
                        </div>

                        {/* Name Block */}
                        <div className="text-center space-y-1">
                            <h2 className="text-4xl font-black text-white italic drop-shadow-md uppercase leading-none">
                                {player.firstName}
                            </h2>
                            <h2 className="text-5xl font-black text-white italic drop-shadow-md uppercase leading-none">
                                {player.lastName1}
                            </h2>
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2 mt-6">
                            <span className="bg-[#4A6330]/20 text-[#2f421f] px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                                {player.position}
                            </span>
                            <span className="bg-[#4A6330]/20 text-[#2f421f] px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                                {player.age} Años
                            </span>
                        </div>

                        {/* Country */}
                        <div className="mt-4 bg-[#E7F0D9] px-6 py-2 rounded-full flex items-center gap-2">
                            <span className="text-lg">🇪🇸</span>
                            <span className="text-xs font-black text-[#4A6330] uppercase tracking-wider">
                                {player.nationality || 'ESPAÑA'}
                            </span>
                        </div>

                        {/* Footer Stats Mockup */}
                        <div className="grid grid-cols-2 gap-4 mt-auto w-full pt-8">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                <p className="text-[9px] font-bold text-[#4A6330] uppercase tracking-widest mb-1">Pierna</p>
                                <p className="text-xl font-black text-[#2f421f] uppercase">{player.preferredFoot || '-'}</p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                <p className="text-[9px] font-bold text-[#4A6330] uppercase tracking-widest mb-1">Internacional</p>
                                <p className="text-xl font-black text-[#2f421f] uppercase">{player.selection ? 'SÍ' : 'NO'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL (WHITE) */}
                <div className="flex-1 bg-white flex flex-col h-full overflow-hidden relative">

                    {/* Header Actions */}
                    <div className="p-6 flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CLUB ACTUAL</p>
                            <div className="flex items-center gap-3">
                                <h3 className="text-3xl font-black text-slate-900 italic uppercase">
                                    {player.club || 'SIN EQUIPO'}
                                </h3>
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded">ESPAÑA</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSave} disabled={loading} className="w-10 h-10 rounded-full bg-[#AEC98E] text-white flex items-center justify-center hover:bg-[#9cbd7d] transition-colors shadow-lg shadow-green-100">
                                <Save className="w-5 h-5" />
                            </button>
                            <button onClick={handlePrint} className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <Printer className="w-5 h-5" />
                            </button>
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 pt-0 grid md:grid-cols-2 gap-8">

                        {/* Achievements Column */}
                        <div className="bg-slate-50 rounded-[32px] p-8 h-fit">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-yellow-500">🏆</span>
                                <h4 className="font-black text-slate-900 uppercase tracking-tight">Palmarés y Logros</h4>
                            </div>
                            <textarea
                                value={achievements}
                                onChange={(e) => setAchievements(e.target.value)}
                                placeholder="Escribe aquí los títulos, premios individuales y logros destacados..."
                                className="w-full bg-transparent border-0 p-0 text-slate-500 font-medium text-sm leading-relaxed resize-none outline-none focus:text-slate-700 min-h-[300px] placeholder:text-slate-300"
                            />
                        </div>

                        {/* Trajectory Column */}
                        <div className="border border-slate-100 rounded-[32px] p-8 h-fit">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <span className="text-blue-500">💼</span>
                                    <h4 className="font-black text-slate-900 uppercase tracking-tight">Trayectoria</h4>
                                </div>
                                <button
                                    onClick={() => setIsEditingSeasons(!isEditingSeasons)}
                                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-0 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-slate-100"></div>

                                {seasons.map((season, index) => (
                                    <div key={index} className="flex gap-6 relative pb-8 last:pb-0 group">
                                        <div className="w-4 h-4 rounded-full bg-slate-200 border-4 border-white shrink-0 relative z-10"></div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-slate-400 mb-1">{season.season}</p>
                                            <h5 className="text-lg font-black text-slate-900 uppercase leading-none mb-1">{season.team}</h5>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{season.league || 'División Desconocida'}</p>
                                                <span className="text-[10px] text-slate-300">•</span>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">0 Partidos</p>
                                            </div>
                                        </div>
                                        {isEditingSeasons && (
                                            <button onClick={() => removeSeason(index)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 p-2">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {isEditingSeasons && (
                                    <div className="bg-slate-50 p-4 rounded-2xl mt-4 space-y-3 border border-slate-200">
                                        <p className="text-xs font-black text-slate-400 uppercase">Añadir Temporada</p>
                                        <input
                                            placeholder="Temporada (Ej: 2023/24)"
                                            value={newSeason.season}
                                            onChange={e => setNewSeason({ ...newSeason, season: e.target.value })}
                                            className="w-full bg-white p-2 rounded-lg text-sm border border-slate-200 outline-none"
                                        />
                                        <input
                                            placeholder="Equipo"
                                            value={newSeason.team}
                                            onChange={e => setNewSeason({ ...newSeason, team: e.target.value })}
                                            className="w-full bg-white p-2 rounded-lg text-sm border border-slate-200 outline-none"
                                        />
                                        <input
                                            placeholder="Liga/División"
                                            value={newSeason.league}
                                            onChange={e => setNewSeason({ ...newSeason, league: e.target.value })}
                                            className="w-full bg-white p-2 rounded-lg text-sm border border-slate-200 outline-none"
                                        />
                                        <button
                                            onClick={handleAddSeason}
                                            className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold uppercase"
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Bottom Info */}
                    <div className="p-8 border-t border-slate-100 grid grid-cols-2 gap-4 bg-white/50 backdrop-blur-md">
                        <div className="border border-slate-100 rounded-2xl p-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fin Contrato</p>
                            <p className="text-2xl font-black text-slate-900">{player.contract?.endDate?.split('-')[0] || '2024'}</p>
                        </div>
                        <div className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cláusula</p>
                                <p className="text-2xl font-black text-slate-900">{player.contract?.clause || '0'} €</p>
                            </div>
                            <span className="text-slate-300">💶</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player360Modal;
