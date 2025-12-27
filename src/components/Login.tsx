import React, { useState } from 'react';
import { auth, db, logEvent, analytics } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

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
                const userData = { ...userCredential.user, role: userDoc.data().role };

                if (analytics) {
                    logEvent(analytics, 'login', {
                        method: 'email',
                        role: userData.role
                    });
                }

                onLoginSuccess(userData);
            } else {
                setError('Usuario no encontrado en la base de datos');
            }
        } catch (err: any) {
            if (analytics) {
                logEvent(analytics, 'exception', {
                    description: 'Login Error: ' + err.message,
                    fatal: false
                });
            }
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

export default Login;
