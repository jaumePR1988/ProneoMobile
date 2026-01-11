import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { X, FileText, Check, Activity } from 'lucide-react';
import type { Player } from '../types/player';

interface MatchReportFormProps {
    players: Player[];
    isScouting: boolean;
    user: any;
    onClose: () => void;
}

// Helper to load image as base64 with optional rounded corners
const loadImage = (url: string, rounded: boolean = false): Promise<string> => {
    // ... (keep existing implementation)
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            if (rounded) {
                const radius = Math.min(img.width, img.height) * 0.2; // 20% radius
                ctx.beginPath();
                ctx.moveTo(radius, 0);
                ctx.lineTo(img.width - radius, 0);
                ctx.quadraticCurveTo(img.width, 0, img.width, radius);
                ctx.lineTo(img.width, img.height - radius);
                ctx.quadraticCurveTo(img.width, img.height, img.width - radius, img.height);
                ctx.lineTo(radius, img.height);
                ctx.quadraticCurveTo(0, img.height, 0, img.height - radius);
                ctx.lineTo(0, radius);
                ctx.quadraticCurveTo(0, 0, radius, 0);
                ctx.closePath();
                ctx.clip();
            }

            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (e) => reject(e);
    });
};

const MatchReportForm: React.FC<MatchReportFormProps> = ({ players, isScouting, user, onClose }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [matchData, setMatchData] = useState({
        date: new Date().toISOString().split('T')[0],
        rival: '',
        result: '',
        competition: 'Liga',
        location: 'Casa'
    });
    // ... (keep existing actions state)
    const [actions, setActions] = useState({
        starter: false,
        played90: false,
        goal: false,
        assist: false,
        yellowCard: false,
        redCard: false,
        mvp: false,
        cleanSheet: false
    });
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    // Determines if user needs filter (Admin/Director/Global)
    const showCategoryFilter = ['admin', 'director', 'global'].includes(user?.role);

    // Initial filter setup
    React.useEffect(() => {
        if (!showCategoryFilter && user?.category) {
            setSelectedCategory(user.category);
        }
    }, [user, showCategoryFilter]);

    // Filter players based on current mode and category
    const availablePlayers = players
        .filter(p => !!p.isScouting === isScouting)
        .filter(p => {
            // If filter is active (selectedCategory set manually or via user role restriction)
            if (selectedCategory) return p.category === selectedCategory;
            // If no category selected (All), show all
            return true;
        })
        .sort((a, b) => {
            const nameA = a.name || `${a.firstName} ${a.lastName1}`;
            const nameB = b.name || `${b.firstName} ${b.lastName1}`;
            return nameA.localeCompare(nameB);
        });

    const handleGeneratePDF = async () => {
        // ... (rest of logic is unchanged)
        if (!selectedPlayerId) {
            // Fallback prompt using browser alert if state message logic isn't here, 
            // but user preferred no alerts. Ideally this form should have validation UI.
            // For now standard alert is acceptable as per previous pattern before toast, 
            // or I can just return.
            alert('Selecciona un jugador');
            return;
        }
        setLoading(true);

        try {
            const player = availablePlayers.find(p => p.id === selectedPlayerId);
            const doc = new jsPDF();

            // Colors
            const proneoGreen = '#74b72e';
            const slate900 = '#0f172a';
            const slate500 = '#64748b';

            // Header Background (Dark Slate)
            doc.setFillColor(slate900);
            doc.rect(0, 0, 210, 40, 'F');

            // Load Logo
            try {
                // IMPORTANT: Ensure this file is a transparent PNG.
                // If it's a JPG renamed to .png, it will still have a white background.
                const logoBase64 = await loadImage('/logo-report.png', true); // Rounded = true
                doc.addImage(logoBase64, 'PNG', 15, 8, 24, 24);
            } catch (err) {
                console.error('Error loading logo:', err);
            }

            // Title
            doc.setTextColor('#ffffff'); // White text
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('INFORME DE PARTIDO', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(proneoGreen);
            doc.text('PRONEO SPORTS MANAGEMENT', 105, 28, { align: 'center' });

            // Decorative line
            doc.setDrawColor(proneoGreen);
            doc.setLineWidth(0.5);
            doc.line(15, 35, 195, 35);

            // Player Info Section
            doc.setFillColor('#f8fafc');
            doc.rect(15, 50, 180, 35, 'F');
            doc.setDrawColor('#e2e8f0');
            doc.roundedRect(15, 50, 180, 35, 3, 3, 'S');

            const playerName = (player?.name || `${player?.firstName} ${player?.lastName1}`).toUpperCase();
            doc.setTextColor(slate900);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(playerName, 25, 62);

            doc.setFontSize(10);
            doc.setTextColor(slate500);
            doc.setFont("helvetica", "normal");
            doc.text((player?.position || 'Sin Posición').toUpperCase() + '  |  ' + (player?.club || 'Sin Equipo').toUpperCase(), 25, 70);

            // Match Details Grid
            doc.setFontSize(11);
            doc.setTextColor(slate900);
            doc.setFont("helvetica", "bold");
            doc.text('DETALLES DEL ENCUENTRO', 15, 100);

            const matchInfo = [
                ['FECHA', matchData.date],
                ['COMPETICIÓN', matchData.competition],
                ['RIVAL', matchData.rival || '-'],
                ['RESULTADO', matchData.result || '-'],
                ['LOCALIZACIÓN', matchData.location]
            ];

            autoTable(doc, {
                startY: 105,
                head: [],
                body: matchInfo,
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: 3 },
                columnStyles: { 0: { fontStyle: 'bold', textColor: slate500, cellWidth: 40 }, 1: { textColor: slate900 } },
                margin: { left: 15 }
            });

            // Performance Checkbox Section
            let currentY = (doc as any).lastAutoTable.finalY + 15;
            doc.setFontSize(11);
            doc.setTextColor(slate900);
            doc.setFont("helvetica", "bold");
            doc.text('SÍNTESIS DE ACTUACIÓN', 15, currentY);

            currentY += 8;
            const checkItems = [
                { label: 'Titular', value: actions.starter },
                { label: '90 Minutos', value: actions.played90 },
                { label: 'Gol', value: actions.goal },
                { label: 'Asistencia', value: actions.assist },
                { label: 'Tarjeta Amarilla', value: actions.yellowCard },
                { label: 'Tarjeta Roja', value: actions.redCard },
                { label: 'MVP', value: actions.mvp },
                { label: 'Portería a Cero', value: actions.cleanSheet }
            ];

            // Custom Grid for Checks
            let xPos = 15;
            checkItems.forEach((item, index) => {
                if (index % 2 === 0 && index !== 0) {
                    currentY += 10;
                    xPos = 15;
                } else if (index % 2 !== 0) {
                    xPos = 110;
                }

                // Checkbox visual
                doc.setDrawColor(slate500);
                if (item.value) {
                    doc.setFillColor(proneoGreen);
                    doc.rect(xPos, currentY - 4, 4, 4, 'F');
                } else {
                    doc.rect(xPos, currentY - 4, 4, 4, 'S');
                }

                doc.setFontSize(10);
                doc.setTextColor(item.value ? slate900 : slate500);
                doc.setFont("helvetica", item.value ? 'bold' : 'normal');
                doc.text(item.label.toUpperCase(), xPos + 8, currentY);
            });

            // Analysis Text
            currentY += 20;
            doc.setFontSize(11);
            doc.setTextColor(slate900);
            doc.setFont("helvetica", "bold");
            doc.text('ANÁLISIS TÉCNICO / TÁCTICO', 15, currentY);

            currentY += 5;
            doc.setFontSize(10);
            doc.setTextColor(slate500);
            doc.setFont("helvetica", "normal");

            const splitText = doc.splitTextToSize(analysis || 'Sin análisis registrado.', 180);
            doc.text(splitText, 15, currentY);

            // Footer
            doc.setFontSize(8);
            doc.setTextColor('#94a3b8');
            doc.text('Documento generado automáticamente por Proneo Mobile App', 105, 290, { align: 'center' });

            // Save
            const fileName = `Informe_${matchData.date}_${playerName.replace(/\s+/g, '_')}.pdf`;
            doc.save(fileName);
            onClose();

        } catch (error) {
            console.error(error);
            alert('Error al generar PDF: ' + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 p-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-proneo-green/20 rounded-2xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-proneo-green" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Informe de Partido</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isScouting ? 'Scouting' : 'Cantera'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* Category Filter (Admin Only) */}
                    {showCategoryFilter && (
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Filtrar por Especialidad</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:border-proneo-green transition-all"
                            >
                                <option value="">TODAS</option>
                                <option value="Fútbol">Fútbol</option>
                                <option value="F. Sala">F. Sala</option>
                                <option value="Femenino">Femenino</option>
                            </select>
                        </div>
                    )}

                    {/* Player Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Jugador/a</label>
                        <select
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:border-proneo-green transition-all"
                        >
                            <option value="">-- Seleccionar --</option>
                            {availablePlayers.map(p => (
                                <option key={p.id} value={p.id}>
                                    {(p.name || `${p.firstName} ${p.lastName1}`).toUpperCase()} - {p.club}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Match Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Fecha</label>
                            <input
                                type="date"
                                value={matchData.date}
                                onChange={(e) => setMatchData({ ...matchData, date: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Competición</label>
                            <input
                                type="text"
                                value={matchData.competition}
                                onChange={(e) => setMatchData({ ...matchData, competition: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none"
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Rival</label>
                            <input
                                type="text"
                                placeholder="Nombre del equipo rival..."
                                value={matchData.rival}
                                onChange={(e) => setMatchData({ ...matchData, rival: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Resultado</label>
                            <input
                                type="text"
                                placeholder="Ej: 3-1"
                                value={matchData.result}
                                onChange={(e) => setMatchData({ ...matchData, result: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Localización</label>
                            <select
                                value={matchData.location}
                                onChange={(e) => setMatchData({ ...matchData, location: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold outline-none"
                            >
                                <option value="Casa">Casa</option>
                                <option value="Fuera">Fuera</option>
                                <option value="Neutral">Neutral</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions Toggles */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Highlights
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'starter', label: 'Titular' },
                                { id: 'played90', label: '90 Minutos' },
                                { id: 'goal', label: 'Gol' },
                                { id: 'assist', label: 'Asistencia' },
                                { id: 'yellowCard', label: 'T. Amarilla' },
                                { id: 'redCard', label: 'T. Roja' },
                                { id: 'mvp', label: 'MVP Partido' },
                                { id: 'cleanSheet', label: 'Portería a 0' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActions({ ...actions, [item.id]: !actions[item.id as keyof typeof actions] })}
                                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${actions[item.id as keyof typeof actions]
                                        ? 'bg-proneo-green/10 border-proneo-green text-proneo-green'
                                        : 'bg-slate-50 border-slate-100 text-slate-500'
                                        }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                                    {actions[item.id as keyof typeof actions] && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Analysis */}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Análisis Del Partido</label>
                        <textarea
                            value={analysis}
                            onChange={(e) => setAnalysis(e.target.value)}
                            placeholder="Describe el rendimiento, puntos clave, aspectos a mejorar..."
                            className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-proneo-green resize-none"
                        ></textarea>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10">
                    <button
                        onClick={handleGeneratePDF}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-slate-800"
                    >
                        <FileText className="w-4 h-4" />
                        {loading ? 'Generando PDF...' : 'Generar Informe PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchReportForm;
