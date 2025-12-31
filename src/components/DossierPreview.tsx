import { useMemo } from 'react';
import { X, ClipboardList, Camera, Shield, User, Calendar } from 'lucide-react';
import type { Player } from '../types/player';
import { analytics, logEvent } from '../firebase/config';

interface DossierPreviewProps {
    players: Player[];
    onClose: () => void;
    title?: string;
    filterSport?: string;
}

const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const DossierPreview = ({ players, onClose, title = "Dossier Scouting", filterSport = "all" }: DossierPreviewProps) => {
    const scoutingPlayers = useMemo(() => {
        return players.filter(p => {
            const isScouting = p.isScouting;
            const matchesSport = filterSport === "all" || p.category === filterSport;

            if (title === 'Dossier Oportunidades Mercado' || title === 'Oportunidades Mercado') {
                const contractEnd = p.scouting?.contractEnd || '';
                const isExpiring = contractEnd.includes('2025') || contractEnd.includes('2026');
                return isScouting && matchesSport && isExpiring;
            }

            return isScouting && matchesSport;
        });
    }, [players, title, filterSport]);

    const isMarketReport = title.includes('Oportunidades');

    return (
        <div className="fixed inset-0 bg-slate-50 z-[60] overflow-y-auto animate-in fade-in duration-300">
            {/* Barra de Acciones Superior (Sticky) */}
            <div className="sticky top-0 z-[70] bg-slate-900 shadow-xl p-4 flex justify-between items-center no-print border-b border-white/5">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-white font-bold uppercase text-[10px] tracking-widest bg-white/10 px-4 py-2.5 rounded-xl active:scale-95 transition-all"
                >
                    <X className="w-4 h-4" />
                    Cerrar
                </button>
                <button
                    onClick={() => {
                        if (analytics) {
                            logEvent(analytics, 'generate_report', {
                                report_type: title,
                                sport: filterSport
                            });
                        }
                        window.print();
                    }}
                    className={`flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest px-6 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all ${isMarketReport ? 'bg-emerald-600 shadow-emerald-900/40' : 'bg-blue-600 shadow-blue-900/40'}`}
                >
                    <ClipboardList className="w-4 h-4" />
                    Guardar PDF / Enviar
                </button>
            </div>

            <div className="max-w-4xl mx-auto min-h-screen bg-white shadow-2xl overflow-hidden print:shadow-none">
                {/* Cabecera Estilo PC */}
                <header className={`p-10 relative overflow-hidden text-white ${isMarketReport ? 'bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900' : 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'}`}>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                                {isMarketReport ? (
                                    <>OPORTUNIDADES <span className="text-emerald-400">DE MERCADO</span></>
                                ) : (
                                    <>INFORME <span className="text-blue-400">DE SCOUTING</span></>
                                )}
                            </h1>
                            <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">
                                <span>{isMarketReport ? 'FIN DE CONTRATO 2025/2026' : 'TALENTO & SEGUIMIENTO 2025/2026'}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                <span className={isMarketReport ? 'text-emerald-400' : 'text-blue-400'}>{filterSport === 'all' ? 'TODOS' : filterSport}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black tracking-widest uppercase opacity-40">SPORTS MANAGEMENT</p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                </header>

                <div className="p-8 space-y-6">
                    <div className="grid gap-4">
                        {scoutingPlayers.length > 0 ? (
                            scoutingPlayers.map(player => (
                                <div key={player.id} className="bg-white border border-slate-100 rounded-[32px] p-6 flex gap-6 items-center shadow-sm relative overflow-hidden transition-all">
                                    <div className="w-24 h-24 bg-slate-50 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-100">
                                        {player.photoUrl ? (
                                            <img src={player.photoUrl} className="w-full h-full object-cover" alt={player.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <Camera className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-xl font-black uppercase text-slate-900 leading-none">{player.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">{player.lastName1} {player.lastName2 || ''}</p>
                                            </div>
                                            <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shrink-0">
                                                {calculateAge(player.birthDate)} AÑOS
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <div className="w-5 h-5 flex items-center justify-center bg-slate-50 rounded-lg"><Shield className="w-3 h-3" /></div>
                                                <span className="text-[10px] font-bold uppercase">{player.club || 'SIN CLUB'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <div className="w-5 h-5 flex items-center justify-center bg-slate-50 rounded-lg"><User className="w-3 h-3" /></div>
                                                <span className="text-[10px] font-bold uppercase">{player.position} - {player.nationality}</span>
                                            </div>

                                            {isMarketReport ? (
                                                <div className="flex items-center gap-2 text-emerald-600 col-span-2 mt-2 pt-3 border-t border-slate-50">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">LIBRE EN LA TEMPORADA • {player.scouting?.contractEnd || '2026'}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 col-span-2 mt-2 pt-3 border-t border-slate-50">
                                                    <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${player.scouting?.status === 'Negociando' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {player.scouting?.status || 'SEGUIMIENTO'}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">VENCE: {player.scouting?.contractEnd || '????'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                    <ClipboardList className="w-8 h-8 text-slate-200" />
                                </div>
                                <p className="font-bold text-slate-300 uppercase text-xs tracking-[0.2em]">No hay perfiles que coincidan con estos criterios</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-12 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        <span>© PRONEO SPORTS MANAGEMENT 2026</span>
                        <div className="flex gap-6">
                            <span>CONFIDENCIAL</span>
                            <span>PÁG. 1</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
          /* Reset total para impresión */
          body { visibility: hidden !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          
          /* Solo mostramos el contenido del reporte */
          .fixed.inset-0.bg-slate-50 { visibility: visible !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; overflow: visible !important; display: block !important; }
          .fixed.inset-0.bg-slate-50 * { visibility: visible !important; }
          
          /* Restaurar colores y fondos */
          header, .bg-gradient-to-br, .bg-slate-900, .bg-emerald-600, .bg-blue-600, .bg-proneo-green, .bg-white { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          
          .text-emerald-400, .text-blue-400, .text-proneo-green, .text-white { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }

          .max-w-4xl { max-width: 100% !important; width: 100% !important; box-shadow: none !important; margin: 0 !important; border: none !important; background: white !important; }
          
          /* Evitar cortes feos */
          .grid > div { break-inside: avoid; page-break-inside: avoid; margin-bottom: 1rem; }
          
          @page { size: A4; margin: 10mm; }
        }
      `}</style>
        </div>
    );
};

export default DossierPreview;
