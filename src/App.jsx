import React, { useState, useEffect } from 'react';
import { Shield, Heart, Zap, Scroll, Book, Backpack, User, Users, Plus, Trash2, ChevronDown, Award, Key, Weight, Info, Crosshair, Copy, RefreshCw, Sparkles, Flame, Star, Minus, Sword, Target, Clock, Moon, Sun, Coins, Wand2, StarHalf, LogOut, Chrome } from 'lucide-react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

// Namespace fixo para organizar os documentos no Firestore (não precisa mudar)
const appId = 't20-ficha-v6';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('conectado');
  const [activePage, setActivePage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  
  // Estados para gerenciar múltiplos personagens
  const [activeSheetId, setActiveSheetId] = useState('sheet');
  const [sheetsList, setSheetsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCharName, setNewCharName] = useState('');

  const [charData, setCharData] = useState({
    nome: '', raca: '', origem: '', jogador: '', classe: 'Guerreiro', nivel: 1, divindade: '',
    for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0,
    attrChave: 'int',
    pvAtual: 0, pvAdd: 0, pvTemp: 0,
    pmAtual: 0, pmAdd: 0, pmTemp: 0,
    defesaOutros: 0, deslocamentoBase: '9m',
    proficiencias: '',
    tibares: 0,
    cdResistenciaOutros: 0,
    armadura: { nome: '', defesa: 0, penalidade: 0 },
    escudo: { nome: '', defesa: 0, penalidade: 0 },
    equipamento: [],
    ataques: [],
    treinamento: {},
    periciaOutros: {},
    habilidadesIniciais: [], 
    habilidadesClasse: [],
    poderes: [],
    magias: []
  });

  useEffect(() => {
    // Apenas observa o estado de login - quem dispara o login é o botão "Entrar com Google"
    const unsubscribe = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setSyncStatus('conectando');
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setSyncStatus('erro');
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'artifacts', appId, 'users', user.uid, 'character');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({
          id: docSnap.id,
          nome: docSnap.data().nome || 'Herói Sem Nome'
        });
      });
      // Garante que o herói atual exista na lista se estiver vazio
      if (list.length === 0) {
        list.push({ id: 'sheet', nome: charData.nome || 'Herói Inicial' });
      }
      setSheetsList(list);
    }, () => setSyncStatus('erro'));
    return () => unsubscribe();
  }, [user, charData.nome]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'character', activeSheetId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCharData(prev => ({ ...prev, ...docSnap.data() }));
      } else {
        // Inicializa com dados limpos para novas fichas
        setCharData({
          nome: '', raca: '', origem: '', jogador: '', classe: 'Guerreiro', nivel: 1, divindade: '',
          for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0,
          attrChave: 'int',
          pvAtual: 20, pvAdd: 0, pvTemp: 0,
          pmAtual: 3, pmAdd: 0, pmTemp: 0,
          defesaOutros: 0, deslocamentoBase: '9m',
          proficiencias: '',
          tibares: 0,
          cdResistenciaOutros: 0,
          armadura: { nome: '', defesa: 0, penalidade: 0 },
          escudo: { nome: '', defesa: 0, penalidade: 0 },
          equipamento: [],
          ataques: [],
          treinamento: {},
          periciaOutros: {},
          habilidadesIniciais: [], 
          habilidadesClasse: [],
          poderes: [],
          magias: []
        });
      }
      setLoading(false);
    }, () => setSyncStatus('erro'));
    return () => unsubscribe();
  }, [user, activeSheetId]);

  useEffect(() => {
    if (!user || loading) return;
    const timer = setTimeout(async () => {
      setSyncStatus('salvando');
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'character', activeSheetId);
        await setDoc(docRef, charData, { merge: true });
        setSyncStatus('conectado');
      } catch (err) { setSyncStatus('erro'); }
    }, 1000);
    return () => clearTimeout(timer);
  }, [charData, user, loading, activeSheetId]);

  const handleCreateSheet = async (e) => {
    e.preventDefault();
    if (!newCharName.trim()) return;
    const newId = crypto.randomUUID();
    const newSheet = {
      nome: newCharName.trim(), raca: '', origem: '', jogador: '', classe: 'Guerreiro', nivel: 1, divindade: '',
      for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0,
      attrChave: 'int',
      pvAtual: 20, pvAdd: 0, pvTemp: 0,
      pmAtual: 3, pmAdd: 0, pmTemp: 0,
      defesaOutros: 0, deslocamentoBase: '9m',
      proficiencias: '',
      tibares: 0,
      cdResistenciaOutros: 0,
      armadura: { nome: '', defesa: 0, penalidade: 0 },
      escudo: { nome: '', defesa: 0, penalidade: 0 },
      equipamento: [],
      ataques: [],
      treinamento: {},
      periciaOutros: {},
      habilidadesIniciais: [], 
      habilidadesClasse: [],
      poderes: [],
      magias: []
    };
    try {
      setSyncStatus('salvando');
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'character', newId);
      await setDoc(docRef, newSheet);
      setActiveSheetId(newId);
      setNewCharName('');
      setIsModalOpen(false);
      setSyncStatus('conectado');
    } catch (err) { setSyncStatus('erro'); }
  };

  const handleDeleteSheet = async (idToDelete) => {
    if (sheetsList.length <= 1) return;
    try {
      setSyncStatus('salvando');
      const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'character', idToDelete);
      await deleteDoc(docRef);
      if (activeSheetId === idToDelete) {
        const nextActive = sheetsList.find(s => s.id !== idToDelete);
        if (nextActive) {
          setActiveSheetId(nextActive.id);
        }
      }
      setSyncStatus('conectado');
    } catch (err) { setSyncStatus('erro'); }
  };

  const statsPorClasse = {
    "Arcanista": { pvInicial: 8, pvNivel: 2, pmNivel: 6 },
    "Bárbaro":    { pvInicial: 24, pvNivel: 6, pmNivel: 3 },
    "Bardo":      { pvInicial: 12, pvNivel: 3, pmNivel: 4 },
    "Bucaneiro":  { pvInicial: 16, pvNivel: 4, pmNivel: 3 },
    "Caçador":    { pvInicial: 16, pvNivel: 4, pmNivel: 4 },
    "Cavaleiro":  { pvInicial: 20, pvNivel: 5, pmNivel: 3 },
    "Clérigo":    { pvInicial: 16, pvNivel: 4, pmNivel: 5 },
    "Druida":     { pvInicial: 16, pvNivel: 4, pmNivel: 4 },
    "Guerreiro":  { pvInicial: 20, pvNivel: 5, pmNivel: 3 },
    "Inventor":   { pvInicial: 12, pvNivel: 3, pmNivel: 4 },
    "Ladino":     { pvInicial: 12, pvNivel: 3, pmNivel: 4 },
    "Lutador":    { pvInicial: 20, pvNivel: 5, pmNivel: 3 },
    "Nobre":      { pvInicial: 16, pvNivel: 4, pmNivel: 4 },
    "Paladino":   { pvInicial: 20, pvNivel: 5, pmNivel: 3 }
  };

  const currentStats = statsPorClasse[charData.classe] || statsPorClasse["Guerreiro"];
  const pvMaxBase = (currentStats.pvInicial + charData.con + ((currentStats.pvNivel + charData.con) * (charData.nivel - 1)));
  const pvMaxTotal = pvMaxBase + (Number(charData.pvAdd) || 0) + (Number(charData.pvTemp) || 0);
  const pmMaxBase = (currentStats.pmNivel * charData.nivel);
  const pmMaxTotal = pmMaxBase + (Number(charData.pmAdd) || 0) + (Number(charData.pmTemp) || 0);
  
  const bonusTreino = charData.nivel <= 6 ? 2 : charData.nivel <= 14 ? 4 : 6;
  const metadeNivel = Math.floor(charData.nivel / 2);
  const limiteCarga = 10 + (charData.for >= 0 ? charData.for * 2 : charData.for);
  const cargaAtual = charData.equipamento.reduce((acc, item) => acc + (Number(item.peso) || 0) * (Number(item.qtd) || 1), 0);
  
  const estaSobrecarregado = cargaAtual > limiteCarga;
  const penalidadeCargaPericia = estaSobrecarregado ? 5 : 0;
  const penalidadeTotal = (Number(charData.armadura.penalidade) || 0) + (Number(charData.escudo.penalidade) || 0);
  
  const defesaTotal = 10 + charData.des + (Number(charData.armadura.defesa) || 0) + (Number(charData.escudo.defesa) || 0) + (Number(charData.defesaOutros) || 0);
  const cdResistenciaTotal = 10 + metadeNivel + (charData[charData.attrChave] || 0) + (Number(charData.cdResistenciaOutros) || 0);

  const pericias = [
    { nome: 'Acrobacia', attr: 'des', penalizavel: true, especial: 'carga' }, 
    { nome: 'Adestramento', attr: 'car' }, 
    { nome: 'Atletismo', attr: 'for' },
    { nome: 'Atuação', attr: 'car' }, 
    { nome: 'Cavalgar', attr: 'des' }, 
    { nome: 'Conhecimento', attr: 'int' },
    { nome: 'Cura', attr: 'sab' }, 
    { nome: 'Diplomacia', attr: 'car' }, 
    { nome: 'Enganação', attr: 'car' },
    { nome: 'Fortitude', attr: 'con' }, 
    { nome: 'Furtividade', attr: 'des', penalizavel: true, especial: 'carga' }, 
    { nome: 'Guerra', attr: 'int' },
    { nome: 'Iniciativa', attr: 'des' }, 
    { nome: 'Intimidação', attr: 'car' }, 
    { nome: 'Intuição', attr: 'sab' },
    { nome: 'Investigação', attr: 'int' }, 
    { nome: 'Jogatina', attr: 'car' }, 
    { nome: 'Ladinagem', attr: 'des', penalizavel: true, especial: 'carga' },
    { nome: 'Luta', attr: 'for' }, 
    { nome: 'Misticismo', attr: 'int' }, 
    { nome: 'Nobreza', attr: 'int' },
    { nome: 'Ofício', attr: 'int' }, 
    { nome: 'Percepção', attr: 'sab' }, 
    { nome: 'Pilotagem', attr: 'des' },
    { nome: 'Pontaria', attr: 'des' }, 
    { nome: 'Religião', attr: 'sab' }, 
    { nome: 'Reflexos', attr: 'des' },
    { nome: 'Sobrevivência', attr: 'sab' }, 
    { nome: 'Vontade', attr: 'sab' }
  ];

  const handleInputChange = (field, value) => setCharData(prev => ({ ...prev, [field]: value }));
  const adjustValue = (field, delta, min = -5, max = 30) => {
    setCharData(prev => {
      let next = (prev[field] || 0) + delta;
      if (next < min) next = min;
      if (next > max) next = max;
      return { ...prev, [field]: next };
    });
  };

  const addItem = (listField, defaultObj) => handleInputChange(listField, [...(charData[listField] || []), defaultObj]);
  const removeItem = (listField, index) => handleInputChange(listField, charData[listField].filter((_, i) => i !== index));
  const updateItem = (listField, index, field, value) => {
    const newList = [...charData[listField]];
    newList[index][field] = value;
    handleInputChange(listField, newList);
  };

  const activeSheet = sheetsList.find(s => s.id === activeSheetId);
  const activeSheetName = activeSheet ? activeSheet.nome : charData.nome || 'Herói Sem Nome';

  const theme = {
    bg: darkMode ? 'bg-stone-950' : 'bg-stone-100',
    card: darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200',
    input: darkMode ? 'bg-stone-800 border-stone-700 text-stone-100' : 'bg-stone-50 border-stone-200 text-stone-900',
    text: darkMode ? 'text-stone-100' : 'text-stone-900',
    subtext: darkMode ? 'text-stone-400' : 'text-stone-500',
    accent: darkMode ? 'text-red-400' : 'text-red-900',
    header: darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-300'
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} flex-col gap-4 font-black ${theme.accent} animate-pulse uppercase`}>
      <RefreshCw className="animate-spin"/> Sincronizando com Arton...
    </div>
  );

  if (!user) return (
    <div className={`min-h-screen flex items-center justify-center ${theme.bg} flex-col gap-6 p-4`}>
      <div className="text-center">
        <h1 className="text-3xl font-black italic tracking-tighter text-red-800">TORMENTA <span className="text-red-500">20</span></h1>
        <p className="text-xs font-bold uppercase opacity-50 mt-1">Faça login para acessar suas fichas</p>
      </div>
      <button
        onClick={handleGoogleLogin}
        className="bg-white border-2 border-stone-300 hover:border-red-500 shadow-md text-stone-800 font-bold px-6 py-3 rounded-xl flex items-center gap-3 transition-all"
      >
        <Chrome size={20} className="text-red-600" /> Entrar com Google
      </button>
      {syncStatus === 'erro' && <p className="text-xs text-red-600 font-bold">Não foi possível entrar. Tente novamente.</p>}
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans pb-10 transition-colors duration-300`}>
      
      {/* NAVEGAÇÃO SUPERIOR */}
      <div className={`sticky top-0 z-50 ${theme.header} border-b shadow-sm px-4`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between py-2">
           <div className="flex items-center gap-2">
              <Shield size={16} className={darkMode ? 'text-red-400' : 'text-red-900'} />
              <span className="text-xs font-black uppercase tracking-wider">{activeSheetName}</span>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className={`p-2 rounded-full transition-all ${darkMode ? 'bg-yellow-500 text-stone-900' : 'bg-stone-800 text-yellow-500'}`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="hidden md:flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${syncStatus === 'conectado' ? 'bg-green-500' : 'bg-yellow-500 animate-ping'}`} />
                <span className="text-[10px] font-black uppercase opacity-40">{syncStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                {user.photoURL && <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />}
                <span className="hidden sm:inline text-[10px] font-black uppercase opacity-60">{user.displayName || user.email}</span>
                <button onClick={handleLogout} title="Sair" className="p-2 rounded-full text-stone-500 hover:text-red-600 transition-all">
                  <LogOut size={16} />
                </button>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-4 px-2 sm:px-4">
        {activePage === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* CABEÇALHO */}
            <div className={`${darkMode ? 'bg-red-950' : 'bg-red-900'} text-white p-6 rounded-t-xl grid grid-cols-1 md:grid-cols-4 gap-6`}>
              <div className="md:col-span-1 border-r border-red-800 pr-6 text-center md:text-left flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl font-black italic tracking-tighter">TORMENTA <span className="text-red-400">20</span></h1>
                  <p className="text-[10px] uppercase font-bold opacity-60">Pinocchio Atelier</p>
                </div>
                {/* BOTÃO HERÓIS */}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 bg-red-900/40 hover:bg-red-800 border border-red-700 hover:border-red-500 text-white font-black uppercase text-[10px] tracking-wider py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all w-full"
                >
                  <Users size={12}/> Heróis
                </button>
              </div>
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex flex-col"><label className="text-[10px] font-bold text-red-200 uppercase">Personagem</label><input value={charData.nome} onChange={e => handleInputChange('nome', e.target.value)} className="bg-transparent border-b border-red-800 outline-none p-1 text-sm font-bold" /></div>
                <div className="flex flex-col"><label className="text-[10px] font-bold text-red-200 uppercase">Classe</label>
                  <select value={charData.classe} onChange={e => handleInputChange('classe', e.target.value)} className="bg-transparent border-b border-red-800 outline-none p-1 text-sm font-bold text-white">
                    {Object.keys(statsPorClasse).map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-red-200 uppercase">Nível (1-20)</label>
                  <div className="flex items-center gap-3 mt-1">
                    <button onClick={() => adjustValue('nivel', -1, 1, 20)} className="p-1 hover:bg-red-800 rounded border border-red-700"><Minus size={14}/></button>
                    <span className="text-xl font-black w-6 text-center">{charData.nivel}</span>
                    <button onClick={() => adjustValue('nivel', 1, 1, 20)} className="p-1 hover:bg-red-800 rounded border border-red-700"><Plus size={14}/></button>
                  </div>
                </div>
                <div className="flex flex-col"><label className="text-[10px] font-bold text-red-200 uppercase">Jogador</label><input value={charData.jogador} onChange={e => handleInputChange('jogador', e.target.value)} className="bg-transparent border-b border-red-800 outline-none p-1 text-sm font-bold" /></div>
                <div className="flex flex-col"><label className="text-[10px] font-bold text-red-200 uppercase">Divindade</label><input value={charData.divindade} onChange={e => handleInputChange('divindade', e.target.value)} className="bg-transparent border-b border-red-800 outline-none p-1 text-sm font-bold" /></div>
                <div className="flex flex-col"><label className="text-[10px] font-bold text-red-200 uppercase">Raça / Origem</label><input value={`${charData.raca} / ${charData.origem}`} onChange={e => {const [r, o] = e.target.value.split('/'); setCharData(prev => ({...prev, raca: r?.trim()||'', origem: o?.trim()||''}))}} className="bg-transparent border-b border-red-800 outline-none p-1 text-sm font-bold" /></div>
              </div>
            </div>

            {/* BOTÕES DE NAVEGAÇÃO ENTRE CABEÇALHO E FICHA */}
            <div className="flex gap-2 justify-start">
               <button onClick={() => setActivePage(1)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${activePage === 1 ? 'bg-red-900 text-white' : `${darkMode ? 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}`}><User size={14}/> Principal</button>
               <button onClick={() => setActivePage(2)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${activePage === 2 ? 'bg-red-900 text-white' : `${darkMode ? 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}`}><Sparkles size={14}/> Habilidades e Magias</button>
            </div>

            {/* CORPO DA FICHA */}
            <div className={`${theme.card} p-4 md:p-6 rounded-b-xl shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 border`}>
                {/* COLUNA 1: ATRIBUTOS E PERÍCIAS */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                        {['FOR','DES','CON','INT','SAB','CAR'].map(at => (
                            <div key={at} className={`p-2 rounded-lg border-2 text-center transition-all ${charData.attrChave === at.toLowerCase() ? 'border-red-500 bg-red-900/10' : `${darkMode ? 'border-stone-800 bg-stone-800/30' : 'border-stone-200 bg-stone-50'}`}`}>
                                <div className="text-[10px] font-black text-red-500 flex justify-between items-center px-1">
                                    {at} <button onClick={() => handleInputChange('attrChave', at.toLowerCase())}><Key size={10} className={charData.attrChave === at.toLowerCase() ? 'text-red-500' : 'text-stone-600'}/></button>
                                </div>
                                <div className="flex items-center justify-center gap-1 my-1">
                                    <button onClick={() => adjustValue(at.toLowerCase(), -1)} className="p-0.5 text-stone-500 hover:text-red-500"><Minus size={12}/></button>
                                    <span className="text-2xl font-black w-8">{charData[at.toLowerCase()]}</span>
                                    <button onClick={() => adjustValue(at.toLowerCase(), 1)} className="p-0.5 text-stone-500 hover:text-red-500"><Plus size={12}/></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className={`${darkMode ? 'bg-red-950/10 border-red-900/30' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-3`}>
                            <div className="flex justify-between items-center text-red-500 font-black text-[10px] uppercase mb-1 px-1"><span>Vida (PV)</span> <span className="text-[8px] opacity-60">Add / Temp</span></div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <input type="number" value={charData.pvAtual} onChange={e => handleInputChange('pvAtual', parseInt(e.target.value)||0)} className={`w-14 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-red-200'} rounded border text-center text-2xl font-black outline-none`} />
                                  <span className="text-xl opacity-30">/</span><span className="text-2xl font-black">{pvMaxTotal}</span>
                                </div>
                                <div className="flex gap-1">
                                  <input type="number" value={charData.pvAdd} onChange={e => handleInputChange('pvAdd', parseInt(e.target.value)||0)} placeholder="+" className={`w-10 text-[10px] font-black p-1 rounded border ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-red-200'} text-center`} />
                                  <input type="number" value={charData.pvTemp} onChange={e => handleInputChange('pvTemp', parseInt(e.target.value)||0)} placeholder="T" className={`w-10 text-[10px] font-black p-1 rounded border ${darkMode ? 'bg-red-950/40 border-red-900' : 'bg-red-100 border-red-400'} text-center`} />
                                </div>
                            </div>
                        </div>
                        <div className={`${darkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-200'} border-2 rounded-xl p-3`}>
                            <div className="flex justify-between items-center text-blue-500 font-black text-[10px] uppercase mb-1 px-1"><span>Mana (PM)</span> <span className="text-[8px] opacity-60">Add / Temp</span></div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <input type="number" value={charData.pmAtual} onChange={e => handleInputChange('pmAtual', parseInt(e.target.value)||0)} className={`w-14 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-blue-200'} rounded border text-center text-2xl font-black outline-none`} />
                                  <span className="text-xl opacity-30">/</span><span className="text-2xl font-black">{pmMaxTotal}</span>
                                </div>
                                <div className="flex gap-1">
                                  <input type="number" value={charData.pmAdd} onChange={e => handleInputChange('pmAdd', parseInt(e.target.value)||0)} placeholder="+" className={`w-10 text-[10px] font-black p-1 rounded border ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-blue-200'} text-center`} />
                                  <input type="number" value={charData.pmTemp} onChange={e => handleInputChange('pmTemp', parseInt(e.target.value)||0)} placeholder="T" className={`w-10 text-[10px] font-black p-1 rounded border ${darkMode ? 'bg-blue-950/40 border-blue-900' : 'bg-blue-100 border-blue-400'} text-center`} />
                                </div>
                            </div>
                        </div>
                        
                        <div className={`${darkMode ? 'bg-purple-900/10 border-purple-900/30' : 'bg-purple-50 border-purple-200'} border-2 rounded-xl p-3`}>
                            <div className="flex justify-between items-center text-purple-600 font-black text-[10px] uppercase mb-1 px-1"><span>CD de Resistência</span> <span className="text-[8px] opacity-60">Outros</span></div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl font-black">{cdResistenciaTotal}</span>
                                  <span className="text-[10px] opacity-40 leading-none uppercase">10 + ½ Nvl + <br/> {charData.attrChave.toUpperCase()}</span>
                                </div>
                                <input type="number" value={charData.cdResistenciaOutros} onChange={e => handleInputChange('cdResistenciaOutros', parseInt(e.target.value)||0)} placeholder="Outros" className={`w-14 text-xs font-black p-1.5 rounded border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-white border-purple-200'} text-center outline-none`} />
                            </div>
                        </div>
                    </div>

                    <div className={`${theme.input} rounded-xl p-3 border`}>
                        <div className={`flex justify-between items-center text-[10px] font-black uppercase ${theme.subtext} mb-2 border-b border-stone-700/50 pb-1`}><span>Perícias</span><div className="flex gap-4"><span>Outros</span><span>Total</span></div></div>
                        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {pericias.map(p => {
                                const treinado = charData.treinamento[p.nome];
                                const outros = Number(charData.periciaOutros[p.nome]) || 0;
                                
                                let penalidades = 0;
                                if(p.penalizavel) penalidades += penalidadeTotal;
                                if(p.especial === 'carga') penalidades += penalidadeCargaPericia;
                                
                                let total = metadeNivel + charData[p.attr] + (treinado ? bonusTreino : 0) + outros - penalidades;
                                
                                return (
                                    <div key={p.nome} className={`flex items-center text-[10px] px-1 py-1 rounded border-b ${darkMode ? 'border-stone-700/50' : 'border-stone-100'} ${treinado ? (darkMode ? 'bg-red-950/30' : 'bg-red-50') : ''}`}>
                                        <input type="checkbox" checked={!!treinado} onChange={() => handleInputChange('treinamento', {...charData.treinamento, [p.nome]: !treinado})} className="mr-2 accent-red-600 h-3 w-3" />
                                        <div className="flex-1 flex flex-col">
                                          <span className={`${treinado ? 'font-black' : 'opacity-70'}`}>{p.nome}</span>
                                          {(p.especial === 'carga' && estaSobrecarregado) && <span className="text-[8px] text-red-500 font-bold uppercase">-5 Carga</span>}
                                        </div>
                                        <input type="number" value={outros} onChange={e => handleInputChange('periciaOutros', {...charData.periciaOutros, [p.nome]: parseInt(e.target.value)||0})} className={`w-10 h-4 text-center ${darkMode ? 'bg-stone-900' : 'bg-white'} border ${darkMode ? 'border-stone-700' : 'border-stone-200'} rounded outline-none font-bold mr-2`} />
                                        <span className={`font-black ${darkMode ? 'text-red-400' : 'text-red-900'} w-8 text-right`}>{total >= 0 ? `+${total}` : total}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* COLUNA 2: COMBATE E EQUIPAMENTO */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`${darkMode ? 'bg-stone-800' : 'bg-stone-900'} text-white rounded-xl p-4 flex flex-col items-center justify-center border-b-4 border-red-600 shadow-lg`}>
                            <Shield size={32} className="text-red-500 mb-1" />
                            <span className="text-[10px] font-black uppercase opacity-50 tracking-widest">Defesa</span>
                            <span className="text-5xl font-black">{defesaTotal}</span>
                        </div>
                        <div className={`md:col-span-2 ${theme.input} rounded-xl p-4 border flex flex-wrap gap-4 items-center justify-around`}>
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase opacity-40 block mb-1">Deslocamento</span>
                                <div className="flex flex-col items-center">
                                  <input value={charData.deslocamentoBase} onChange={e => handleInputChange('deslocamentoBase', e.target.value)} className="bg-transparent text-center text-2xl font-black w-24 outline-none border-b border-stone-700" placeholder="Ex: 9m" />
                                  {estaSobrecarregado && <span className="text-[9px] text-red-500 font-black uppercase animate-pulse">-3m (Excesso Carga)</span>}
                                </div>
                            </div>
                            <div className="text-center">
                                <span className="text-[10px] font-black uppercase opacity-40 block mb-1">Carga Atual</span>
                                <div className={`text-2xl font-black ${estaSobrecarregado ? 'text-red-500' : ''}`}>
                                  {cargaAtual.toFixed(1)} <span className="text-xs opacity-30">/ {limiteCarga} kg</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ABA ATAQUES */}
                    <div className={`${theme.card} border rounded-xl overflow-hidden shadow-sm`}>
                        <div className={`${darkMode ? 'bg-stone-800' : 'bg-stone-800'} text-white p-2 text-[10px] font-black uppercase flex items-center justify-between px-4`}>
                            <div className="flex items-center gap-2"><Crosshair size={14} className="text-red-400" /> Ataques</div>
                            <button onClick={() => addItem('ataques', {nome:'', teste:'', dano:'', crit:'', tipo:''})} className="hover:text-red-400"><Plus size={16}/></button>
                        </div>
                        <div className="p-4 space-y-3">
                            {charData.ataques.map((atq, i) => (
                                <div key={i} className={`grid grid-cols-1 md:grid-cols-12 gap-2 ${darkMode ? 'bg-stone-800/50' : 'bg-stone-50'} p-3 rounded-lg items-center border ${darkMode ? 'border-stone-700' : 'border-stone-100'}`}>
                                    <div className="md:col-span-4 flex flex-col">
                                      <label className="text-[8px] uppercase font-black opacity-40 mb-1">Arma</label>
                                      <input value={atq.nome} onChange={e => updateItem('ataques', i, 'nome', e.target.value)} placeholder="Ex: Espada Longa" className="font-black text-xs uppercase bg-transparent outline-none" />
                                    </div>
                                    <div className="md:col-span-2 flex flex-col">
                                      <label className="text-[8px] uppercase font-black opacity-40 mb-1 text-center">Teste</label>
                                      <input value={atq.teste} onChange={e => updateItem('ataques', i, 'teste', e.target.value)} placeholder="+7" className={`text-center text-[10px] font-bold ${darkMode ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'} border rounded p-1`} />
                                    </div>
                                    <div className="md:col-span-2 flex flex-col">
                                      <label className="text-[8px] uppercase font-black opacity-40 mb-1 text-center">Dano</label>
                                      <input value={atq.dano} onChange={e => updateItem('ataques', i, 'dano', e.target.value)} placeholder="1d8+4" className={`text-center text-[10px] font-bold ${darkMode ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'} border rounded p-1`} />
                                    </div>
                                    <div className="md:col-span-2 flex flex-col">
                                      <label className="text-[8px] uppercase font-black opacity-40 mb-1 text-center">Tipo</label>
                                      <input value={atq.tipo} onChange={e => updateItem('ataques', i, 'tipo', e.target.value)} placeholder="Corte" className={`text-center text-[10px] font-bold ${darkMode ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'} border rounded p-1`} />
                                    </div>
                                    <div className="md:col-span-1 flex flex-col">
                                      <label className="text-[8px] uppercase font-black opacity-40 mb-1 text-center">Crit</label>
                                      <input value={atq.crit} onChange={e => updateItem('ataques', i, 'crit', e.target.value)} placeholder="19" className={`text-center text-[10px] font-bold ${darkMode ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'} border rounded p-1`} />
                                    </div>
                                    <div className="md:col-span-1 flex justify-center mt-4 md:mt-0">
                                      <button onClick={() => removeItem('ataques', i)} className="text-stone-600 hover:text-red-500"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {charData.ataques.length === 0 && <p className="text-center text-[10px] opacity-40 py-4 italic uppercase">Nenhum ataque cadastrado</p>}
                        </div>
                    </div>

                    <div className={`${theme.card} border rounded-xl p-4 shadow-sm`}>
                        <h3 className={`text-[10px] font-black uppercase ${theme.subtext} mb-3 flex items-center gap-2`}><Shield size={14}/> Vestimenta e Proteção</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black opacity-40 uppercase">Armadura</label>
                                <div className="grid grid-cols-3 gap-1">
                                    <input value={charData.armadura.nome} onChange={e => setCharData(prev => ({...prev, armadura: {...prev.armadura, nome: e.target.value}}))} placeholder="Nome..." className={`col-span-3 text-[10px] font-bold ${theme.input} p-1 rounded border outline-none`} />
                                    <input type="number" value={charData.armadura.defesa} onChange={e => setCharData(prev => ({...prev, armadura: {...prev.armadura, defesa: parseInt(e.target.value)||0}}))} placeholder="DEF" className={`text-center text-[10px] font-bold ${theme.input} p-1 rounded border outline-none`} />
                                    <input type="number" value={charData.armadura.penalidade} onChange={e => setCharData(prev => ({...prev, armadura: {...prev.armadura, penalidade: parseInt(e.target.value)||0}}))} placeholder="PEN" className={`text-center text-[10px] font-bold ${darkMode ? 'bg-red-950/20 border-red-900' : 'bg-red-50 border-red-100'} p-1 rounded border outline-none`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black opacity-40 uppercase">Escudo</label>
                                <div className="grid grid-cols-3 gap-1">
                                    <input value={charData.escudo.nome} onChange={e => setCharData(prev => ({...prev, escudo: {...prev.escudo, nome: e.target.value}}))} placeholder="Nome..." className={`col-span-3 text-[10px] font-bold ${theme.input} p-1 rounded border outline-none`} />
                                    <input type="number" value={charData.escudo.defesa} onChange={e => setCharData(prev => ({...prev, escudo: {...prev.escudo, defesa: parseInt(e.target.value)||0}}))} placeholder="DEF" className={`text-center text-[10px] font-bold ${theme.input} p-1 rounded border outline-none`} />
                                    <input type="number" value={charData.escudo.penalidade} onChange={e => setCharData(prev => ({...prev, escudo: {...prev.escudo, penalidade: parseInt(e.target.value)||0}}))} placeholder="PEN" className={`text-center text-[10px] font-bold ${darkMode ? 'bg-red-950/20 border-red-900' : 'bg-red-50 border-red-100'} p-1 rounded border outline-none`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={`text-[9px] font-black ${darkMode ? 'text-red-400' : 'text-red-700'} uppercase`}>Outros (Defesa)</label>
                                <input type="number" value={charData.defesaOutros} onChange={e => handleInputChange('defesaOutros', parseInt(e.target.value)||0)} className={`w-full text-center text-xl font-black ${theme.input} p-2 rounded-lg border-2 border-dashed outline-none`} />
                            </div>
                        </div>
                    </div>

                    {/* INVENTÁRIO COM TIBARES */}
                    <div className={`${theme.card} border rounded-xl p-4 shadow-sm`}>
                        <div className="flex justify-between items-center mb-3">
                          <span className={`text-[10px] font-black uppercase ${theme.subtext} flex items-center gap-2`}><Backpack size={14}/> Inventário</span>
                          <div className="flex gap-2">
                            <button onClick={() => addItem('equipamento', {nome:'', peso:0, qtd:1})} className="bg-red-700 text-white p-1 rounded-full"><Plus size={12}/></button>
                          </div>
                        </div>

                        {/* SEÇÃO DE TIBARES */}
                        <div className={`mb-4 p-3 rounded-lg border-2 border-yellow-600/30 ${darkMode ? 'bg-yellow-900/10' : 'bg-yellow-50'} flex items-center gap-4`}>
                          <div className="bg-yellow-500 p-2 rounded-full text-white"><Coins size={20}/></div>
                          <div className="flex-1">
                            <label className="text-[10px] font-black uppercase text-yellow-700">Tibares (T$)</label>
                            <input 
                              type="number" 
                              value={charData.tibares} 
                              onChange={e => handleInputChange('tibares', parseInt(e.target.value)||0)} 
                              className={`w-full bg-transparent text-2xl font-black outline-none border-b-2 border-yellow-600/50 text-yellow-600`}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-12 gap-1 text-[8px] font-black uppercase opacity-40 px-2 mb-1">
                              <span className="col-span-7">Nome do Item</span>
                              <span className="col-span-2 text-center">Qtd</span>
                              <span className="col-span-2 text-center">Peso</span>
                              <span className="col-span-1"></span>
                            </div>
                            {charData.equipamento.map((eq, i) => (
                                <div key={i} className={`grid grid-cols-12 gap-1 items-center ${darkMode ? 'bg-stone-800' : 'bg-stone-50'} p-1.5 rounded text-[10px]`}>
                                    <input value={eq.nome} onChange={e => updateItem('equipamento', i, 'nome', e.target.value)} className="col-span-7 bg-transparent font-bold outline-none" placeholder="Item..." />
                                    <input type="number" value={eq.qtd} onChange={e => updateItem('equipamento', i, 'qtd', parseInt(e.target.value)||1)} className={`col-span-2 text-center ${darkMode ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'} rounded border`} />
                                    <input type="number" step="0.1" value={eq.peso} onChange={e => updateItem('equipamento', i, 'peso', parseFloat(e.target.value)||0)} className={`col-span-2 text-center ${darkMode ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'} rounded border`} />
                                    <button onClick={() => removeItem('equipamento', i)} className="col-span-1 text-stone-600 hover:text-red-500 ml-1 flex justify-center"><Trash2 size={12}/></button>
                                </div>
                            ))}
                            {charData.equipamento.length === 0 && <p className="text-center text-[10px] opacity-30 py-4 italic uppercase">Mochila vazia</p>}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* PÁGINA 2: HABILIDADES E MAGIAS */}
        {activePage === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300 pb-20">
             <div className={`${darkMode ? 'bg-red-950' : 'bg-red-900'} text-white p-6 rounded-t-xl flex justify-between items-center`}>
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-3"><Book size={24}/> Habilidades e Magias</h2>
                <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Página II</span>
             </div>

             {/* BOTÕES DE NAVEGAÇÃO ENTRE CABEÇALHO E FICHA */}
             <div className="flex gap-2 justify-start">
                <button onClick={() => setActivePage(1)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${activePage === 1 ? 'bg-red-900 text-white' : `${darkMode ? 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}`}><User size={14}/> Principal</button>
                <button onClick={() => setActivePage(2)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${activePage === 2 ? 'bg-red-900 text-white' : `${darkMode ? 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}`}><Sparkles size={14}/> Habilidades e Magias</button>
             </div>

             <div className={`${theme.card} p-4 md:p-6 rounded-b-xl border shadow-xl space-y-10`}>
                
                {/* HABILIDADES INICIAIS (RAÇA, ORIGEM, DIVINDADE) */}
                <section>
                  <div className="flex justify-between items-center border-b-2 border-red-900/20 pb-2 mb-4">
                    <div>
                      <h3 className="text-xl font-black text-red-700 uppercase italic">Habilidades Iniciais</h3>
                      <p className="text-[10px] font-bold uppercase opacity-60">Habilidades de Raça, Origem e Divindade</p>
                    </div>
                    <button onClick={() => addItem('habilidadesIniciais', {nome:'', desc:''})} className="bg-red-900 text-white p-1.5 rounded-lg flex items-center gap-2 text-xs font-bold"><Plus size={14}/> Novo</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {charData.habilidadesIniciais?.map((hab, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'} relative group`}>
                         <button onClick={() => removeItem('habilidadesIniciais', i)} className="absolute top-2 right-2 text-stone-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                         <input value={hab.nome} onChange={e => updateItem('habilidadesIniciais', i, 'nome', e.target.value)} placeholder="Nome da Habilidade..." className="w-full bg-transparent font-black text-sm uppercase mb-2 outline-none text-red-600" />
                         <textarea value={hab.desc} onChange={e => updateItem('habilidadesIniciais', i, 'desc', e.target.value)} placeholder="Descrição..." className="w-full bg-transparent text-xs outline-none h-16 resize-none leading-relaxed italic" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* PODERES */}
                <section>
                  <div className="flex justify-between items-center border-b-2 border-red-900/20 pb-2 mb-4">
                    <div>
                      <h3 className="text-xl font-black text-red-700 uppercase italic">Poderes</h3>
                      <p className="text-[10px] font-bold uppercase opacity-60">Poderes de Classe e Poderes Gerais</p>
                    </div>
                    <button onClick={() => addItem('poderes', {nome:'', tipo:'', desc:''})} className="bg-red-900 text-white p-1.5 rounded-lg flex items-center gap-2 text-xs font-bold"><Plus size={14}/> Novo</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {charData.poderes?.map((p, i) => (
                      <div key={i} className={`p-4 rounded-lg border ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'} relative group`}>
                         <button onClick={() => removeItem('poderes', i)} className="absolute top-2 right-2 text-stone-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                         <div className="flex gap-2 mb-2 items-center">
                           <input value={p.nome} onChange={e => updateItem('poderes', i, 'nome', e.target.value)} placeholder="Nome..." className="flex-1 bg-transparent font-black text-sm uppercase outline-none text-red-600" />
                           <input value={p.tipo} onChange={e => updateItem('poderes', i, 'tipo', e.target.value)} placeholder="Tipo (Classe/Geral)" className="w-24 bg-transparent text-[10px] font-bold border border-red-900/20 rounded px-1 text-center italic" />
                         </div>
                         <textarea value={p.desc} onChange={e => updateItem('poderes', i, 'desc', e.target.value)} placeholder="Descrição..." className="w-full bg-transparent text-xs outline-none h-20 resize-none leading-relaxed italic" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* ABA DE MAGIAS */}
                <section>
                  <div className="flex justify-between items-center border-b-2 border-red-900/20 pb-2 mb-4">
                    <div>
                      <h3 className="text-xl font-black text-red-700 uppercase italic">Livro de Magias</h3>
                      <p className="text-[10px] font-bold uppercase opacity-60">Arcanas, Divinas ou Ambas</p>
                    </div>
                    <button onClick={() => addItem('magias', {nome:'', tipo:'Arcana', circulo:1, escola:'', exec:'', alc:'', alvo:'', dur:'', res:'', desc:''})} className="bg-blue-900 text-white p-1.5 rounded-lg flex items-center gap-2 text-xs font-bold"><Plus size={14}/> Nova Magia</button>
                  </div>
                  <div className="space-y-4">
                    {charData.magias?.map((m, i) => (
                      <div key={i} className={`p-4 rounded-xl border-l-4 ${m.tipo === 'Divina' ? 'border-l-yellow-500' : m.tipo === 'Arcana' ? 'border-l-blue-500' : 'border-l-purple-500'} ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-stone-50 border-stone-200'} relative group`}>
                         <button onClick={() => removeItem('magias', i)} className="absolute top-2 right-2 text-stone-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                         
                         {/* Header Magia */}
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 border-b border-stone-700/20 pb-2">
                           <div className="md:col-span-2">
                             <input value={m.nome} onChange={e => updateItem('magias', i, 'nome', e.target.value)} placeholder="Nome da Magia..." className="w-full bg-transparent font-black text-lg uppercase outline-none text-blue-600" />
                           </div>
                           <select value={m.tipo} onChange={e => updateItem('magias', i, 'tipo', e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none font-bold">
                             <option value="Arcana">Arcana</option>
                             <option value="Divina">Divina</option>
                             <option value="Ambas">Ambas</option>
                           </select>
                           <div className="flex items-center gap-2">
                             <label className="text-[9px] font-black uppercase opacity-40">Círculo:</label>
                             <input type="number" min="1" max="5" value={m.circulo} onChange={e => updateItem('magias', i, 'circulo', parseInt(e.target.value)||1)} className="w-8 bg-transparent font-black text-sm outline-none" />
                           </div>
                         </div>

                         {/* Detalhes Técnicos */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                           <div className="flex flex-col">
                             <label className="text-[8px] uppercase font-black opacity-50">Escola</label>
                             <input value={m.escola} onChange={e => updateItem('magias', i, 'escola', e.target.value)} placeholder="Ex: Abjuração" className="bg-transparent text-xs font-bold outline-none border-b border-stone-700/20 p-1" />
                           </div>
                           <div className="flex flex-col">
                             <label className="text-[8px] uppercase font-black opacity-50">Execução</label>
                             <input value={m.exec} onChange={e => updateItem('magias', i, 'exec', e.target.value)} placeholder="Padrão" className="bg-transparent text-xs font-bold outline-none border-b border-stone-700/20 p-1" />
                           </div>
                           <div className="flex flex-col">
                             <label className="text-[8px] uppercase font-black opacity-50">Alcance</label>
                             <input value={m.alc} onChange={e => updateItem('magias', i, 'alc', e.target.value)} placeholder="Curto" className="bg-transparent text-xs font-bold outline-none border-b border-stone-700/20 p-1" />
                           </div>
                           <div className="flex flex-col">
                             <label className="text-[8px] uppercase font-black opacity-50">Alvo</label>
                             <input value={m.alvo} onChange={e => updateItem('magias', i, 'alvo', e.target.value)} placeholder="1 Criatura" className="bg-transparent text-xs font-bold outline-none border-b border-stone-700/20 p-1" />
                           </div>
                           <div className="flex flex-col">
                             <label className="text-[8px] uppercase font-black opacity-50">Duração</label>
                             <input value={m.dur} onChange={e => updateItem('magias', i, 'dur', e.target.value)} placeholder="Instantânea" className="bg-transparent text-xs font-bold outline-none border-b border-stone-700/20 p-1" />
                           </div>
                           <div className="flex flex-col">
                             <label className="text-[8px] uppercase font-black opacity-50">Resistência</label>
                             <input value={m.res} onChange={e => updateItem('magias', i, 'res', e.target.value)} placeholder="Vontade anula" className="bg-transparent text-xs font-bold outline-none border-b border-stone-700/20 p-1" />
                           </div>
                         </div>

                         {/* Descrição */}
                         <div>
                           <label className="text-[8px] uppercase font-black opacity-50 mb-1 block">Efeito e Descrição</label>
                           <textarea value={m.desc} onChange={e => updateItem('magias', i, 'desc', e.target.value)} placeholder="Descreva o efeito da magia e seus aprimoramentos..." className="w-full bg-transparent text-xs outline-none h-24 resize-none leading-relaxed italic border border-stone-700/10 rounded p-2" />
                         </div>
                      </div>
                    ))}
                    {charData.magias?.length === 0 && <p className="text-center text-[10px] opacity-40 py-10 border-2 border-dashed border-stone-700/20 rounded-xl italic uppercase font-black">Seu grimório está vazio</p>}
                  </div>
                </section>
             </div>
          </div>
        )}
      </div>

      {/* POP-UP / MODAL DE SELEÇÃO DE PERSONAGENS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`${theme.card} border max-w-md w-full rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200`}>
            
            {/* Header Modal */}
            <div className="bg-red-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-black uppercase tracking-wider text-sm flex items-center gap-2">
                <Users size={16}/> Taverna de Heróis
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-red-200 text-lg font-bold transition-all">✕</button>
            </div>

            {/* Lista de Herois */}
            <div className="p-4 space-y-4">
              <label className="text-[10px] font-black uppercase text-stone-500">Alternar entre Herois salvos:</label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {sheetsList.map((sheet) => (
                  <div 
                    key={sheet.id} 
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${sheet.id === activeSheetId ? 'border-red-500 bg-red-900/10' : 'border-stone-700/20'}`}
                  >
                    <button 
                      onClick={() => { setActiveSheetId(sheet.id); setIsModalOpen(false); }}
                      className="flex-1 text-left font-black text-xs uppercase"
                    >
                      {sheet.nome || 'Herói Sem Nome'} {sheet.id === activeSheetId && <span className="text-[8px] bg-red-800 text-white px-1.5 py-0.5 rounded ml-2 font-black">Ativo</span>}
                    </button>
                    {sheetsList.length > 1 && (
                      <button 
                        onClick={() => handleDeleteSheet(sheet.id)}
                        className="text-stone-500 hover:text-red-500 p-1 rounded transition-colors"
                        title="Excluir herói"
                      >
                        <Trash2 size={14}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Criar Novo Herói */}
              <form onSubmit={handleCreateSheet} className="border-t pt-4 border-stone-700/20 flex gap-2">
                <input 
                  type="text" 
                  value={newCharName} 
                  onChange={e => setNewCharName(e.target.value)} 
                  placeholder="Nome do novo Herói..." 
                  className={`flex-1 text-xs font-bold p-2.5 rounded-lg border outline-none ${theme.input}`}
                  maxLength={30}
                  required
                />
                <button 
                  type="submit" 
                  className="bg-red-900 text-white px-4 py-2.5 rounded-lg text-xs font-black uppercase hover:bg-red-800 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Plus size={14}/> Criar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
};

export default App;