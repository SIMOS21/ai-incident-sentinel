# 🤖 AI Incident Sentinel

> Système de monitoring intelligent en temps réel avec détection d'anomalies par Machine Learning

[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

---

## 📋 Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Demo Live](#-demo-live)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [API Documentation](#-api-documentation)
- [Contribuer](#-contribuer)
- [Auteur](#-auteur)
- [License](#-license)

---

## 🎯 À Propos

**AI Incident Sentinel** est une plateforme de monitoring avancée qui utilise le Machine Learning (Isolation Forest) pour détecter automatiquement les anomalies dans les systèmes en temps réel.

### Cas d'usage

- 🏭 **Monitoring IoT** - Surveillance de capteurs industriels
- 🔐 **Cybersécurité** - Détection d'intrusions
- 💻 **DevOps** - Monitoring d'infrastructure
- 💳 **Finance** - Détection de fraudes
- 🛒 **E-commerce** - Anomalies de transactions

---

## ✨ Fonctionnalités

### 🔴 Dashboard Temps Réel
- Mise à jour automatique toutes les 5 secondes
- 5 KPIs en temps réel
- Alertes critiques avec animations
- Graphiques interactifs
- Timeline d'activité

### 🤖 Détection ML
- **Isolation Forest** pour détection d'anomalies
- Classification automatique (High/Medium/Low)
- Score d'anomalie précis
- Pipeline ML complet

### 📊 Analytics Avancées
- Évolution temporelle
- Distribution horaire (heatmap)
- Répartition par jour de semaine
- Top 10 sources
- Comparaison de périodes (7j/30j/90j/All)

### 📄 Génération de Rapports PDF
- Page de garde professionnelle
- Résumé exécutif avec KPIs
- Graphiques et statistiques
- Top 20 incidents critiques
- Analyse par source
- Recommandations automatiques

### 🎛️ Panneau Admin
- Générateur d'incidents continu (backend)
- Actions rapides (10, 50, crise)
- Console de logs en temps réel
- Contrôle total du système
- Continue en arrière-plan

### 🔐 Authentification JWT
- Login sécurisé
- Tokens JWT (24h)
- Gestion des rôles (Admin/Viewer)
- Protection des routes
- Sessions persistantes

### 🎨 Interface Moderne
- Design dark/light mode
- Responsive (mobile, tablet, desktop)
- Animations fluides
- Tailwind CSS
- Expérience utilisateur optimale

---

## 🎮 Demo Live

### 🌐 Accès Public

**URL Demo** : [https://ai-sentinel.vercel.app](https://votre-url.com) *(à configurer)*

### 🔑 Comptes de Test

| Rôle | Username | Password | Accès |
|------|----------|----------|-------|
| 👑 **Admin** | `admin` | `admin123` | Tous droits (Dashboard, Incidents, Analytics, Admin, Settings) |
| 👤 **Viewer** | `demo` | `demo123` | Lecture seule (pas d'accès Admin) |

### 🧪 Testez les Fonctionnalités

1. **Connectez-vous** avec un compte
2. **Dashboard** → Voir les données en temps réel
3. **Page Admin** → Générer des incidents
4. **Incidents** → Filtrer et rechercher
5. **Analytics** → Explorer les graphiques
6. **Export PDF** → Télécharger un rapport

---

## 📸 Screenshots

### Dashboard - Command Center
![Dashboard](docs/screenshots/dashboard.png)
*Vue d'ensemble temps réel avec KPIs et alertes*

### Page Incidents - Gestion
![Incidents](docs/screenshots/incidents.png)
*Filtres avancés, recherche et pagination*

### Analytics - Insights
![Analytics](docs/screenshots/analytics.png)
*Graphiques et analyses de tendances*

### Admin - Contrôle
![Admin](docs/screenshots/admin.png)
*Génération de données et monitoring système*

### Login - Sécurité
![Login](docs/screenshots/login.png)
*Authentification JWT sécurisée*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │Incidents │  │Analytics │  │  Admin  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │             │               │             │      │
│       └─────────────┴───────────────┴─────────────┘      │
│                         │                                │
│                    Axios/Fetch                           │
└──────────────────────────┬──────────────────────────────┘
                           │
                    ┌──────▼─────────┐
                    │   FastAPI      │
                    │   (Backend)    │
                    └──────┬─────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼─────┐    ┌─────▼─────┐
    │ ML      │      │PostgreSQL │    │ Services  │
    │Isolation│      │  Database │    │  (PDF,    │
    │ Forest  │      │           │    │   Notif)  │
    └─────────┘      └───────────┘    └───────────┘
```

### Pipeline de Données

```
Device/Sensor → /v1/ingest → ML Model → Incident Manager → PostgreSQL → /v1/incidents → Frontend
```

---

## 🛠️ Technologies

### Backend
- **FastAPI** 0.109 - Framework web moderne et rapide
- **Python** 3.11 - Langage de programmation
- **PostgreSQL** - Base de données relationnelle
- **SQLAlchemy** - ORM Python
- **Scikit-learn** - Machine Learning (Isolation Forest)
- **ReportLab** - Génération de PDF
- **Python-jose** - JWT Authentication
- **Uvicorn** - Serveur ASGI

### Frontend
- **React** 18.2 - Bibliothèque UI
- **React Router** 6 - Navigation
- **Tailwind CSS** 3 - Framework CSS
- **Recharts** 2 - Graphiques
- **Vite** - Build tool

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration
- **Git** - Contrôle de version

---

## 📦 Installation

### Prérequis

- **Python** 3.11+
- **Node.js** 18+
- **Docker** & Docker Compose
- **Git**

### 1️⃣ Cloner le Repository

```bash
git clone https://github.com/votre-username/ai-incident-sentinel.git
cd ai-incident-sentinel
```

### 2️⃣ Backend Setup

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer la base de données
docker-compose up -d

# Lancer le serveur
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera accessible sur `http://localhost:8000`

### 3️⃣ Frontend Setup

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

### 4️⃣ Générer des Données de Test

```bash
cd backend
python generate_live_data.py
```

---

## 🚀 Utilisation

### Accès à l'Application

1. Ouvrez `http://localhost:5173`
2. Connectez-vous avec :
   - Admin : `admin` / `admin123`
   - Demo : `demo` / `demo123`

### Générer des Incidents

#### Via la Page Admin
1. Allez sur **Admin** dans le menu
2. Cliquez sur **"▶️ Démarrer"**
3. Le générateur crée des incidents automatiquement
4. Changez de page, il continue en arrière-plan !

#### Via Script Python
```bash
cd backend
python generate_live_data.py
```

### Exporter un Rapport PDF

1. Allez sur **Dashboard** ou **Analytics**
2. Cliquez sur **"Exporter"**
3. Choisissez **"Rapport PDF Détaillé"**
4. Sélectionnez la période
5. Le PDF se télécharge automatiquement

---

## 📚 API Documentation

### Documentation Interactive

Une fois le backend lancé, accédez à :

- **Swagger UI** : `http://localhost:8000/docs`
- **ReDoc** : `http://localhost:8000/redoc`

### Endpoints Principaux

#### Ingestion
```
POST /v1/ingest/
```
Reçoit des données de capteurs et crée des incidents

#### Incidents
```
GET /v1/incidents/
GET /v1/incidents/{id}
```
Récupère les incidents

#### Authentication
```
POST /v1/auth/login
GET /v1/auth/me
```
Authentification JWT

#### Admin
```
POST /v1/admin/generator/start
POST /v1/admin/generator/stop
GET /v1/admin/generator/status
POST /v1/admin/generate-test
```
Contrôle du générateur

#### Reports
```
GET /v1/reports/generate?period=day
```
Génération de rapports PDF

---

## 🧪 Tests

### Backend
```bash
cd backend
pytest --cov=app
```

### Frontend
```bash
cd frontend
npm test
```

---

## 🐳 Docker Deployment

### Build et Run
```bash
docker-compose up --build
```

### Services
- Backend : `http://localhost:8000`
- Frontend : `http://localhost:80`
- PostgreSQL : `localhost:5432`

---

## 📊 Métriques du Projet

- **Lignes de code** : ~8,000
- **Endpoints API** : 15+
- **Pages Frontend** : 5
- **Composants React** : 20+
- **Modèles ML** : 1 (Isolation Forest)
- **Durée développement** : 4 mois

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 🎓 Contexte

Projet de fin d'études - École d'Ingénieurs  
**Domaine** : Machine Learning, Monitoring, DevOps  
**Durée** : 4 mois  
**Année** : 2026

---

## 👨‍💻 Auteur

**[Votre Nom]**

- LinkedIn : [linkedin.com/in/votre-profil](https://linkedin.com/in/votre-profil)
- GitHub : [@votre-username](https://github.com/votre-username)
- Email : votre.email@example.com

---

## 📝 License

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- **FastAPI** pour le framework backend
- **React** pour l'interface utilisateur
- **Scikit-learn** pour le ML
- **Tailwind CSS** pour le design

---

## 📈 Roadmap

### Version 1.1 (À venir)
- [ ] WebSockets pour temps réel push
- [ ] Notifications par Email/Slack
- [ ] Export Excel
- [ ] Dashboard personnalisable
- [ ] Alertes configurables

### Version 2.0 (Futur)
- [ ] Multiple ML models
- [ ] Auto-scaling
- [ ] Multi-tenancy
- [ ] Mobile app
- [ ] IA générative pour recommandations

---

<div align="center">

**⭐ Si vous aimez ce projet, donnez-lui une étoile sur GitHub ! ⭐**

Made with ❤️ by [Votre Nom]

</div>
