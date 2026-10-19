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

    // Extraction du SHA256 depuis la description de la release (contourne les blocages CORS)
    const checksumMatch = release.body?.match(/SHA256:\s*([a-f0-9]{64})/i);
    const checksum = checksumMatch ? checksumMatch[1] : '';

    if (!checksum) {
      console.warn("Aucun checksum SHA256 valide trouvé dans la description de la release.");
      return;
    }

    // Le plugin natif télécharge dist.zip via Java (contourne le CORS du WebView)
    const downloadedVersion = await CapacitorUpdater.download({
      url: zipAsset.browser_download_url,
      version: latestVersion,
      checksum: checksum,
    });

    await CapacitorUpdater.set(downloadedVersion);
  } catch (error) {
    console.error("Erreur lors de la vérification OTA :", error);
  }
}