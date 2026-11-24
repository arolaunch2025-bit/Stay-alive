# Stay-alive — Le Temple de la conscience

Application personnelle React/PWA pour observer ses émotions, sentiments, pensées et pratiques contemplatives.

## Démarrer en local

```bash
npm install
npm run dev
```

## Construire

```bash
npm run build
npm run preview
```

## Installation et mode hors connexion

Stay-alive est une Progressive Web App. Après une première visite en ligne, le navigateur met en cache l'interface et ses ressources statiques. Sur Chrome/Edge, utiliser « Installer l'application » dans la barre d'adresse ou le menu du navigateur. Sur Android, utiliser « Installer l'application » ou « Ajouter à l'écran d'accueil ».

Les observations, journaux et ressources importées sont conservés localement dans le navigateur. Exporter régulièrement une sauvegarde JSON depuis la barre latérale.

## Confidentialité et limites

- Aucun compte ni backend distant n'est requis.
- Les données sont locales au navigateur et à l'appareil.
- Effacer les données du navigateur peut supprimer les données locales : exporter des sauvegardes.
- Le mode hors connexion est disponible après chargement initial et mise en cache du site.
- Les fichiers médias sont actuellement conservés sous forme de données locales ; surveiller l'espace disponible.

Les scores sont des indicateurs subjectifs et ne constituent ni un diagnostic médical ni une mesure physique de vibration.

## Déploiement

Le projet est configuré pour Vercel avec Vite. Connecter le dépôt GitHub et utiliser :
- Build command : `npm run build`
- Output directory : `dist`
- Install command : `npm install`
