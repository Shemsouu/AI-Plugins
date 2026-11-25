# AI-Plugins — Claude Code Arsenal

Site statique qui classe les **50 plugins** et **50 skills** les plus utilisés avec Claude Code : description, commande `/plugin install`, équivalent npm/npx, dépôt source et graphiques d'adoption. Aucune étape de build : nginx sert directement le HTML/CSS/JS.

## Contenu du dépôt

```
.
├── index.html            # page unique
├── assets/
│   ├── styles.css        # thème sombre, responsive
│   ├── data.js           # 100 entrées + données des graphiques
│   └── app.js            # recherche, filtres, tri, copie, Chart.js
├── nginx/default.conf    # gzip, cache, en-têtes de sécurité
├── Dockerfile            # nginx:stable-alpine
├── docker-compose.yml    # port 8080 par défaut
└── README.md
```

## Déploiement sur le LXC Proxmox

Prérequis : Docker et le plugin `docker compose` installés dans le LXC.

```bash
git clone https://github.com/Shemsouu/AI-Plugins.git
cd AI-Plugins
docker compose up -d --build
```

Le site est ensuite disponible sur `http://IP_DU_LXC:8080`.

### Exposer sur le port 80

```bash
APP_PORT=80 docker compose up -d
```

### Mise à jour après un `git pull`

```bash
cd AI-Plugins
git pull
docker compose up -d --build
```

### Commandes utiles

```bash
docker compose logs -f      # suivre les logs
docker compose ps           # état du conteneur
docker compose down         # arrêter et supprimer le conteneur
```

### Sans Docker Compose

```bash
docker build -t ai-plugins .
docker run -d --name ai-plugins --restart unless-stopped -p 8080:80 ai-plugins
```

## Reverse proxy

Le conteneur écoute en HTTP sur le port 80. Si un reverse proxy (Nginx Proxy Manager, Traefik, Caddy…) est déjà en place sur le LXC, pointez-le vers `http://IP_DU_LXC:8080` : compression, cache et en-têtes de sécurité sont déjà gérés par le conteneur.

## Détails techniques

- Image `nginx:stable-alpine`, healthcheck `wget` toutes les 30 s.
- `gzip` activé pour HTML, CSS, JS et JSON.
- Cache 7 jours sur `/assets/` (les fichiers sont versionnés via `?v=`), `no-cache` sur `index.html`.
- CSP restrictive : seuls `cdn.jsdelivr.net` (Chart.js) et Google Fonts sont autorisés en plus de l'origine.
- Port hôte configurable avec `APP_PORT` (défaut : 8080).

## Données

Classement et limites méthodologiques détaillés sur le site, section « Sources ». Dernier relevé : 25/11/2026.
