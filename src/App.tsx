import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, onSnapshot, limit } from 'firebase/firestore';
import {
  Users,
  Search,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Euro,
  ChevronRight,
  Filter,
  Calendar,
  Shield
} from 'lucide-react';

// --- COMPONENTES ---

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
      if (userDoc.exists() && userDoc.data().approved) {
        onLoginSuccess({ ...userCredential.user, role: userDoc.data().role });
      } else {
        await signOut(auth);
        setError('Acceso pendiente de aprobación');
      }
    } catch (err: any) {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-proneo-green/10 rounded-3xl flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-proneo-green" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Proneo<span className="text-proneo-green">Mobile</span></h1>
          <p className="text-zinc-500 font-medium leading-tight">Acceso centralizado para<br />Agentes de Proneo Sports</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email corporativo"
            className="w-full p-5 bg-zinc-100 rounded-3xl border-none outline-none focus:ring-4 focus:ring-proneo-green/10 font-bold"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-5 bg-zinc-100 rounded-3xl border-none outline-none focus:ring-4 focus:ring-proneo-green/10 font-bold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-2xl">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-5 rounded-3xl font-black uppercase tracking-widest hover:bg-zinc-900 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ userRole, stats }: { userRole: string, stats: any }) => (
  <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Panel de Gestión</h2>
        <p className="text-proneo-green font-black text-xs tracking-widest uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-proneo-green rounded-full animate-pulse" />
          Sincronizado • {userRole}
        </p>
      </div>
    </header>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-zinc-100 p-6 rounded-[32px] space-y-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-proneo-green/5 rounded-bl-[32px]" />
        <Users className="text-proneo-green w-6 h-6" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Jugadores</p>
        <p className="text-3xl font-black italic">{stats.playersCount}</p>
      </div>
      <div className="bg-zinc-100 p-6 rounded-[32px] space-y-2 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-[32px]" />
        <Search className="text-blue-500 w-6 h-6" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Scouting</p>
        <p className="text-3xl font-black italic">{stats.scoutCount}</p>
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 px-1">Acciones Rápidas</h3>
      <button className="w-full bg-black text-white p-6 rounded-[32px] flex items-center justify-between group shadow-xl shadow-black/10 active:scale-[0.98] transition-all">
        <div className="text-left flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
            <PlusCircle className="w-6 h-6 text-proneo-green" />
          </div>
          <div>
            <p className="font-black italic text-xl">Nuevo Jugador</p>
            <p className="font-bold text-zinc-500 text-xs">Captura datos al instante</p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-zinc-700" />
      </button>

      <button className="w-full bg-zinc-100 text-black p-6 rounded-[32px] flex items-center justify-between group active:scale-[0.98] transition-all">
        <div className="text-left flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <Euro className="w-6 h-6 text-proneo-green" />
          </div>
          <div>
            <p className="font-black italic text-xl">Actualizar Pagos</p>
            <p className="font-bold text-zinc-400 text-xs text-zinc-500">Gestión de comisiones</p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-zinc-300" />
      </button>
    </div>
  </div>
);

