import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

const GITHUB_REPO = 'rakou-fr/McDonald-s-IT-HUB';

export async function checkMobileUpdates() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await CapacitorUpdater.notifyAppReady();

    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (!response.ok) return;

    const release = await response.json();
    const latestVersion = release.tag_name;

    const currentBundle = await CapacitorUpdater.current();
    if (currentBundle.bundle.version === latestVersion) {
      return;
    }

    const zipAsset = release.assets?.find((asset: any) => asset.name === 'dist.zip');
    if (!zipAsset) return;

    // Téléchargement du bundle en fournissant le paramètre checksum requis
    const downloadedVersion = await CapacitorUpdater.download({
      url: zipAsset.browser_download_url,
      version: latestVersion,
      checksum: '', // Évite l'erreur "No checksum provided"
    });

    await CapacitorUpdater.set(downloadedVersion);
  } catch (error) {
    console.error("Erreur lors de la vérification OTA :", error);
  }
}