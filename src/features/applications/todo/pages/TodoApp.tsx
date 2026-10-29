import React, { useState, useEffect } from 'react';
import { 
  fetchTodoData, 
  pushTodoData, 
  saveLocalPatToken, 
  type TodoItem, 
  type TodoStatus, 
  type HistoryEntry 
} from '../../stock-it/services/githubService';
import { 
  CheckCircle2, Plus, Trash2, Calendar, CheckSquare, Save, 
  Loader2, AlertCircle, RefreshCw, Key, Eye, ChevronDown, ChevronUp 
} from 'lucide-react';

export function TodoApp() {
  const storedUserRaw = localStorage.getItem('auth_user') || localStorage.getItem('user');
  const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  const username = storedUser?.username || 'Inconnu';
  const userRole = (storedUser?.role || localStorage.getItem('user_role') || '').toLowerCase();
  const canEdit = userRole === 'it' || userRole === 'admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isAuthError, setIsAuthError] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

  const [isPatModalOpen, setIsPatModalOpen] = useState(false);
  const [patInput, setPatInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    setIsAuthError(false);
    try {
      const data = await fetchTodoData();
      setTodos(data.todos || []);
      setHistory(data.history || []);
    } catch (err: any) {
      if (err.message === "401_UNAUTHORIZED") {
        setIsAuthError(true);
        setError("Accès GitHub non autorisé. Clé PAT requise.");
      } else {
        setError("Erreur lors du chargement des To-Dos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !newTodoText.trim()) return;

    const newItem: TodoItem = {
      id: "todo_" + Math.random().toString(36).substring(2, 9),
      text: newTodoText.trim(),
      status: 'à faire',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdBy: username
    };

    setTodos([...todos, newItem]);
    setNewTodoText('');
  };

  const handleStatusChange = (id: string, newStatus: TodoStatus) => {
    if (!canEdit) return;
    setTodos(todos.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleDeleteTodo = (id: string) => {
    if (!canEdit) return;
    setTodos(todos.filter(t => t.id !== id));
  };

  const handleValidateDay = async () => {
    if (!canEdit || todos.length === 0) return;
    if (!window.confirm("Valider toutes les tâches pour aujourd'hui et les archiver dans l'historique ?")) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newHistoryEntry: HistoryEntry = {
      date: todayStr,
      validatedBy: username,
      completedTasks: [...todos]
    };

    const updatedHistory = [newHistoryEntry, ...history.filter(h => h.date !== todayStr)];
    const updatedTodos: TodoItem[] = [];

    setSaving(true);
    try {
      await pushTodoData({ todos: updatedTodos, history: updatedHistory });
      setTodos(updatedTodos);
      setHistory(updatedHistory);
      setSuccessMsg("Journée validée et archivée !");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      if (err.message === "401_UNAUTHORIZED") setIsAuthError(true);
      setError("Erreur lors de l'archivage.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveToGithub = async () => {
    if (!canEdit) return;
    setSaving(true);
    setError('');
    try {
      await pushTodoData({ todos, history });
      setSuccessMsg("Modifications enregistrées sur GitHub !");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      if (err.message === "401_UNAUTHORIZED") setIsAuthError(true);
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) return;
    saveLocalPatToken(patInput.trim());
    setIsPatModalOpen(false);
    setPatInput('');
    loadData();
  };

  const getStatusBadgeStyle = (status: TodoStatus) => {
    switch (status) {
      case 'fait':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'en cours':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-mcd-green">
        <Loader2 className="animate-spin w-8 h-8 mb-4" />
        <p className="font-semibold text-sm">Chargement des tâches...</p>
      </div>
    );
  }

  return (
    /* Remarque : pb-32 garantit assez d'espace au bas du téléphone */
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-mcd-border rounded-sm shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-mcd-text flex items-center gap-2">
            <CheckSquare className="text-mcd-green" /> TO-DO LIST IT
            {!canEdit && (
              <span className="text-xs bg-gray-100 text-gray-600 border border-gray-300 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                <Eye size={12} /> Mode Lecture
              </span>
            )}
          </h1>
          <p className="text-sm text-mcd-muted mt-0.5">Suivi des tâches quotidiennes et historique des validations</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 bg-mcd-light hover:bg-gray-200 text-mcd-text border border-mcd-border rounded-sm">
            <RefreshCw size={16} />
          </button>
          {canEdit && (
            <button onClick={handleSaveToGithub} disabled={saving} className="px-4 py-2 bg-mcd-yellow hover:bg-yellow-500 text-black font-bold text-xs border border-yellow-600 flex items-center gap-2 rounded-sm shadow-sm disabled:opacity-70">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Enregistrer
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 border border-red-200 rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircle size={18} /> {error}
          </div>
          {canEdit && isAuthError && (
            <button onClick={() => setIsPatModalOpen(true)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded shadow flex items-center gap-1.5">
              <Key size={14} /> Clé PAT GitHub
            </button>
          )}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-mcd-green p-3 border border-emerald-200 rounded-sm flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne Gauche: Tâches du Jour */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 border border-mcd-border rounded-sm shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-bold text-mcd-text text-base flex items-center gap-2">
                Tâches du Jour ({todos.length})
              </h2>
              {canEdit && todos.length > 0 && (
                <button onClick={handleValidateDay} disabled={saving} className="px-3 py-1.5 bg-mcd-green hover:bg-[#005135] text-white font-bold text-xs rounded-sm shadow flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Valider la journée
                </button>
              )}
            </div>

            {/* Formulaire d'ajout */}
            {canEdit && (
              <form onSubmit={handleAddTodo} className="flex gap-2">
                <input
                  type="text"
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="Ajouter une tâche..."
                  className="flex-1 bg-gray-50 border border-mcd-border px-3 py-2 text-sm rounded-sm outline-none focus:border-mcd-green"
                />
                <button type="submit" className="px-4 py-2 bg-mcd-green text-white font-bold text-xs rounded-sm hover:bg-[#005135] flex items-center gap-1">
                  <Plus size={16} /> Ajouter
                </button>
              </form>
            )}

            {/* Liste des To-Dos */}
            {todos.length === 0 ? (
              <div className="text-center py-8 text-mcd-muted text-sm border-2 border-dashed border-gray-100 rounded-sm">
                Aucune tâche en cours pour le moment.
              </div>
            ) : (
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 border border-mcd-border rounded-sm hover:border-mcd-green transition gap-3">
                    <div className="flex-1">
                      <p className={`text-sm font-semibold text-mcd-text ${todo.status === 'fait' ? 'line-through text-gray-400' : ''}`}>
                        {todo.text}
                      </p>
                      <p className="text-[10px] text-mcd-muted mt-0.5">Ajouté à {todo.createdAt} par {todo.createdBy}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {canEdit ? (
                        <select
                          value={todo.status}
                          onChange={(e) => handleStatusChange(todo.id, e.target.value as TodoStatus)}
                          className={`text-xs font-bold px-2 py-1 rounded border outline-none cursor-pointer ${getStatusBadgeStyle(todo.status)}`}
                        >
                          <option value="à faire">⏳ À faire</option>
                          <option value="en cours">🔄 En cours</option>
                          <option value="fait">✅ Fait</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadgeStyle(todo.status)}`}>
                          {todo.status}
                        </span>
                      )}

                      {canEdit && (
                        <button onClick={() => handleDeleteTodo(todo.id)} className="p-1 text-gray-400 hover:text-red-600 rounded transition">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Colonne Droite: Historique en Mode Accordéon sans contrainte de hauteur */}
        <div className="space-y-4">
          <div className="bg-white p-4 border border-mcd-border rounded-sm shadow-sm space-y-4">
            <h2 className="font-bold text-mcd-text text-base flex items-center gap-2 border-b border-gray-100 pb-3">
              <Calendar size={18} className="text-mcd-green" /> Historique par Jour
            </h2>

            {history.length === 0 ? (
              <p className="text-xs text-mcd-muted text-center py-4">Aucun historique archivé.</p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => {
                  const isSelected = selectedHistoryDate === entry.date;
                  return (
                    <div key={entry.date} className="border border-mcd-border rounded-sm overflow-hidden">
                      <button
                        onClick={() => setSelectedHistoryDate(isSelected ? null : entry.date)}
                        className={`w-full text-left p-3 transition flex justify-between items-center ${
                          isSelected ? 'bg-mcd-green/10 border-b border-mcd-green' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-mcd-text">📅 {entry.date}</p>
                          <p className="text-[10px] text-mcd-muted">Validé par : {entry.validatedBy}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-mcd-light px-2 py-0.5 rounded text-mcd-green border border-mcd-border">
                            {entry.completedTasks.length} tâche(s)
                          </span>
                          {isSelected ? <ChevronUp size={16} className="text-mcd-green" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </div>
                      </button>

                      {/* Détail intégré directement sous la date sélectionnée */}
                      {isSelected && (
                        <div className="p-3 bg-emerald-50/40 space-y-2 border-t border-emerald-100">
                          <p className="text-[11px] font-bold text-mcd-green uppercase tracking-wider">
                            Tâches accomplies :
                          </p>
                          <div className="space-y-1.5">
                            {entry.completedTasks.map((t) => (
                              <div key={t.id} className="p-2 bg-white border border-emerald-200 rounded text-xs flex justify-between items-center shadow-sm">
                                <span className="font-medium text-mcd-text">{t.text}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ml-2 ${getStatusBadgeStyle(t.status || 'fait')}`}>
                                  {t.status || 'fait'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modale Clé PAT */}
      {isPatModalOpen && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleSavePat} className="bg-white border-t-4 border-red-600 w-full max-w-md shadow-2xl rounded-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-mcd-text flex items-center gap-2">
              <Key className="text-red-600" size={18} /> Configuration Clé PAT GitHub
            </h3>
            <input 
              type="password" 
              required 
              value={patInput} 
              onChange={e => setPatInput(e.target.value)} 
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
              className="w-full border border-gray-300 p-2 rounded-sm text-sm outline-none focus:border-red-600 font-mono" 
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsPatModalOpen(false)} className="px-4 py-2 bg-gray-200 text-sm font-bold rounded-sm">Annuler</button>
              <button type="submit" className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-sm">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}