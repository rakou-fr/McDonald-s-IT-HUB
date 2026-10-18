import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Wand2, RotateCcw, FileDown, Printer, Plus, Trash2, 
  Upload, CheckCircle, Save, User, Camera, AlertTriangle, X, CheckCircle2
} from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  status: 'fait' | 'encours' | 'bloque';
}

export interface ReportImage {
  id: string;
  dataUrl: string;
  caption: string;
}

export interface ReportData {
  techName: string;
  reportDate: string;
  reportTitle: string;
  location: string;
  notes: string;
  tasks: Task[];
  images: ReportImage[];
}

export function ActivityReportApp() {
  const [reportData, setReportData] = useState<ReportData>({
    techName: '',
    reportDate: new Date().toISOString().split('T')[0],
    reportTitle: '',
    location: '',
    notes: '',
    tasks: [],
    images: []
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<'fait' | 'encours' | 'bloque'>('fait');

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('it_report_data');
    if (saved) {
      try {
        setReportData(JSON.parse(saved));
      } catch (e) {
        loadDemoData();
      }
    } else {
      loadDemoData();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('it_report_data', JSON.stringify(reportData));
  }, [reportData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadDemoData = () => {
    const today = new Date().toISOString().split('T')[0];
    setReportData({
      techName: 'Thomas Martin',
      reportDate: today,
      reportTitle: 'Maintenance Baie Serveurs & Mise à jour Postes Caisse',
      location: 'McDo Capitole - Salle Serveur',
      notes: "• Intervention réseau réalisée sans interruption de service pour le restaurant.\n• Remplacement du switch d'étage effectué avec succès.\n• Prévoir une vérification des câbles de secours lors de la prochaine visite.",
      tasks: [
        { id: '1', title: 'Vérification des sauvegardes journalières de la baie NAS', status: 'fait' },
        { id: '2', title: 'Remplacement du switch réseau sur la baie secondaire', status: 'fait' },
        { id: '3', title: 'Déploiement des correctifs de sécurité sur les caisses', status: 'encours' },
        { id: '4', title: 'Configuration du Vlan Wi-Fi Invité / Drive', status: 'bloque' }
      ],
      images: [
        {
          id: 'demo-img-1',
          dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%23006241"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="18" font-weight="bold">Baie de Brassage - IT Hub</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="%23FFBC0D" font-family="sans-serif" font-size="12">Câblage structuré OK</text></svg>',
          caption: 'État de la baie de brassage post-intervention'
        }
      ]
    });
    showToast("Données de démonstration chargées");
  };

  const handleReset = () => {
    setReportData({
      techName: '',
      reportDate: new Date().toISOString().split('T')[0],
      reportTitle: '',
      location: '',
      notes: '',
      tasks: [],
      images: []
    });
    setIsResetModalOpen(false);
    showToast("Rapport réinitialisé");
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      showToast("Veuillez saisir le libellé de la tâche");
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      status: newTaskStatus
    };
    setReportData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    setNewTaskTitle('');
    showToast("Tâche ajoutée avec succès");
  };

  const removeTask = (id: string) => {
    setReportData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const updateTaskStatus = (id: string, status: 'fait' | 'encours' | 'bloque') => {
    setReportData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, status } : t)
    }));
  };

  const updateTaskTitle = (id: string, title: string) => {
    setReportData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, title } : t)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newImg: ReportImage = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
            dataUrl: event.target.result as string,
            caption: file.name.replace(/\.[^/.]+$/, "")
          };
          setReportData(prev => ({ ...prev, images: [...prev.images, newImg] }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
    showToast("Image(s) importée(s)");
  };

  const removeImage = (id: string) => {
    setReportData(prev => ({ ...prev, images: prev.images.filter(i => i.id !== id) }));
  };

  const updateImageCaption = (id: string, caption: string) => {
    setReportData(prev => ({
      ...prev,
      images: prev.images.map(i => i.id === id ? { ...i, caption } : i)
    }));
  };

  // --- EXPORTATION PDF CORRIGÉE ---
  const exportToPDF = async () => {
    showToast("Génération du PDF en cours...");
    const element = previewRef.current;
    if (!element) return;

    const cleanName = (reportData.techName || 'Technicien').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanDate = reportData.reportDate || new Date().toISOString().split('T')[0];
    const fileName = `Rapport_${cleanDate}_${cleanName}.pdf`;

    // Configuration optimale pour éliminer les décalages
    const opt = {
      margin: 0, // Pas de marge globale car le padding est géré dans .a4-page
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if ((window as any).html2pdf) {
      try {
        await (window as any).html2pdf().set(opt).from(element).save();
        showToast("PDF téléchargé avec succès !");
      } catch (err) {
        window.print();
      }
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => exportToPDF();
      script.onerror = () => window.print();
      document.body.appendChild(script);
    }
  };

  const getFormattedDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '--' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .no-print { display: none !important; }
          .a4-page { box-shadow: none !important; width: 100% !important; height: auto !important; padding: 10mm !important; margin: 0 !important; }
        }
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
      `}</style>

      {/* En-tête principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-mcd-border rounded-sm shadow-sm no-print">
        <div>
          <h1 className="text-xl font-bold text-mcd-text flex items-center gap-2">
            <FileText className="text-mcd-green" /> RAPPORT D'ACTIVITÉ IT
          </h1>
          <p className="text-sm text-mcd-muted mt-0.5">Outil d'intervention & compte-rendu journalier</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={loadDemoData} className="px-3 py-2 bg-mcd-light hover:bg-gray-200 text-mcd-text font-semibold text-xs border border-mcd-border flex items-center gap-1.5 rounded-sm transition-colors">
            <Wand2 size={14} className="text-mcd-yellow fill-mcd-yellow" /> Ex. Démo
          </button>
          <button onClick={() => setIsResetModalOpen(true)} className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs border border-red-200 flex items-center gap-1.5 rounded-sm transition-colors">
            <RotateCcw size={14} /> Réinitialiser
          </button>
          <button onClick={exportToPDF} className="px-4 py-2 bg-mcd-green hover:bg-[#005135] text-white font-bold text-xs border border-[#00402a] flex items-center gap-2 rounded-sm shadow-sm transition-colors">
            <FileDown size={14} /> Télécharger PDF
          </button>
          <button onClick={() => window.print()} className="px-3 py-2 bg-mcd-yellow hover:bg-yellow-500 text-black font-bold text-xs border border-yellow-600 flex items-center gap-1.5 rounded-sm transition-colors">
            <Printer size={14} /> Imprimer
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-mcd-green text-white px-4 py-3 shadow-xl border-l-4 border-mcd-yellow flex items-center gap-3 rounded-sm">
          <CheckCircle2 className="text-mcd-yellow" size={18} />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORMULAIRE GAUCHE */}
        <div className="lg:col-span-6 space-y-5 no-print">
          <div className="bg-white border border-mcd-border rounded-sm shadow-sm overflow-hidden">
            <div className="bg-mcd-green text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex justify-between items-center">
              <span className="flex items-center gap-2"><User size={14} /> Informations Générales</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-sm font-normal flex items-center gap-1">
                <Save size={10} /> Auto-enregistré
              </span>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Technicien / Auteur *</label>
                  <input 
                    type="text" 
                    value={reportData.techName}
                    onChange={e => setReportData({...reportData, techName: e.target.value})}
                    placeholder="ex: Thomas Martin"
                    className="w-full bg-gray-50 border border-mcd-border p-2 text-xs font-semibold focus:bg-white focus:border-mcd-green outline-none rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date du jour *</label>
                  <input 
                    type="date" 
                    value={reportData.reportDate}
                    onChange={e => setReportData({...reportData, reportDate: e.target.value})}
                    className="w-full bg-gray-50 border border-mcd-border p-2 text-xs font-semibold focus:bg-white focus:border-mcd-green outline-none rounded-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Objet / Sujet de l'intervention *</label>
                  <input 
                    type="text" 
                    value={reportData.reportTitle}
                    onChange={e => setReportData({...reportData, reportTitle: e.target.value})}
                    placeholder="ex: Maintenance réseau & Déploiement caisses"
                    className="w-full bg-gray-50 border border-mcd-border p-2 text-xs font-semibold focus:bg-white focus:border-mcd-green outline-none rounded-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Lieu / Site</label>
                  <input 
                    type="text" 
                    value={reportData.location}
                    onChange={e => setReportData({...reportData, location: e.target.value})}
                    placeholder="ex: McDo Capitole"
                    className="w-full bg-gray-50 border border-mcd-border p-2 text-xs font-semibold focus:bg-white focus:border-mcd-green outline-none rounded-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-mcd-border rounded-sm shadow-sm overflow-hidden">
            <div className="bg-mcd-green text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex justify-between items-center">
              <span className="flex items-center gap-2"><CheckCircle size={14} /> Actions & Tâches Réalisées</span>
              <span className="text-[10px] bg-white text-mcd-green font-extrabold px-2 py-0.5 rounded-sm">
                {reportData.tasks.length} Tâche{reportData.tasks.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-gray-50 border border-mcd-border p-3 space-y-3 rounded-sm">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-7">
                    <input 
                      type="text" 
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTask()}
                      placeholder="Description de l'action..."
                      className="w-full border border-mcd-border p-2 text-xs bg-white focus:border-mcd-green outline-none rounded-sm font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select 
                      value={newTaskStatus}
                      onChange={e => setNewTaskStatus(e.target.value as any)}
                      className="w-full border border-mcd-border p-2 text-xs bg-white focus:border-mcd-green outline-none rounded-sm font-bold"
                    >
                      <option value="fait">✅ Fait</option>
                      <option value="encours">⏳ En cours</option>
                      <option value="bloque">⛔ Bloqué</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button 
                      onClick={addTask}
                      className="w-full bg-mcd-green hover:bg-[#005135] text-white font-bold p-2 text-xs flex items-center justify-center gap-1 rounded-sm transition-colors"
                    >
                      <Plus size={14} /> Ajout
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {reportData.tasks.length === 0 ? (
                  <div className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 border border-dashed border-gray-300 rounded-sm">
                    Aucune tâche enregistrée pour le moment.
                  </div>
                ) : (
                  reportData.tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-gray-50 border border-mcd-border p-2 gap-2 rounded-sm">
                      <input 
                        type="text" 
                        value={task.title}
                        onChange={e => updateTaskTitle(task.id, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-gray-800 font-semibold focus:bg-white border-b border-transparent focus:border-mcd-green outline-none px-1"
                      />
                      <select 
                        value={task.status}
                        onChange={e => updateTaskStatus(task.id, e.target.value as any)}
                        className="text-xs border border-mcd-border p-1 bg-white font-bold outline-none rounded-sm"
                      >
                        <option value="fait">✅ Fait</option>
                        <option value="encours">⏳ En cours</option>
                        <option value="bloque">⛔ Bloqué</option>
                      </select>
                      <button 
                        onClick={() => removeTask(task.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-mcd-border rounded-sm shadow-sm overflow-hidden">
            <div className="bg-mcd-green text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider">
              Compte-Rendu, Bilan & Remarques
            </div>
            <div className="p-4">
              <textarea 
                rows={4}
                value={reportData.notes}
                onChange={e => setReportData({...reportData, notes: e.target.value})}
                placeholder="Observations, incidents rencontrés, suites à donner..."
                className="w-full bg-gray-50 border border-mcd-border p-3 text-xs text-gray-800 focus:bg-white focus:border-mcd-green outline-none rounded-sm font-medium"
              ></textarea>
            </div>
          </div>

          <div className="bg-white border border-mcd-border rounded-sm shadow-sm overflow-hidden">
            <div className="bg-mcd-green text-white px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex justify-between items-center">
              <span className="flex items-center gap-2"><Camera size={14} /> Captures d'écran & Photos</span>
              <span className="text-[10px] bg-white text-mcd-green font-extrabold px-2 py-0.5 rounded-sm">
                {reportData.images.length} Photo{reportData.images.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-4 space-y-4">
              <label className="border-2 border-dashed border-mcd-green bg-emerald-50/50 p-6 text-center hover:bg-emerald-100/50 transition cursor-pointer block rounded-sm">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <Upload className="mx-auto text-mcd-green mb-2" size={28} />
                <p className="text-xs font-bold text-gray-800">Cliquez pour ajouter des images ou captures</p>
                <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP acceptés</p>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportData.images.map(img => (
                  <div key={img.id} className="bg-gray-50 border border-mcd-border p-2 space-y-2 rounded-sm relative">
                    <div className="h-28 bg-gray-200 overflow-hidden flex items-center justify-center relative rounded-sm">
                      <img src={img.dataUrl} alt="capture" className="object-cover w-full h-full" />
                      <button 
                        onClick={() => removeImage(img.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 hover:bg-red-700 transition rounded-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Légende</label>
                      <input 
                        type="text" 
                        value={img.caption}
                        onChange={e => updateImageCaption(img.id, e.target.value)}
                        placeholder="Légende de la photo..."
                        className="w-full bg-white border border-mcd-border p-1 text-xs outline-none focus:border-mcd-green rounded-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PRÉVISUALISATION A4 (ALIGNEMENTS CORRIGÉS PAR FLEXBOX AU LIEU DE GRID) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2 no-print">
            <span className="text-xs font-bold text-mcd-text uppercase tracking-wider flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-mcd-green rounded-sm"></span> Aperçu A4 en Temps Réel
            </span>
            <span className="text-xs text-mcd-muted font-mono">Format d'impression standard</span>
          </div>

          <div className="w-full overflow-x-auto pb-6">
            <div ref={previewRef} className="a4-page text-gray-900 border border-gray-300">
              <div>
                {/* Header Document */}
                <div className="border-b-4 border-mcd-green pb-3 mb-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-mcd-green text-mcd-yellow px-3 py-2 font-black text-2xl tracking-widest rounded-sm border border-[#00402a]">
                        IT
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-mcd-green uppercase tracking-wide leading-tight">RAPPORT D'ACTIVITÉ IT</h2>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">COMPTE-RENDU JOURNALIER</p>
                      </div>
                    </div>
                    <div className="text-right border-l-2 border-mcd-green pl-3">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">RÉFÉRENCE</p>
                      <p className="text-xs font-mono font-bold text-mcd-green">
                        RPT-{(reportData.reportDate || '').replace(/-/g, '') || '0000'}-IT
                      </p>
                    </div>
                  </div>

                  {/* Bandeau Vert Récapitulatif (Utilisation de Flexbox au lieu de CSS Grid) */}
                  <div className="bg-mcd-green text-white mt-3 p-2.5 flex justify-between items-center text-xs rounded-sm">
                    <div className="w-1/3 border-r border-green-700/50 pr-2">
                      <span className="block text-[9px] uppercase font-bold text-green-200">Technicien</span>
                      <span className="font-bold text-xs truncate block">{reportData.techName || 'Non spécifié'}</span>
                    </div>
                    <div className="w-1/3 border-r border-green-700/50 px-2">
                      <span className="block text-[9px] uppercase font-bold text-green-200">Date</span>
                      <span className="font-bold text-xs block">{getFormattedDate(reportData.reportDate)}</span>
                    </div>
                    <div className="w-1/3 pl-2">
                      <span className="block text-[9px] uppercase font-bold text-green-200">Site / Lieu</span>
                      <span className="font-bold text-xs truncate block">{reportData.location || 'Site Principal'}</span>
                    </div>
                  </div>
                </div>

                {/* Objet du rapport */}
                <div className="mb-4 bg-gray-50 border-l-4 border-mcd-green p-2.5 rounded-sm">
                  <h3 className="text-[9px] font-extrabold text-mcd-green uppercase tracking-wider mb-0.5">Objet / Interventions</h3>
                  <p className="text-xs font-semibold text-gray-800">{reportData.reportTitle || 'Non renseigné'}</p>
                </div>

                {/* Table des tâches */}
                <div className="mb-5">
                  <h3 className="text-xs font-black text-mcd-green uppercase tracking-wider border-b-2 border-gray-200 pb-1 mb-2 flex justify-between items-center">
                    <span>Détail des Actions & Tâches</span>
                    <span className="text-[9px] text-gray-400 font-normal">Statut & Avancement</span>
                  </h3>

                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 border-b border-gray-300 uppercase font-bold text-[9px]">
                        <th className="py-1.5 px-2 w-24">Statut</th>
                        <th className="py-1.5 px-2">Description de la Tâche / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.tasks.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-3 text-center text-gray-400 italic text-xs">Aucune tâche renseignée.</td>
                        </tr>
                      ) : (
                        reportData.tasks.map(task => (
                          <tr key={task.id}>
                            <td className="py-1.5 px-2 border-b border-gray-200">
                              {task.status === 'fait' && <span className="bg-mcd-green text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">FAIT</span>}
                              {task.status === 'encours' && <span className="bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">EN COURS</span>}
                              {task.status === 'bloque' && <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">BLOQUÉ</span>}
                            </td>
                            <td className="py-1.5 px-2 border-b border-gray-200 font-medium text-gray-800 text-xs">{task.title}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bilan & Observations */}
                <div className="mb-5">
                  <h3 className="text-xs font-black text-mcd-green uppercase tracking-wider border-b-2 border-gray-200 pb-1 mb-2">
                    Bilan, Incidents & Observations
                  </h3>
                  <div className={`text-xs text-gray-800 bg-white p-2.5 border border-gray-200 leading-relaxed min-h-[50px] whitespace-pre-line rounded-sm ${!reportData.notes ? 'italic text-gray-400' : ''}`}>
                    {reportData.notes || "Aucune remarque ou incident spécifique à signaler."}
                  </div>
                </div>

                {/* Annexes Visuelles (Flexbox au lieu de Grid) */}
                {reportData.images.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-black text-mcd-green uppercase tracking-wider border-b-2 border-gray-200 pb-1 mb-2">
                      Annexes Visuelles & Captures d'Écran
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {reportData.images.map(img => (
                        <div key={img.id} className="border border-gray-300 p-1.5 bg-gray-50 rounded-sm w-[calc(50%-6px)]">
                          <div className="h-28 bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-200 rounded-sm">
                            <img src={img.dataUrl} alt="capture" className="max-h-full max-w-full object-contain" />
                          </div>
                          <p className="text-[9px] font-bold text-gray-700 mt-1 text-center truncate">{img.caption || 'Capture sans nom'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Document PDF */}
              <div className="pt-3 border-t border-gray-300 text-[9px] text-gray-500 flex justify-between items-end">
                <div>
                  <p className="font-bold text-mcd-green">McDonald's IT Hub</p>
                  <p>Document généré le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono">Page 1 / 1</p>
                  <p className="text-[8px] text-gray-400">Rapport d'activité conforme & vérifié</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modale de confirmation */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white border-2 border-mcd-green max-w-md w-full p-6 space-y-4 shadow-2xl rounded-sm">
            <h3 className="text-base font-bold text-mcd-text uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="text-mcd-yellow" size={20} /> Confirmation
            </h3>
            <p className="text-xs text-gray-700">Voulez-vous vraiment effacer l'ensemble du rapport en cours ? Cette action ne peut pas être annulée.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsResetModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-4 py-2 border border-gray-300 transition-colors rounded-sm">
                Annuler
              </button>
              <button onClick={handleReset} className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 border border-red-800 transition-colors rounded-sm">
                Oui, effacer tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}