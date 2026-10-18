import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const GITHUB_REPO = 'rakou-fr/McDonald-s-IT-HUB';

export async function checkMobileUpdates() {
  // Ne s'exécute que sur l'application native Android / iOS
  if (!Capacitor.isNativePlatform()) return;

  try {
    // 1. Confirme que la version actuelle fonctionne
    await CapacitorUpdater.notifyAppReady();

    // 2. Interroge la dernière release GitHub
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (!response.ok) return;

    const release = await response.json();
    const latestVersion = release.tag_name; // Ex: "v1.0.1"

    // 3. Récupère la version actuelle du bundle sur le téléphone
    const currentBundle = await CapacitorUpdater.current();
    if (currentBundle.bundle.version === latestVersion) {
      return; // Déjà à jour
    }

    // 4. Cherche l'archive dist.zip dans la release GitHub
    const zipAsset = release.assets?.find((asset: any) => asset.name === 'dist.zip');
    if (!zipAsset) return;

    // 5. Télécharge le bundle web directement depuis GitHub
    const downloadedVersion = await CapacitorUpdater.download({
      url: zipAsset.browser_download_url,
      version: latestVersion,
    });

    // 6. Applique la nouvelle version et rafraîchit l'application
    await CapacitorUpdater.set(downloadedVersion);
  } catch (error) {
    console.error("Erreur lors de la vérification OTA :", error);
  }
}