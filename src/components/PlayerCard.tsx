import { Edit2, MapPin, Share2 } from 'lucide-react';
import type { Player } from '../types/player';

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onOpen360: (player: Player) => void;
}

const PlayerCard = ({ player, onEdit, onOpen360 }: PlayerCardProps) => {
  const displayName = player.name || `${player.firstName || ''} ${player.lastName1 || ''}`.trim() || 'Desconocido';

  return (
    <div
      onClick={() => onOpen360(player)}
      className={`p-6 rounded-[32px] border space-y-5 shadow-sm active:scale-[0.98] transition-all relative overflow-hidden group ${player.isScouting ? 'bg-[#f0f9ff] border-blue-400/50 shadow-md shadow-blue-200/50' : 'bg-white border-slate-100'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center overflow-hidden border border-slate-100">
            {player.photoUrl ? (
              <img src={player.photoUrl} className="w-full h-full object-cover" alt={displayName} />
            ) : (
              <span className="font-black text-xl text-slate-200">{displayName?.[0]}</span>
            )}
          </div>
          <div>
            <p className="font-black uppercase tracking-tight text-slate-900 text-lg">{displayName}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{player.category} • {player.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const text = `*PRONEO SPORTS* 📄\n\n*${displayName.toUpperCase()}*\n${player.position} (${player.age || '?'} Años)\n\n📍 ${player.club || 'Sin Equipo'}\n🏁 Fin Contrato: ${player.contract?.endDate || 'Consultar'}\n\n🔗 Más info: https://proneosports.com`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="p-3 bg-slate-50 rounded-2xl text-slate-300 hover:text-green-500 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(player);
            }}
            className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-proneo-green transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-slate-300" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{player.club || 'Sin equipo'}</span>
        </div>
        <div className="flex items-center gap-2">
          {player.isScouting && player.scouting?.status && (
            <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${player.scouting.status === 'Contactado' ? 'bg-blue-100 text-blue-600' :
              player.scouting.status === 'Negociando' ? 'bg-orange-100 text-orange-600' :
                player.scouting.status === 'Descartado' ? 'bg-red-100 text-red-600' :
                  'bg-slate-100 text-slate-500'
              }`}>
              {player.scouting.status}
            </div>
          )}
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${player.isScouting ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
            {player.isScouting ? 'Objetivo' : 'En Cartera'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
