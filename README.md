# 🍟 McDonald's IT Hub

> **Suite de gestion, de maintenance et d'assistance informatique pour franchise McDonald's.**  
> Développée avec React, Vite, Capacitor, Tailwind CSS et GitHub Actions.

---

## 📸 Aperçu & Captures d'Écran

> *Dépose tes captures d'écran dans le dossier `docs/images/` pour qu'elles s'affichent automatiquement ci-dessous.*

<p align="center">
  <img src="docs/images/dashboard-preview.png" alt="Tableau de bord IT Hub" width="45%" />
  <img src="docs/images/wiki-preview.png" alt="Base de connaissances Wiki" width="45%" />
</p>

| Écran de Connexion | Fiche de Résolution Pas-à-Pas |
| :---: | :---: |
| ![LoginForm](docs/images/login-screen.png) | ![Wiki Detail](docs/images/wiki-detail.png) |

---

## 🚀 Fonctionnalités Principales

### 1. 📖 Fiches Panne & Wiki ("Self-Service")
* **Autonomisation des managers** : Guides de résolution pas à pas pour les pannes fréquentes en restaurant (Bornes de commande Acrelec/NCR, Écrans KDS Cuisine, Imprimantes étiquettes/tickets, Réseau, Caisses).
* **Mise à jour à la volée (Sans rebuild APK)** : Les fiches et équipements sont chargés en temps réel depuis un fichier JSON distant hébergé sur GitHub ([`IT-McDo/troubleshooting.json`](https://github.com/rakou-fr/IT-McDo)).
* **Recherche & Filtrage dynamique** : Recherche textuelle instantanée (titre, tags, catégorie) et filtrage par rôle (`Manager` vs `Technicien IT`).
* **Support Hors-Ligne** : Sauvegarde automatique du JSON dans le `localStorage` du téléphone pour garder l'accès aux fiches même en cas de coupure réseau dans le restaurant.

### 2. 📦 Stock-IT
* Suivi des équipements informatiques, gestion des stocks de secours et traçabilité des mouvements/prêts de matériel entre les différents restaurants de la franchise.

### 3. 📝 Rapports d'Activité
* Saisie rapide, historique et suivi des interventions techniques, dépannages et tournées de maintenance préventive.

### 4. 🔄 Mises à Jour Automatiques en Arrière-Plan (OTA Updates)
* Mises à jour instantanées de l'interface et du code Web sur les téléphones Android **sans recompiler d'APK** ni repasser par Android Studio.
* Intégration du plugin `@capgo/capacitor-updater` combinée avec la vérification d'empreinte **SHA256** extraite de la description des Releases GitHub (contournement des restrictions CORS).

---

## 🛠️ Stack Technique

* **Frontend** : React 18, TypeScript, Tailwind CSS, Lucide React, React Router v6
* **Build Tool** : Vite
* **Runtime Mobile** : Capacitor (Android)
* **OTA Updates** : `@capgo/capacitor-updater`
* **CI/CD & Automation** : GitHub Actions (`release-ota.yml`)
* **Base de Données Wiki** : JSON distant hébergé sur GitHub (`rakou-fr/IT-McDo`)

---

## 📁 Structure du Projet

```text
mcdonalds-it-hub/
├── .github/
│   └── workflows/
│       └── release-ota.yml      # Pipeline de build et publication de Release OTA
├── android/                     # Projet natif Android Capacitor
├── docs/
│   └── images/                  # Captures d'écran et illustrations du README
├── src/
│   ├── components/              # Composants UI globaux (Layout, Branding, etc.)
│   ├── features/
│   │   ├── applications/
│   │   │   ├── reports/         # Module Rapports d'Activité
│   │   │   ├── stock-it/        # Module Stock-IT
    │   │   └── wiki/            # Module Fiches Panne & Wiki
│   │   ├── auth/                # Authentification & LoginForm
│   │   └── dashboard/           # Tableau de bord principal
│   ├── services/
│   │   └── updater.ts           # Service de vérification des updates OTA Capgo
│   └── app/
│       └── router.ts            # Déclaration des routes React Router
├── capacitor.config.ts          # Configuration Capacitor (App ID, App Name)
└── package.json
```

---

## 📥 Installation & Développement Local

### Prérequis
* **Node.js** (v20 ou supérieur)
* **npm**
* **Android Studio** *(nécessaire uniquement pour la première compilation du fichier APK natif)*

### 1. Cloner le dépôt et installer les dépendances
```bash
git clone https://github.com/rakou-fr/McDonald-s-IT-HUB.git
cd McDonald-s-IT-HUB
npm install
```

### 2. Lancer le serveur de développement Web
```bash
npm run dev
```

### 3. Tester la compilation TypeScript et le build Vite
```bash
npm run build
```

---

## 📱 Compilation Initiale & Génération de l'APK Natif

Lorsque tu souhaites installer l'application pour la première fois sur un téléphone ou si tu modifies la configuration native (nom de l'app, icône, plugins natifs Android) :

1. **Compiler le code Web et synchroniser avec Capacitor** :
   ```bash
   npm run build
   npx cap sync
   ```

2. **Ouvrir le projet dans Android Studio** :
   ```bash
   npx cap open android
   ```

3. **Générer le fichier APK** :
   * Dans Android Studio, clique sur **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   * Récupère le fichier `.apk` généré et installe-le sur le téléphone Android.

---

## 🚀 Workflow de Déploiement OTA (Mise à Jour à Distance)

Une fois l'APK installé sur le téléphone, **tu n'as plus besoin de réutiliser Android Studio**. Chaque modification du code Web est déployée automatiquement à distance via un Tag Git :

1. **Valider et pusher les modifications** :
   ```bash
   git add .
   git commit -m "feat: description de la nouvelle mise à jour"
   ```

2. **Créer et pousser un Tag de version** :
   ```bash
   git tag v1.0.8
   git push origin main --tags
   ```

3. **Traitement Automatisé (GitHub Actions)** :
   * Le workflow `.github/workflows/release-ota.yml` s'exécute automatiquement.
   * Il compile l'application, génère l'archive `dist.zip`, calcule le hash SHA256 et publie une Release GitHub.
   * À la prochaine ouverture de l'application sur le téléphone, la mise à jour est téléchargée et appliquée silencieusement !

---

## 🖼️ Comment Intégrer tes Images dans le README ?

1. Crée un dossier `docs/images` à la racine de ton projet.
2. Ajoute tes images au format PNG ou JPG (ex: `login-screen.png`, `dashboard-preview.png`).
3. Dans ce fichier `README.md`, fais référence aux images avec la syntaxe Markdown standard :
   ```markdown
   ![Description de la capture](docs/images/nom-de-ton-image.png)
   ```
4. Commite et pousse le dossier d'images sur GitHub :
   ```bash
   git add docs/images/
   git commit -m "docs: ajout des captures d'écran dans le README"
   git push origin main
   ```

---

## 👨‍💻 Auteur

Développé pour la gestion et l'assistance IT de la franchise McDonald's par **[rakou-fr](https://github.com/rakou-fr)**.