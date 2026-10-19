import type { WikiData } from '../types/wiki';

const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/rakou-fr/IT-McDo/refs/heads/main/troubleshooting.json';
const CACHE_KEY = 'mcd_wiki_troubleshooting_cache';

export async function fetchWikiData(): Promise<WikiData> {
  try {
    const response = await fetch(`${GITHUB_JSON_URL}?t=${Date.now()}`); // Désactive le cache navigateur
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const data: WikiData = await response.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    console.warn("Impossible de charger le JSON GitHub, passage sur le cache local :", error);
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    throw new Error("Aucune fiche de panne disponible hors-ligne.");
  }
}