const PlayerCard = ({ player }: { player: any }) => (
  <div className="bg-white p-5 rounded-[28px] border border-zinc-100 shadow-sm space-y-4 active:scale-[0.98] transition-all">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center font-black text-zinc-400">
          {player.nombre?.[0]}
        </div>
        <div>
          <p className="font-black uppercase italic tracking-tight text-zinc-900">{player.nombre}</p>
          <p className="text-[10px] font-bold text-proneo-green uppercase tracking-widest">{player.posicion}</p>
        </div>
      </div>
      <div className="bg-zinc-50 px-3 py-1 rounded-full border border-zinc-200">
        <p className="text-[9px] font-black uppercase text-zinc-500">{player.equipoActual || 'S/E'}</p>
      </div>
    </div>

    <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
      <div className="flex items-center gap-1 text-zinc-400">
        <Calendar className="w-3 h-3" />
        <span className="text-[9px] font-bold uppercase tracking-widest">{player.anoNacimiento}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${player.comisionCobrada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {player.comisionCobrada ? 'Cobrado' : 'Pendiente'}
        </span>
        <ChevronRight className="w-4 h-4 text-zinc-300" />
      </div>
    </div>
  </div>
);

const PlayersList = ({ players }: { players: any[] }) => (
  <div className="p-6 space-y-6 animate-in fade-in duration-300">
    <header className="flex items-center justify-between">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Mi Base de Datos</h2>
      <button className="p-3 bg-zinc-100 rounded-2xl">
        <Filter className="w-5 h-5 text-zinc-900" />
      </button>
    </header>

    <div className="space-y-4 pb-12">
      {players.length === 0 ? (
        <div className="p-12 text-center space-y-2">
          <Users className="w-12 h-12 text-zinc-100 mx-auto" />
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Sin jugadores registrados</p>
        </div>
      ) : (
        players.map(player => <PlayerCard key={player.id} player={player} />)
      )}
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [players, setPlayers] = useState<any[]>([]);
  const [scouts, setScouts] = useState<any[]>([]);

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

  // Sync Players
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'players'), limit(50));
    return onSnapshot(q, (snapshot) => {
      setPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  // Sync Scouting
  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'scouting');
    return onSnapshot(q, (snapshot) => {
      setScouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-12 h-1 w-12 bg-proneo-green rounded-full animate-pulse" />
      <span className="font-black italic text-xs uppercase tracking-[0.3em] text-zinc-300">Cargando Sistema</span>
    </div>
  );

  if (!user) return <Login onLoginSuccess={setUser} />;

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER SUPERIOR */}
      <div className="p-6 pb-2 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-proneo-green rounded-full" />
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Proneo<span className="text-proneo-green">M</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black uppercase text-zinc-300 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">v1.0.0-m</span>
          <button onClick={() => auth.signOut()} className="p-2 bg-zinc-50 rounded-full border border-zinc-100 text-zinc-400">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="pb-32">
        {activeTab === 'home' && (
          <Dashboard
            userRole={user.role}
            stats={{ playersCount: players.length, scoutCount: scouts.length }}
          />
        )}
        {activeTab === 'players' && <PlayersList players={players} />}
        {activeTab === 'scouting' && <div className="p-6 font-black italic text-2xl uppercase">Scouting</div>}
        {activeTab === 'finance' && <div className="p-6 font-black italic text-2xl uppercase">Pagos</div>}
      </main>

      {/* NAVEGACIÓN INFERIOR ESTILO APP */}
      <nav className="fixed bottom-6 left-6 right-6 bg-black/90 backdrop-blur-xl rounded-[32px] p-3 flex items-center justify-around z-40 shadow-2xl shadow-black/40 border border-white/10">
        <button
          onClick={() => setActiveTab('home')}
          className={`relative p-3 transition-all ${activeTab === 'home' ? 'text-proneo-green scale-110' : 'text-zinc-500'}`}
        >
          <LayoutDashboard className="w-6 h-6 " />
          {activeTab === 'home' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-proneo-green rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`relative p-3 transition-all ${activeTab === 'players' ? 'text-proneo-green scale-110' : 'text-zinc-500'}`}
        >
          <Users className="w-6 h-6" />
          {activeTab === 'players' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-proneo-green rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('scouting')}
          className={`relative p-3 transition-all ${activeTab === 'scouting' ? 'text-proneo-green scale-110' : 'text-zinc-500'}`}
        >
          <Search className="w-6 h-6" />
          {activeTab === 'scouting' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-proneo-green rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`relative p-3 transition-all ${activeTab === 'finance' ? 'text-proneo-green scale-110' : 'text-zinc-500'}`}
        >
          <PlusCircle className="w-6 h-6" />
          {activeTab === 'finance' && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-proneo-green rounded-full" />}
        </button>
      </nav>
    </div>
  );
}

export default App;
