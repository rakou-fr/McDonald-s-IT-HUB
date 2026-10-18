const REPO_OWNER = 'rakou-fr';
const REPO_NAME = 'IT-McDo';
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const getHeaders = () => ({
  'Authorization': `Bearer ${TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
});

// Cache local des SHA pour chaque fichier
const shaCache: Record<string, string> = {};

export interface Restaurant {
  id: string;
  name: string;
  code?: string;
}

/**
 * 1. Gestion de la liste des restaurants (restaurants.json)
 */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/restaurants.json`;
  try {
    const res = await fetch(url, { headers: getHeaders(), cache: 'no-store' });
    if (!res.ok) return [{ id: 'default', name: 'Restaurant Principal' }];
    const data = await res.json();
    shaCache['restaurants.json'] = data.sha;
    const content = decodeURIComponent(escape(atob(data.content)));
    return JSON.parse(content).restaurants || [];
  } catch {
    return [{ id: 'default', name: 'Restaurant Principal' }];
  }
}

export async function saveRestaurants(restaurants: Restaurant[]): Promise<boolean> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/restaurants.json`;
  const jsonString = JSON.stringify({ restaurants }, null, 2);
  const content = btoa(unescape(encodeURIComponent(jsonString)));

  const body: any = {
    message: 'Mise à jour de la liste des restaurants',
    content
  };
  if (shaCache['restaurants.json']) body.sha = shaCache['restaurants.json'];

  const res = await fetch(url, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) });
  if (res.ok) {
    const data = await res.json();
    shaCache['restaurants.json'] = data.content.sha;
  }
  return res.ok;
}

/**
 * 2. Gestion du stock d'un restaurant spécifique
 */
export async function fetchStockDataForRestaurant(restaurantId: string) {
  const filePath = `stocks/${restaurantId}.json`;
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

  try {
    const res = await fetch(url, { headers: getHeaders(), cache: 'no-store' });
    if (!res.ok) return { "Stock arrière": { "Catégories": {} } };
    const data = await res.json();
    shaCache[filePath] = data.sha;
    const content = decodeURIComponent(escape(atob(data.content)));
    return JSON.parse(content);
  } catch {
    return { "Stock arrière": { "Catégories": {} } };
  }
}

export async function pushStockDataForRestaurant(restaurantId: string, state: any): Promise<boolean> {
  const filePath = `stocks/${restaurantId}.json`;
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;

  // Conversion vers la structure d'origine
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

  const jsonString = JSON.stringify(exportTree, null, 2);
  const content = btoa(unescape(encodeURIComponent(jsonString)));

  const body: any = {
    message: `Mise à jour stock [${restaurantId}]`,
    content
  };
  if (shaCache[filePath]) body.sha = shaCache[filePath];

  const res = await fetch(url, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) });
  if (res.ok) {
    const data = await res.json();
    shaCache[filePath] = data.content.sha;
  }
  return res.ok;
}

/**
 * 3. Récupération consolidée pour la Vue Globale
 */
export async function fetchAllStocksGlobal(restaurants: Restaurant[]) {
  const globalItemsMap = new Map<string, any>();

  for (const restau of restaurants) {
    const rawData = await fetchStockDataForRestaurant(restau.id);
    const parsed = parseJsonToState(rawData);

    parsed.items.forEach(item => {
      const key = `${item.category}__${item.subcategory || 'Général'}__${item.name}`;
      if (!globalItemsMap.has(key)) {
        globalItemsMap.set(key, {
          id: key,
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          totalQty: 0,
          breakdownByRestau: [] // Répartition par restaurant
        });
      }
      const entry = globalItemsMap.get(key);
      entry.totalQty += item.qte;
      entry.breakdownByRestau.push({
        restaurantName: restau.name,
        restaurantId: restau.id,
        qte: item.qte,
        status: item.status
      });
    });
  }

  return Array.from(globalItemsMap.values());
}

/**
 * Fonction utilitaire d'origine pour parser la structure JSON en tableau React
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
    if (typeof catContent === 'object' && catContent !== null) traverse(catContent);
  }
  return { categories: Array.from(categoriesSet.values()), items };
}