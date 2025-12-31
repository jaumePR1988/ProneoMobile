import { useState, useEffect } from 'react';
const APP_VERSION = 'v2.13.0';
import { auth, db, messaging } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getToken } from 'firebase/messaging';
import { remoteConfig, getValue } from './firebase/config';
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  onSnapshot,
  limit,
  updateDoc
} from 'firebase/firestore';
import {
  Users,
  Search,
  LayoutDashboard,
  LogOut,
  Settings,
  ClipboardList,
  Trophy,
  Target as TargetIcon,
  User,
  Bell
} from 'lucide-react';
import PlayerForm from './components/PlayerForm';
import type { Player } from './types/player';
import ProfileModule from './components/ProfileModule';
import AvisosModule from './components/AvisosModule';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PlayerCard from './components/PlayerCard';
import SystemSettings from './components/SystemSettings';
import DossierPreview from './components/DossierPreview';

// --- COMPONENTES UI CORPORATIVOS v1.4.0 ---

// --- RESTRICCIÓN DE COMPONENTES EXTERNOS ---


function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'players' | 'scouting' | 'reports' | 'notifications' | 'profile' | 'settings'>('home');
  const [players, setPlayers] = useState<Player[]>([]);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScoutingView, setIsScoutingView] = useState(false);
  const [isScoutingMode, setIsScoutingMode] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  const [sportFilter, setSportFilter] = useState<'all' | 'Fútbol' | 'F. Sala' | 'Femenino' | 'Entrenadores'>('all');
  const [reportSportFilter, setReportSportFilter] = useState<'all' | 'Fútbol' | 'F. Sala' | 'Femenino' | 'Entrenadores'>('all');
  const [dossierTitle, setDossierTitle] = useState('Dossier Scouting');
  const [alertCount, setAlertCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  // Remote Config State
  const [appBranding, setAppBranding] = useState({
    title: 'PRONEO MOBILE',
    color: '#74b72e',
    campaign: {
      show: false,
      text: '',
      color: '#e11d48',
      theme: 'default'
    }
  });

  useEffect(() => {
    if (remoteConfig) {
      setAppBranding({
        title: getValue(remoteConfig, 'app_title').asString(),
        color: getValue(remoteConfig, 'theme_color').asString(),
        campaign: {
          show: getValue(remoteConfig, 'campaign_banner_show').asBoolean(),
          text: getValue(remoteConfig, 'campaign_banner_text').asString(),
          color: getValue(remoteConfig, 'campaign_banner_color').asString(),
          theme: getValue(remoteConfig, 'campaign_theme').asString()
        }
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.email?.toLowerCase() || ''));
          if (userDoc.exists()) {
            setUser({ ...firebaseUser, role: userDoc.data().role });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Auth state error:", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
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
    if (!user || !messaging || typeof window === 'undefined' || !('Notification' in window)) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // VAPID Key para producción integrada
          const token = await getToken(messaging!, {
            vapidKey: 'BOUzsUo5hx3dtWfTBxMbzStxKtrJRcubmy4jbrDKaHow9qwj1RFzepvXyZ5HGIvvy0YOVLh4QDcX92DnhQPCi_k'
          });

          if (token) {
            await updateDoc(doc(db, 'users', user.email?.toLowerCase() || ''), {
              fcmToken: token,
              lastTokenUpdate: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Error en notificaciones push:', error);
      }
    };

    requestPermission();
  }, [user]);

  useEffect(() => {
    if (!user || (user.role !== 'director' && user.role !== 'admin')) {
      setPendingApprovals(0);
      return;
    }
    const q = query(collection(db, 'users'), where('approved', '==', false));
    return onSnapshot(q, (snapshot) => {
      setPendingApprovals(snapshot.size);
    });
  }, [user]);

  useEffect(() => {
    // Cálculo rápido de alertas totales para el badge (Aproximado)
    let count = pendingApprovals;

    // Cumpleaños de hoy
    const today = new Date();
    const bdays = players.filter(p => {
      if (!p.birthDate) return false;
      const [d, m] = p.birthDate.split('/');
      return Number(d) === today.getDate() && Number(m) === (today.getMonth() + 1);
    }).length;

    setAlertCount(count + bdays);
  }, [pendingApprovals, players]);

  const handleTestPush = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones.');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification('ProneoMobile 🚀', {
        body: 'Esta es una notificación de prueba. ¡El sistema de avisos está activo!',
        icon: '/logo-icon.png'
      });
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleTestPush();
      }
    }
  };

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
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">
              {(appBranding.title || '').split(' ')[0]}
              <span style={{ color: appBranding.color }}> {(appBranding.title || '').split(' ')[1] || ''}</span>
            </h1>
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
            campaign={appBranding.campaign}
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
              <div>
                <h2 className="text-4xl font-extrabold tracking-tighter text-slate-900 uppercase">Cantera</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Jugadores Representados</p>
              </div>
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
                .filter(p => !p.isScouting)
                .filter(p => sportFilter === 'all' || p.category === sportFilter)
                .filter(p =>
                  p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.position?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(player => <PlayerCard key={player.id} player={player} onEdit={handleEditPlayer} />)
              }
              {players.filter(p =>
                (!p.isScouting) &&
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
        {activeTab === 'scouting' && (
          <div className="p-6 space-y-6 animate-in fade-in duration-500 text-center">
            <header className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-extrabold tracking-tighter text-blue-600 uppercase">Scouting</h2>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1">Objetivos de Mercado</p>
              </div>
            </header>

            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
              <input
                type="text"
                placeholder="BUSCAR OBJETIVO..."
                className="w-full bg-blue-50 border border-blue-100 p-5 pl-14 rounded-[28px] text-sm font-bold text-slate-900 outline-none focus:border-blue-500 transition-all shadow-sm placeholder:text-blue-300"
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
                  className={`px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${sportFilter === sport.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-400 border border-blue-100'}`}
                >
                  {sport.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {players
                .filter(p => p.isScouting)
                .filter(p => sportFilter === 'all' || p.category === sportFilter)
                .filter(p =>
                  p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.position?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(player => <PlayerCard key={player.id} player={player} onEdit={handleEditPlayer} />)
              }
              {players.filter(p =>
                (p.isScouting) &&
                (sportFilter === 'all' || p.category === sportFilter) &&
                (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.club?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.position?.toLowerCase().includes(searchTerm.toLowerCase()))
              ).length === 0 && (
                  <p className="text-center py-20 text-slate-300 text-xs font-bold uppercase tracking-widest">No hay objetivos activos</p>
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
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <ProfileModule
              user={{
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0],
                photoURL: user.photoURL,
                role: user.role
              }}
            />
            <div className="px-6 pb-32 space-y-4">
              <button
                onClick={handleTestPush}
                className="w-full bg-blue-50 text-blue-600 p-6 rounded-[32px] border border-blue-100 flex items-center justify-center gap-3 font-black uppercase tracking-widest active:scale-95 transition-all shadow-sm"
              >
                <Bell className="w-5 h-5" />
                Probar Notificaciones
              </button>

              <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Información Sistema</p>
                  <p className="text-sm font-bold text-slate-600 tracking-tight">Versión {APP_VERSION}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('¿Quieres reiniciar la aplicación para aplicar actualizaciones?')) {
                      window.location.reload();
                    }
                  }}
                  className="bg-slate-50 text-slate-400 p-4 rounded-2xl hover:bg-slate-100 transition-all font-bold text-[10px] uppercase tracking-widest"
                >
                  Reiniciar
                </button>
              </div>
              <button
                onClick={() => auth.signOut()}
                className="w-full bg-red-50 text-red-500 p-6 rounded-[32px] flex items-center justify-center gap-3 font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
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
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Cantera</span>
          {activeTab === 'players' && <div className="w-1.5 h-1.5 bg-proneo-green rounded-full shadow-[0_0_8px_rgba(116,183,46,0.6)]" />}
        </button>

        <button
          onClick={() => setActiveTab('scouting')}
          className={`flex flex-col items-center gap-2 transition-all duration-300 ${activeTab === 'scouting' ? 'text-blue-600 scale-110' : 'text-slate-500 opacity-60'}`}
        >
          <TargetIcon className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Scouting</span>
          {activeTab === 'scouting' && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />}
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
          className={`flex flex-col items-center gap-2 transition-all duration-300 relative ${activeTab === 'notifications' ? 'text-red-500 scale-110' : 'text-slate-500 opacity-60'}`}
        >
          <Bell className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">Avisos</span>
          {alertCount > 0 && (
            <div className="absolute -top-1 right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {alertCount}
            </div>
          )}
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
