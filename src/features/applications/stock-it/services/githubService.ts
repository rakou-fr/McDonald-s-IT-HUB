const REPO_OWNER = 'rakou-fr';
const REPO_NAME = 'Licences';
const FILE_PATH = 'stock%20IT.json'; // URL encodée pour l'espace
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

// On récupère le token depuis les variables d'environnement Vite
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Le SHA est requis par GitHub pour pouvoir écraser un fichier existant
let currentFileSha = ''; 

/**
 * Fonction utilitaire pour "aplatir" le JSON complexe en tableau d'objets pour React
 */
export function parseJsonToState(jsonData: any) {
  const items: any[] = [];
  const categoriesSet = new Map();
  const rootCategories = jsonData["Stock arrière"]?.["Catégories"] || jsonData;

  for (const [catName, catContent] of Object.entries(rootCategories)) {
    categoriesSet.set(catName, { name: catName });

    const traverse = (obj: any, subCatName = "") => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "number") {
          items.push({ id: crypto.randomUUID(), category: catName, subcategory: subCatName, name: key, qte: value, status: "Fonctionnel", note: "" });
        } else if (typeof value === "object" && value !== null) {
          const v = value as any;
          if (v.hasOwnProperty("qte") || v.hasOwnProperty("État")) {
            items.push({ id: crypto.randomUUID(), category: catName, subcategory: subCatName, name: key, qte: v.qte || 1, status: v["État"] || "Fonctionnel", note: v.Note || "" });
          } else {
            traverse(value, key);
          }
        }
      }
    };
    traverse(catContent);
  }
  return { categories: Array.from(categoriesSet.values()), items };
}

/**
 * Récupère les données depuis GitHub
 */
export async function fetchStockData() {
  const response = await fetch(GITHUB_API_URL, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    },
    cache: 'no-store' // Essentiel pour ne pas récupérer une version obsolète
  });

  if (!response.ok) {
    if (response.status === 404) return { "Stock arrière": { "Catégories": {} } };
    throw new Error(`Erreur de lecture du JSON GitHub: ${response.status}`);
  }

  const data = await response.json();
  currentFileSha = data.sha; // On sauvegarde le SHA pour le futur push

  // Décodage du contenu Base64 renvoyé par GitHub
  const jsonString = decodeURIComponent(escape(atob(data.content)));
  return JSON.parse(jsonString);
}

/**
 * Pousse (sauvegarde) les données vers GitHub
 */
export async function pushStockData(state: any) {
  // 1. Convertir l'état plat de React vers le format JSON imbriqué d'origine
  const exportTree: any = { "Stock arrière": { "Catégories": {} } };
  const categoriesTree = exportTree["Stock arrière"]["Catégories"];

  state.categories.forEach((cat: any) => { categoriesTree[cat.name] = {}; });

  state.items.forEach((item: any) => {
    if (!categoriesTree[item.category]) categoriesTree[item.category] = {};
    let targetGroup = categoriesTree[item.category];

    if (item.subcategory && item.subcategory.trim() !== "") {
      if (!targetGroup[item.subcategory]) targetGroup[item.subcategory] = {};
      targetGroup = targetGroup[item.subcategory];
    }

    if (item.status === "Fonctionnel" && !item.note) {
      targetGroup[item.name] = item.qte;
    } else {
      targetGroup[item.name] = {
        "État": item.status,
        "qte": item.qte,
        ...(item.note ? { "Note": item.note } : {})
      };
    }
  });

  // 2. Encoder en Base64 pour l'API GitHub
  const jsonString = JSON.stringify(exportTree, null, 2);
  const base64Content = btoa(unescape(encodeURIComponent(jsonString)));

  // 3. Pousser vers GitHub
  const response = await fetch(GITHUB_API_URL, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `Mise à jour du stock IT - ${new Date().toLocaleString('fr-FR')}`,
      content: base64Content,
      sha: currentFileSha // Indispensable pour écraser le fichier existant
    })
  });

  if (!response.ok) throw new Error(`Erreur lors de la sauvegarde sur GitHub: ${response.status}`);
  
  const data = await response.json();
  currentFileSha = data.content.sha; // Mise à jour du SHA pour les prochaines sauvegardes
  return true;
}