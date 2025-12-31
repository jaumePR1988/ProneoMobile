import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Trash2 } from 'lucide-react';

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

export default SystemSettings;
