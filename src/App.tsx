import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getDoc,
  doc,
  collection,
  query,
  onSnapshot,
  limit,
  updateDoc
} from 'firebase/firestore';
import {
  Users,
  Search,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Activity,
  ArrowRight,
  MapPin,
  Edit2,
  Settings,
  Plus,
  Trash2,
  X,
  ClipboardList,
  Trophy,
  Target as TargetIcon,
  Shield,
  User,
  Calendar,
  Camera,
  Bell
} from 'lucide-react';
import PlayerForm from './components/PlayerForm';
import type { Player } from './types/player';
import ProfileModule from './components/ProfileModule';
import AvisosModule from './components/AvisosModule';

// --- COMPONENTES UI CORPORATIVOS v1.4.0 ---

const Login = ({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', email.toLowerCase()));
      if (userDoc.exists()) {
        onLoginSuccess({ ...userCredential.user, role: userDoc.data().role });
      } else {
        setError('Usuario no encontrado en la base de datos');
      }
    } catch (err: any) {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-proneo-green/10 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
            <img src="/logo-icon.png" alt="Logo" className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter uppercase text-slate-900">PRONEO<span className="text-proneo-green"> MOBILE</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Professional Agency Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Identificación</p>
            <input
              type="email"
              placeholder="Email corporativo"
              className="w-full p-5 bg-white rounded-3xl border-2 border-slate-100 outline-none focus:border-proneo-green font-bold text-slate-900 transition-all placeholder:text-slate-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Código de seguridad</p>
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full p-5 bg-white rounded-3xl border-2 border-slate-100 outline-none focus:border-proneo-green font-bold text-slate-900 transition-all placeholder:text-slate-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-6 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Accediendo...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

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

const PlayerCard = ({ player, onEdit }: { player: Player, onEdit: (p: Player) => void }) => (
  <div
    onClick={() => onEdit(player)}
    className={`p-6 rounded-[32px] border space-y-5 shadow-sm active:scale-[0.98] transition-all relative overflow-hidden group ${player.isScouting ? 'bg-[#f0f9ff] border-blue-400/50 shadow-md shadow-blue-200/50' : 'bg-white border-slate-100'}`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center overflow-hidden border border-slate-100">
          {player.photoUrl ? (
            <img src={player.photoUrl} className="w-full h-full object-cover" alt={player.name} />
          ) : (
            <span className="font-black text-xl text-slate-200">{player.name?.[0]}</span>
          )}
        </div>
        <div>
          <p className="font-black uppercase tracking-tight text-slate-900 text-lg">{player.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{player.category} • {player.position}</p>
        </div>
      </div>
      <button className="p-3 bg-slate-50 rounded-2xl text-slate-300 group-hover:text-proneo-green transition-colors">
        <Edit2 className="w-4 h-4" />
      </button>
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

const SystemSettings = () => {
  const [lists, setLists] = useState<any>(null);
  const [newItem, setNewItem] = useState('');
  const [activeCategory, setActiveCategory] = useState<'clubs' | 'leagues' | 'agents' | 'positions' | 'brands' | 'selections' | 'feet'>('clubs');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return onSnapshot(doc(db, 'settings', 'system_lists'), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setLists(data);

        // Auto-inicialización si alguna lista crítica está vacía
        if (!data.clubs || data.clubs.length === 0) {
          const defaultLists = {
            leagues: ['España', 'Italia', 'Bélgica', 'Polonia', 'Dubai', 'Brasil'],
            clubs: ['FC Barcelona', 'ElPozo Murcia', 'Inter Movistar', 'Palma Futsal', 'Jimbee Cartagena', 'Manzanares FS', 'Jaén Paraíso', 'Industrias Santa Coloma'],
            positions: ['Portero', 'Ala', 'Cierre', 'Pivot', 'Ala/Cierre', 'Ala/Pivot', 'Entrenador', 'Defensa', 'Mediocentro', 'Extremo', 'Delantero'],
            brands: ['Joma', 'Adidas', 'Nike', 'Munich', 'Senda', 'Luanvi'],
            agents: ['Jaume', 'Joan Francesc', 'Albert Redondo'],
            selections: ['No', 'Si', 'Sub-17', 'Sub-19', 'Sub-21', 'Absoluta'],
            feet: ['Derecha', 'Izquierda', 'Ambas', 'Ambidiestro']
          };
          await updateDoc(doc(db, 'settings', 'system_lists'), defaultLists);
        }
      }
    });
  }, []);

  const handleAddItem = async () => {
    if (!newItem.trim() || !lists) return;
    setLoading(true);
    try {
      const updatedList = [...(lists[activeCategory] || []), newItem.trim()].sort();
      await updateDoc(doc(db, 'settings', 'system_lists'), {
        [activeCategory]: updatedList
      });
      setNewItem('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (val: string) => {
    if (!lists) return;
    try {
      const updatedList = lists[activeCategory].filter((i: string) => i !== val);
      await updateDoc(doc(db, 'settings', 'system_lists'), {
        [activeCategory]: updatedList
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!lists) return <div className="p-10 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">Cargando listas...</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Ajustes</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración del Sistema</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {[
          { id: 'clubs', label: 'Clubs' },
          { id: 'leagues', label: 'Ligas' },
          { id: 'agents', label: 'Agentes' },
          { id: 'positions', label: 'Posiciones' },
          { id: 'brands', label: 'Marcas' },
          { id: 'selections', label: 'Selecciones' },
          { id: 'feet', label: 'Pies' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex gap-3">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Nuevo ${activeCategory}...`}
          className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl text-sm font-bold outline-none focus:border-proneo-green"
        />
        <button
          onClick={handleAddItem}
          disabled={loading}
          className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-2 pb-20">
        {(lists[activeCategory] || []).map((item: string) => (
          <div key={item} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
            <span className="font-bold text-slate-700">{item}</span>
            <button onClick={() => handleRemoveItem(item)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const calculateAge = (birthDate: string) => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const DossierPreview = ({ players, onClose, title = "Dossier Scouting", filterSport = "all" }: { players: Player[], onClose: () => void, title?: string, filterSport?: string }) => {
  const scoutingPlayers = players.filter(p => {
    const isScouting = p.isScouting;
    const matchesSport = filterSport === "all" || p.category === filterSport;

    if (title === 'Dossier Oportunidades Mercado' || title === 'Oportunidades Mercado') {
      const contractEnd = p.scouting?.contractEnd || '';
      const isExpiring = contractEnd.includes('2025') || contractEnd.includes('2026');
      return isScouting && matchesSport && isExpiring;
    }

    return isScouting && matchesSport;
  });

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
          onClick={() => window.print()}
          className={`flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest px-6 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all ${isMarketReport ? 'bg-emerald-600 shadow-emerald-900/40' : 'bg-blue-600 shadow-blue-900/40'}`}
        >
          <ClipboardList className="w-4 h-4" />
          Imprimir Reporte
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
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; }
          .max-w-4xl { max-width: 100% !important; box-shadow: none !important; }
          .bg-slate-50 { background: white !important; }
          header { -webkit-print-color-adjust: exact !important; }
          .bg-gradient-to-br { -webkit-print-color-adjust: exact !important; }
          .bg-slate-900 { -webkit-print-color-adjust: exact !important; }
          .text-emerald-400, .text-blue-400 { -webkit-print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [players, setPlayers] = useState<Player[]>([]);
  const [scouts, setScouts] = useState<any[]>([]);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScoutingView, setIsScoutingView] = useState(false);
  const [isScoutingMode, setIsScoutingMode] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [sportFilter, setSportFilter] = useState<'all' | 'Fútbol' | 'F. Sala' | 'Femenino' | 'Entrenadores'>('all');
  const [reportSportFilter, setReportSportFilter] = useState<'all' | 'Fútbol' | 'F. Sala' | 'Femenino' | 'Entrenadores'>('all');
  const [dossierTitle, setDossierTitle] = useState('Dossier Scouting');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.email?.toLowerCase() || ''));
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, role: userDoc.data().role });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'players'), limit(200));
    return onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'scouting');
    return onSnapshot(q, (snapshot) => {
      setScouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handleCloseForm = () => {
    setShowPlayerForm(false);
    setEditingPlayer(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-pulse">
        <img src="/logo-icon.png" alt="Loading" className="w-10 h-10 grayscale opacity-40" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 animate-pulse">Sincronizando</p>
    </div>
  );

  if (!user) return <Login onLoginSuccess={setUser} />;

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-32">
      {/* HEADER v1.4.0 */}
      <div className="bg-white/80 backdrop-blur-md p-6 flex items-center justify-between sticky top-0 z-30 border-b border-slate-50">
        <div className="flex items-center gap-4">
          <img src="/logo-icon.png" alt="Logo" className="w-10 h-10" />
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">PRONEO<span className="text-proneo-green"> MOBILE</span></h1>
            <span className="text-[9px] font-black text-slate-300 tracking-[0.2em] uppercase mt-1">Professional Registry</span>
          </div>
        </div>
        <button onClick={() => auth.signOut()} className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 active:scale-95 transition-all">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <main>
        {activeTab === 'home' && (
          <Dashboard
            stats={{
              canteraCount: players.filter(p => !p.isScouting).length,
              scoutingCount: players.filter(p => p.isScouting).length
            }}
            onAddPlayer={() => {
              setIsScoutingMode(false);
              setShowPlayerForm(true);
            }}
            onAddScout={() => {
              setIsScoutingMode(true);
              setShowPlayerForm(true);
            }}
          />
        )}
        {activeTab === 'players' && (
          <div className="p-6 space-y-6 animate-in fade-in duration-500 text-center">
            <header className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Base de Datos</h2>
            </header>

            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="text"
                placeholder="BUSCAR JUGADOR/A..."
                className="w-full bg-slate-50 border border-slate-200 p-5 pl-14 rounded-[28px] text-sm font-bold text-slate-900 outline-none focus:border-proneo-green transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'Fútbol', label: 'Fútbol' },
                { id: 'F. Sala', label: 'Sala' },
                { id: 'Femenino', label: 'Femenino' },
                { id: 'Entrenadores', label: 'Entrenadores' }
              ].map(sport => (
                <button
                  key={sport.id}
                  onClick={() => setSportFilter(sport.id as any)}
                  className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${sportFilter === sport.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                >
                  {sport.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {players
                .filter(p => isScoutingView ? p.isScouting : true)
                .filter(p => sportFilter === 'all' || p.category === sportFilter)
                .filter(p =>
                  p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.position?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(player => <PlayerCard key={player.id} player={player} onEdit={handleEditPlayer} />)
              }
              {players.filter(p =>
                (isScoutingView ? p.isScouting : true) &&
                (sportFilter === 'all' || p.category === sportFilter) &&
                (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.position?.toLowerCase().includes(searchTerm.toLowerCase()))
              ).length === 0 && (
                  <p className="text-center py-20 text-slate-300 text-xs font-bold uppercase tracking-widest">No hay registros que coincidan</p>
                )}
            </div>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-20">
            <header className="mb-4">
              <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Reportes</h2>
              <div className="flex gap-2 mt-6 overflow-x-auto scrollbar-hide">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'Fútbol', label: 'Fútbol' },
                  { id: 'F. Sala', label: 'Sala' },
                  { id: 'Femenino', label: 'Femenino' },
                  { id: 'Entrenadores', label: 'Entrenadores' }
                ].map(sport => (
                  <button
                    key={sport.id}
                    onClick={() => setReportSportFilter(sport.id as any)}
                    className={`px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${reportSportFilter === sport.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                  >
                    {sport.label}
                  </button>
                ))}
              </div>
            </header>

            <div className="grid gap-4">
              <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-xl space-y-5">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <ClipboardList className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-900 leading-tight">Dossier Scouting</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Objetivos de seguimiento activo (Jugadores/as)</p>
                </div>
                <button
                  onClick={() => {
                    setDossierTitle('Dossier Scouting');
                    setShowDossier(true);
                  }}
                  className="w-full bg-blue-600 text-white h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <TargetIcon className="w-4 h-4" />
                  Generar Dossier
                </button>
              </div>

              <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-xl space-y-5">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase text-slate-900 leading-tight">Oportunidades Mercado</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Dossier de jugadores/as proyectables</p>
                </div>
                <button
                  onClick={() => {
                    setDossierTitle('Dossier Oportunidades Mercado');
                    setShowDossier(true);
                  }}
                  className="w-full bg-emerald-600 text-white h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Users className="w-4 h-4" />
                  Generar Dossier
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'notifications' && <AvisosModule players={players} userRole={user?.role || 'scout'} />}
        {activeTab === 'profile' && <ProfileModule user={user} />}
        {activeTab === 'settings' && <SystemSettings />}
      </main>

      {showPlayerForm && (
        <PlayerForm
          initialData={editingPlayer}
          isScoutingInit={isScoutingMode}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm();
            setActiveTab('players');
            if (isScoutingMode) setIsScoutingView(true);
          }}
        />
      )}

      {showDossier && (
        <DossierPreview
          players={players}
          title={dossierTitle}
          filterSport={reportSportFilter}
          onClose={() => setShowDossier(false)}
        />
      )}

      {/* NAV v1.4.0 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg px-8 py-6 flex items-center justify-around border-t border-slate-50">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'home' ? 'text-proneo-green scale-110' : 'text-slate-500 opacity-60'}`}
        >
          <LayoutDashboard className="w-7 h-7" />
          {activeTab === 'home' && <div className="w-1.5 h-1.5 bg-proneo-green rounded-full shadow-[0_0_8px_rgba(116,183,46,0.6)]" />}
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'players' ? 'text-proneo-green scale-110' : 'text-slate-500 opacity-60'}`}
        >
          <Users className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest">Base Datos</span>
          {activeTab === 'players' && <div className="w-1.5 h-1.5 bg-proneo-green rounded-full shadow-[0_0_8px_rgba(116,183,46,0.6)]" />}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'reports' ? 'text-blue-500 scale-110' : 'text-slate-500 opacity-60'}`}
        >
          <ClipboardList className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Reportes</span>
          {activeTab === 'reports' && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'notifications' ? 'text-red-500 scale-110' : 'text-slate-500 opacity-60'}`}
        >
          <Bell className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Avisos</span>
          {activeTab === 'notifications' && <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'profile' ? 'text-proneo-green scale-110' : 'text-slate-500 opacity-60'}`}
        >
          <User className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Perfil</span>
          {activeTab === 'profile' && <div className="w-1.5 h-1.5 bg-proneo-green rounded-full shadow-[0_0_8px_rgba(116,183,46,0.6)]" />}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'settings' ? 'text-slate-500 scale-110' : 'text-slate-300 opacity-40'}`}
        >
          <Settings className="w-7 h-7" />
          {activeTab === 'settings' && <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />}
        </button>
      </nav>
    </div>
  );
}

export default App;
