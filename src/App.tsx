import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  Users,
  Search,
  LayoutDashboard,
  LogOut,
  UserCircle,
  PlusCircle,
  Euro
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
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Proneo<span className="text-proneo-green">Mobile</span></h1>
          <p className="text-zinc-500 font-medium">Acceso exclusivo para Agentes</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 bg-zinc-100 rounded-2xl border-none outline-none focus:ring-2 focus:ring-proneo-green/20 font-bold"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-4 bg-zinc-100 rounded-2xl border-none outline-none focus:ring-2 focus:ring-proneo-green/20 font-bold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-900 transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = ({ userRole }: { userRole: string }) => (
  <div className="p-6 space-y-6">
    <header className="space-y-1">
      <h2 className="text-2xl font-black uppercase italic">Bienvenido</h2>
      <p className="text-zinc-400 font-bold text-sm tracking-widest uppercase">{userRole}</p>
    </header>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-zinc-100 p-6 rounded-3xl space-y-2">
        <Users className="text-proneo-green" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Total Jugadores</p>
        <p className="text-2xl font-black italic">--</p>
      </div>
      <div className="bg-zinc-100 p-6 rounded-3xl space-y-2">
        <Search className="text-proneo-green" />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Objetivos</p>
        <p className="text-2xl font-black italic">--</p>
      </div>
    </div>

    <button className="w-full bg-proneo-green/10 text-proneo-green p-6 rounded-3xl flex items-center justify-between group border border-proneo-green/20">
      <div className="text-left">
        <p className="font-black uppercase tracking-widest text-[10px]">Acceso Rápido</p>
        <p className="font-black italic text-xl">Añadir Jugador</p>
      </div>
      <PlusCircle className="w-8 h-8" />
    </button>
  </div>
);

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

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

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest">Iniciando...</div>;

  if (!user) return <Login onLoginSuccess={setUser} />;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* HEADER SUPERIOR */}
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <h1 className="text-xl font-black italic uppercase">Proneo<span className="text-proneo-green">M</span></h1>
        <button onClick={() => auth.signOut()} className="p-2 bg-zinc-50 rounded-full">
          <LogOut className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main>
        {activeTab === 'home' && <Dashboard userRole={user.role} />}
        {activeTab === 'players' && <div className="p-6 font-black italic text-2xl uppercase">Jugadores</div>}
        {activeTab === 'scouting' && <div className="p-6 font-black italic text-2xl uppercase">Scouting</div>}
        {activeTab === 'finance' && <div className="p-6 font-black italic text-2xl uppercase">Finanzas</div>}
      </main>

      {/* NAVEGACIÓN INFERIOR ESTILO APP */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 pb-8 flex items-center justify-around z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-black' : 'text-zinc-300'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Inicio</span>
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'players' ? 'text-black' : 'text-zinc-300'}`}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Jugadores</span>
        </button>
        <button
          onClick={() => setActiveTab('scouting')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'scouting' ? 'text-black' : 'text-zinc-300'}`}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Scouting</span>
        </button>
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'finance' ? 'text-black' : 'text-zinc-300'}`}
        >
          <Euro className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Pagos</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
