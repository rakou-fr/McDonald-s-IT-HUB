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
    const checksumAsset = release.assets?.find((asset: any) => asset.name === 'dist.zip.sha256');

    if (!zipAsset || !checksumAsset) return;

    // 1. Récupération du hash SHA256 réel depuis GitHub
    const checksumResponse = await fetch(checksumAsset.browser_download_url);
    if (!checksumResponse.ok) return;
    const checksum = (await checksumResponse.text()).trim();

    // 2. Téléchargement sécurisé avec le vrai checksum
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