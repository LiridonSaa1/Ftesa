import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";

export type Language = "sq" | "en" | "de" | "fr";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "sq", name: "Albanian", nativeName: "Shqip", flag: "🇦🇱" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  sq: {
    // Navigation
    "nav.home": "Ballina",
    "nav.dashboard": "Dashboard",
    "nav.events": "Eventet e mia",
    "nav.subscription": "Abonimi",
    "nav.settings": "Profil & Cilësime",
    "nav.admin": "Admin Panel",
    "nav.be_client": "Bëhu Klient?",
    "nav.account": "Llogaria",
    "nav.logout": "Dil nga llogaria",
    "nav.contact": "Kontakti",
    "nav.pricing": "Çmimet",
    "nav.services": "Shërbimet",
    "nav.faq": "Pyetjet",
    "nav.hall": "Salla 2D",

    // Admin Panel
    "admin.title": "Paneli i Adminit",
    "admin.subtitle": "Menaxhoni përdoruesit, faturat, kërkesat dhe cilësimet e platformës.",
    "admin.tabs.overview": "Përmbledhja",
    "admin.tabs.users": "Përdoruesit & Abonimet",
    "admin.tabs.custom": "Kërkesat Custom",
    "admin.tabs.payments": "Transaksionet",
    "admin.tabs.templates": "Template & Kategori",
    "admin.tabs.events": "Të gjitha Eventet",
    "admin.tabs.settings": "Cilësimet e Sistemit",
    "admin.stats.users": "Gjithsej Përdorues",
    "admin.stats.active_subs": "Abonime Aktive",
    "admin.stats.revenue": "Të ardhura totale",
    "admin.stats.events": "Evente me NoaEvent",
    "admin.search_placeholder": "Kërko sipas emrit ose emailit...",
    "admin.table.user": "Përdoruesi",
    "admin.table.plan": "Paketa",
    "admin.table.status": "Statusi",
    "admin.table.date": "Data",
    "admin.table.actions": "Veprime",
    "admin.save": "Ruaj ndryshimet",
    "admin.active": "Aktiv",
    "admin.pending": "Në Pritje",
    "admin.canceled": "Anuluar",

    // Landing & Hero
    "hero.title1": "Krijoni Përvojën Tuaj Të Dasmës",
    "hero.title2": "Hall Designer & Ftesat Digjitale",
    "hero.subtitle": "Menaxhoni mysafirët, ulëset në sallë dhe marrjen e konfirmimeve me QR code.",
    "hero.cta": "Bëhu Klient",
    "hero.demo": "Shiko Demoni",
    "hero.badge": "PLATFORMA #1 PËR DASMA & EVENTE",

    // Welcome Section
    "welcome.badge": "MIRË SE VENI NË NOAEVENT",
    "welcome.title": "Salla & Ftesa Digjitale me Elegancë dhe Precizion",
    "welcome.desc": "Platforma më me përvojë në Kosovë dhe rajon për organizimin e dasmave dhe ngjarjeve festive. Kurseni orë pune dhe organizoni sallën tuaj pa asnjë gabim.",
    "welcome.f1_title": "Menaxhim Mysafirësh & Ulëse",
    "welcome.f1_desc": "Caktoni secilin mysafir në tavolinën e duhur me drag-and-drop vizual.",
    "welcome.f2_title": "QR Code Check-in në Hyrje",
    "welcome.f2_desc": "Skenoni ftesat e mysafirëve në hyrje të sallës në sekonda.",
    "welcome.f3_title": "Statistika në Kohë Reale",
    "welcome.f3_desc": "Përcillni konfirmimet RSVP automatikisht në WhatsApp dhe Email.",

    // Services Section
    "services.badge": "SHËRBIMET TONA",
    "services.title": "Gjithçka që ju nevojitet për një event të përsosur",
    "services.s1_title": "Hall Designer (Plani 2D)",
    "services.s1_desc": "Dizajnoni sallën tuaj vizuale me tavolina rrethore, katrore, pista vallëzimi, skenën dhe caktimin e mysafirëve.",
    "services.s2_title": "Ftesa Digjitale me WhatsApp",
    "services.s2_desc": "Dërgoni ftesa luksoze digjitale me 1-klik në WhatsApp me konfirmim automatik RSVP.",
    "services.s3_title": "QR Code Scan në Hyrje",
    "services.s3_desc": "Menaxhoni hyrjen e mysafirëve me skanim të shpejtë në telefon pa radhë dhe pa hutesa.",
    "services.s4_title": "Raporte & Eksport Excel",
    "services.s4_desc": "Eksportoni listën përfundimtare të mysafirëve dhe tavolinave në Excel ose PDF për sallën dhe kateringun.",

    // Hall Section
    "hall.badge": "SALLA DESIGNER 2D",
    "hall.title": "Planifikoni ulëset dhe strukturën e sallës suaj në detaje",
    "hall.desc": "Me Hall Designer interactive ju ndërtoni sallën tuaj me tavolina, skenë, bar, dhe vendosni mysafirët në çdo karrige.",
    "hall.btn": "Zbuloni Mundësitë",

    // Testimonials Section
    "testi.badge": "PËRVOJAT E KLIENTËVE",
    "testi.title": "Çfarë thonë klientët tanë për NoaEvent",

    // Calculator
    "calc.badge": "INTERAKTIVE · KURSIMI I KOSTOS DHE KOHËS",
    "calc.title": "Llogaritni sa kurseni me NoaEvent",
    "calc.subtitle": "Zgjidhni numrin e parashikuar të mysafirëve për të parë kursimin e menjëhershëm",
    "calc.guests": "Numri i Mysafirëve",
    "calc.print_savings": "KURSIMI I SHTYPIT",
    "calc.time_saved": "KOHË E KURSYESHME",
    "calc.accuracy": "SAKTËSIA E SALLËS & USHQIMIT",
    "calc.in_printing": "në letra & printime",
    "calc.in_rsvp": "në telefonata RSVP",
    "calc.accuracy_val": "100% Saktësi",
    "calc.accuracy_sub": "me Hall Designer & QR Check-in në hyrje",
    "calc.diaspora_title": "Ftesa Shumëgjuhëshe për Diasporën",
    "calc.diaspora_desc": "Dërgoni ftesat në Shqip 🇦🇱, Gjermanisht 🇩🇪, Anglisht 🇬🇧 apo Frëngjisht 🇫🇷 me 1-klik në WhatsApp.",

    // Pricing
    "pricing.title": "Paketat & Çmimet",
    "pricing.subtitle": "Zgjidhni paketën e duhur për të aktivizuar llogarinë tuaj dhe për të përfituar nga të gjitha meçet tona.",
    "pricing.basic": "1 organizim (1 event)",
    "pricing.pro": "Deri në 11 organizime",
    "pricing.custom": "Organizime të pakufizuara",
    "pricing.btn": "CHOOSE PLAN",
    "pricing.popular": "Më i Popullarizuar",

    // FAQ
    "faq.badge": "PYETJET MË TË SHPESHTA",
    "faq.title": "Pyetje & Përgjigje",

    // Footer
    "footer.sub_title": "Abonohu Sot dhe Kurseni 20% Në Planin e Parë",
    "footer.sub_placeholder": "Shkruani Adresën Email",
    "footer.sub_btn": "Abonohu Tani",
    "footer.rights": "Të gjitha të drejtat e rezervuara.",

    // Floating Bar
    "float.title": "✨ Planifikoni Dasmën tuaj me NoaEvent",
    "float.btn": "Bëhu Klient",

    // Dashboard
    "dashboard.welcome": "Mirë se vini në Dashboard",
    "dashboard.active_events": "Eventet Aktive",
    "dashboard.total_guests": "Gjithsej Mysafirë",
    "dashboard.confirmed_rsvp": "Konfirmime RSVP",
    "dashboard.create_event": "Krijo Event të Ri",

    // Modal
    "modal.title": "Regjistrohu & Zgjidh Paketën",
    "modal.subtitle": "Zgjidhni paketën tuaj të preferuar për të vazhduar",
    "modal.name": "Emri & Mbiemri",
    "modal.email": "Email Adresa",
    "modal.password": "Fjalëkalimi",
    "modal.phone": "Numri i Telefonit (WhatsApp)",
    "modal.submit": "Vazhdo te Pagesa",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.events": "My Events",
    "nav.subscription": "Subscription",
    "nav.settings": "Profile & Settings",
    "nav.admin": "Admin Panel",
    "nav.be_client": "Become a Client?",
    "nav.account": "Account",
    "nav.logout": "Log Out",
    "nav.contact": "Contact",
    "nav.pricing": "Pricing",
    "nav.services": "Services",
    "nav.faq": "FAQ",
    "nav.hall": "2D Hall",

    // Admin Panel
    "admin.title": "Admin Panel",
    "admin.subtitle": "Manage users, invoices, custom requests, and platform settings.",
    "admin.tabs.overview": "Overview",
    "admin.tabs.users": "Users & Subscriptions",
    "admin.tabs.custom": "Custom Requests",
    "admin.tabs.payments": "Transactions",
    "admin.tabs.templates": "Templates & Categories",
    "admin.tabs.events": "All Events",
    "admin.tabs.settings": "System Settings",
    "admin.stats.users": "Total Users",
    "admin.stats.active_subs": "Active Subscriptions",
    "admin.stats.revenue": "Total Revenue",
    "admin.stats.events": "Events Managed",
    "admin.search_placeholder": "Search by name or email...",
    "admin.table.user": "User",
    "admin.table.plan": "Plan",
    "admin.table.status": "Status",
    "admin.table.date": "Date",
    "admin.table.actions": "Actions",
    "admin.save": "Save Changes",
    "admin.active": "Active",
    "admin.pending": "Pending",
    "admin.canceled": "Canceled",

    // Landing & Hero
    "hero.title1": "Create Your Wedding Experience",
    "hero.title2": "Hall Designer & Digital Invitations",
    "hero.subtitle": "Manage guests, hall seating arrangements, and QR code RSVP check-ins effortlessly.",
    "hero.cta": "Become a Client",
    "hero.demo": "View Demo",
    "hero.badge": "#1 WEDDING & EVENT PLATFORM",

    // Welcome Section
    "welcome.badge": "WELCOME TO NOAEVENT",
    "welcome.title": "Hall Seating & Digital Invitations with Elegance and Precision",
    "welcome.desc": "The leading platform for organizing weddings and celebrations. Save work hours and organize your venue with zero errors.",
    "welcome.f1_title": "Guest & Table Seating Management",
    "welcome.f1_desc": "Assign every guest to the right table with intuitive visual drag-and-drop.",
    "welcome.f2_title": "QR Code Check-in at Entry",
    "welcome.f2_desc": "Scan digital guest invitations at venue entry in seconds.",
    "welcome.f3_title": "Real-time RSVP Analytics",
    "welcome.f3_desc": "Track attendance confirmations automatically via WhatsApp and Email.",

    // Services Section
    "services.badge": "OUR SERVICES",
    "services.title": "Everything you need for a flawless event",
    "services.s1_title": "2D Hall Designer",
    "services.s1_desc": "Design your venue layout with round tables, rectangular tables, dance floor, stage, and guest seats.",
    "services.s2_title": "Digital WhatsApp Invitations",
    "services.s2_desc": "Send luxury digital invitations with 1-click on WhatsApp with automated RSVP tracking.",
    "services.s3_title": "Fast QR Code Gate Scan",
    "services.s3_desc": "Streamline guest entry with instant mobile QR scanning without lines or confusion.",
    "services.s4_title": "Reports & Excel Export",
    "services.s4_desc": "Export complete guest lists and seating plans to Excel or PDF for catering and hall staff.",

    // Hall Section
    "hall.badge": "2D HALL DESIGNER",
    "hall.title": "Plan seating and venue structure down to the smallest detail",
    "hall.desc": "Build your hall with tables, stage, bar, and seat your guests in every chair interactively.",
    "hall.btn": "Explore Features",

    // Testimonials Section
    "testi.badge": "CUSTOMER EXPERIENCES",
    "testi.title": "What our clients say about NoaEvent",

    // Calculator
    "calc.badge": "INTERACTIVE · TIME & COST SAVINGS",
    "calc.title": "Calculate your savings with NoaEvent",
    "calc.subtitle": "Select estimated number of guests to see your immediate savings",
    "calc.guests": "Number of Guests",
    "calc.print_savings": "PRINTING SAVINGS",
    "calc.time_saved": "TIME SAVED",
    "calc.accuracy": "HALL & CATERING ACCURACY",
    "calc.in_printing": "in paper & invitations",
    "calc.in_rsvp": "in RSVP phone calls",
    "calc.accuracy_val": "100% Accuracy",
    "calc.accuracy_sub": "with Hall Designer & QR Check-in at entry",
    "calc.diaspora_title": "Multilingual Invitations for Diaspora",
    "calc.diaspora_desc": "Send invitations in Albanian 🇦🇱, German 🇩🇪, English 🇬🇧, or French 🇫🇷 with 1-click on WhatsApp.",

    // Pricing
    "pricing.title": "Plans & Pricing",
    "pricing.subtitle": "Choose the right plan to activate your account and unlock all features.",
    "pricing.basic": "1 event organization",
    "pricing.pro": "Up to 11 event organizations",
    "pricing.custom": "Unlimited event organizations",
    "pricing.btn": "CHOOSE PLAN",
    "pricing.popular": "Most Popular",

    // FAQ
    "faq.badge": "FREQUENTLY ASKED QUESTIONS",
    "faq.title": "Questions & Answers",

    // Footer
    "footer.sub_title": "Subscribe Today & Save 20% On Your First Plan",
    "footer.sub_placeholder": "Enter Your Email Address",
    "footer.sub_btn": "Subscribe Now",
    "footer.rights": "All rights reserved.",

    // Floating Bar
    "float.title": "✨ Plan your dream wedding with NoaEvent",
    "float.btn": "Become a Client",

    // Dashboard
    "dashboard.welcome": "Welcome to Dashboard",
    "dashboard.active_events": "Active Events",
    "dashboard.total_guests": "Total Guests",
    "dashboard.confirmed_rsvp": "RSVP Confirmations",
    "dashboard.create_event": "Create New Event",

    // Modal
    "modal.title": "Register & Choose Plan",
    "modal.subtitle": "Select your preferred plan to continue",
    "modal.name": "Full Name",
    "modal.email": "Email Address",
    "modal.password": "Password",
    "modal.phone": "Phone Number (WhatsApp)",
    "modal.submit": "Proceed to Payment",
  },
  de: {
    // Navigation
    "nav.home": "Startseite",
    "nav.dashboard": "Dashboard",
    "nav.events": "Meine Events",
    "nav.subscription": "Abonnement",
    "nav.settings": "Profil & Einstellungen",
    "nav.admin": "Admin-Bereich",
    "nav.be_client": "Kunde werden?",
    "nav.account": "Konto",
    "nav.logout": "Abmelden",
    "nav.contact": "Kontakt",
    "nav.pricing": "Preise",
    "nav.services": "Leistungen",
    "nav.faq": "FAQ",
    "nav.hall": "2D-Saal",

    // Admin Panel
    "admin.title": "Admin-Panel",
    "admin.subtitle": "Verwalten Sie Benutzer, Rechnungen, individuelle Anfragen und Systemeinstellungen.",
    "admin.tabs.overview": "Übersicht",
    "admin.tabs.users": "Benutzer & Abos",
    "admin.tabs.custom": "Sonderanfragen",
    "admin.tabs.payments": "Zahlungen",
    "admin.tabs.templates": "Vorlagen & Kategorien",
    "admin.tabs.events": "Alle Events",
    "admin.tabs.settings": "Systemeinstellungen",
    "admin.stats.users": "Gesamtbenutzer",
    "admin.stats.active_subs": "Aktive Abonnements",
    "admin.stats.revenue": "Gesamteinnahmen",
    "admin.stats.events": "Verwaltete Events",
    "admin.search_placeholder": "Nach Name oder E-Mail suchen...",
    "admin.table.user": "Benutzer",
    "admin.table.plan": "Tarif",
    "admin.table.status": "Status",
    "admin.table.date": "Datum",
    "admin.table.actions": "Aktionen",
    "admin.save": "Änderungen speichern",
    "admin.active": "Aktiv",
    "admin.pending": "Ausstehend",
    "admin.canceled": "Storniert",

    // Landing & Hero
    "hero.title1": "Gestalten Sie Ihr Hochzeitserlebnis",
    "hero.title2": "Saal-Designer & Digitale Einladungen",
    "hero.subtitle": "Verwalten Sie Gäste, Sitzpläne und QR-Code-Rückmeldungen mühelos.",
    "hero.cta": "Kunde werden",
    "hero.demo": "Demo ansehen",
    "hero.badge": "#1 PLATFORM FÜR HOCHZEITEN & EVENTS",

    // Welcome Section
    "welcome.badge": "WILLKOMMEN BEI NOAEVENT",
    "welcome.title": "Saal-Sitzpläne & Digitale Einladungen mit Eleganz",
    "welcome.desc": "Die führende Plattform für die Organisation von Hochzeiten und Feiern. Sparen Sie Arbeitsstunden und gestalten Sie Ihren Saal fehlerfrei.",
    "welcome.f1_title": "Gäste- & Tischverwaltung",
    "welcome.f1_desc": "Weisen Sie jeden Gast per Drag-and-Drop dem richtigen Tisch zu.",
    "welcome.f2_title": "QR-Code Check-in am Eingang",
    "welcome.f2_desc": "Scannen Sie Einladungen am Eingang in Sekundenschnelle.",
    "welcome.f3_title": "Echtzeit-RSVP-Statistiken",
    "welcome.f3_desc": "Verfolgen Sie Rückmeldungen automatisch über WhatsApp & E-Mail.",

    // Services Section
    "services.badge": "UNSERE LEISTUNGEN",
    "services.title": "Alles, was Sie für ein perfektes Event benötigen",
    "services.s1_title": "2D Saal-Designer",
    "services.s1_desc": "Gestalten Sie Ihren Saal mit runden & eckigen Tischen, Tanzfläche, Bühne und Sitzplatzvergabe.",
    "services.s2_title": "Digitale WhatsApp-Einladungen",
    "services.s2_desc": "Senden Sie digitale Einladungen mit 1 Klick auf WhatsApp mit automatischer Rückmeldung.",
    "services.s3_title": "Schneller QR-Scan am Eingang",
    "services.s3_desc": "Verwalten Sie den Einlass per Smartphone-Scan ohne Warteschlangen.",
    "services.s4_title": "Berichte & Excel-Export",
    "services.s4_desc": "Exportieren Sie finale Gästelisten und Tischpläne nach Excel oder PDF.",

    // Hall Section
    "hall.badge": "2D SAAL-DESIGNER",
    "hall.title": "Planen Sie Sitzplätze und Raumstruktur im Detail",
    "hall.desc": "Bauen Sie Ihren Saal interaktiv mit Tischen, Bühne und Bar auf.",
    "hall.btn": "Funktionen entdecken",

    // Testimonials Section
    "testi.badge": "KUNDENERFAHRUNGEN",
    "testi.title": "Was unsere Kunden über NoaEvent sagen",

    // Calculator
    "calc.badge": "INTERAKTIV · ZEIT- UND KOSTENERSPARNIS",
    "calc.title": "Berechnen Sie Ihre Ersparnis mit NoaEvent",
    "calc.subtitle": "Wählen Sie die geschätzte Gästezahl für sofortige Ersparnisse",
    "calc.guests": "Anzahl der Gäste",
    "calc.print_savings": "DRUCKKOSTEN-ERSPARNIS",
    "calc.time_saved": "ZEITERSPARNIS",
    "calc.accuracy": "GENAUIGKEIT DES SAALPLANS",
    "calc.in_printing": "bei Drucksachen & Papier",
    "calc.in_rsvp": "bei RSVP-Anrufen",
    "calc.accuracy_val": "100% Genauigkeit",
    "calc.accuracy_sub": "mit Saal-Designer & QR-Check-in am Eingang",
    "calc.diaspora_title": "Mehrsprachige Einladungen für die Diaspora",
    "calc.diaspora_desc": "Senden Sie Einladungen auf Albanisch 🇦🇱, Deutsch 🇩🇪, Englisch 🇬🇧 oder Französisch 🇫🇷 per WhatsApp.",

    // Pricing
    "pricing.title": "Tarife & Preise",
    "pricing.subtitle": "Wählen Sie den passenden Tarif, um Ihr Konto zu aktivieren.",
    "pricing.basic": "1 Event-Organisation",
    "pricing.pro": "Bis zu 11 Event-Organisationen",
    "pricing.custom": "Unbegrenzte Event-Organisationen",
    "pricing.btn": "TARIF WÄHLEN",
    "pricing.popular": "Beliebtestes Paket",

    // FAQ
    "faq.badge": "HÄUFIG GESTELLTE FRAGEN",
    "faq.title": "Fragen & Antworten",

    // Footer
    "footer.sub_title": "Heute abonnieren & 20% auf den ersten Tarif sparen",
    "footer.sub_placeholder": "Geben Sie Ihre E-Mail-Adresse ein",
    "footer.sub_btn": "Jetzt abonnieren",
    "footer.rights": "Alle Rechte vorbehalten.",

    // Floating Bar
    "float.title": "✨ Planen Sie Ihre Traumhochzeit mit NoaEvent",
    "float.btn": "Kunde werden",

    // Dashboard
    "dashboard.welcome": "Willkommen im Dashboard",
    "dashboard.active_events": "Aktive Events",
    "dashboard.total_guests": "Gesamte Gäste",
    "dashboard.confirmed_rsvp": "RSVP-Bestätigungen",
    "dashboard.create_event": "Neues Event erstellen",

    // Modal
    "modal.title": "Registrieren & Tarif wählen",
    "modal.subtitle": "Wählen Sie Ihren bevorzugten Tarif zum Fortfahren",
    "modal.name": "Vollständiger Name",
    "modal.email": "E-Mail-Adresse",
    "modal.password": "Passwort",
    "modal.phone": "Telefonnummer (WhatsApp)",
    "modal.submit": "Weiter zur Zahlung",
  },
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.dashboard": "Tableau de bord",
    "nav.events": "Mes Événements",
    "nav.subscription": "Abonnement",
    "nav.settings": "Profil & Paramètres",
    "nav.admin": "Panneau Admin",
    "nav.be_client": "Devenir Client ?",
    "nav.account": "Compte",
    "nav.logout": "Déconnexion",
    "nav.contact": "Contact",
    "nav.pricing": "Tarifs",
    "nav.services": "Services",
    "nav.faq": "FAQ",
    "nav.hall": "Salle 2D",

    // Admin Panel
    "admin.title": "Panneau d'Administration",
    "admin.subtitle": "Gérez les utilisateurs, factures, demandes et paramètres de la plateforme.",
    "admin.tabs.overview": "Aperçu",
    "admin.tabs.users": "Utilisateurs & Abonnements",
    "admin.tabs.custom": "Demandes Personnalisées",
    "admin.tabs.payments": "Paiements",
    "admin.tabs.templates": "Modèles & Catégories",
    "admin.tabs.events": "Tous les Événements",
    "admin.tabs.settings": "Paramètres Système",
    "admin.stats.users": "Utilisateurs Totaux",
    "admin.stats.active_subs": "Abonnements Actifs",
    "admin.stats.revenue": "Revenu Total",
    "admin.stats.events": "Événements Gérés",
    "admin.search_placeholder": "Rechercher par nom ou e-mail...",
    "admin.table.user": "Utilisateur",
    "admin.table.plan": "Forfait",
    "admin.table.status": "Statut",
    "admin.table.date": "Date",
    "admin.table.actions": "Actions",
    "admin.save": "Enregistrer les modifications",
    "admin.active": "Actif",
    "admin.pending": "En attente",
    "admin.canceled": "Annulé",

    // Landing & Hero
    "hero.title1": "Créez Votre Expérience de Mariage",
    "hero.title2": "Concepteur de Salle & Invitations Numériques",
    "hero.subtitle": "Gérez les invités, le plan de table et les confirmations par QR code sans effort.",
    "hero.cta": "Devenir Client",
    "hero.demo": "Voir la Démo",
    "hero.badge": "PLATEFORME #1 POUR MARIAGES & ÉVÉNEMENTS",

    // Welcome Section
    "welcome.badge": "BIENVENUE SUR NOAEVENT",
    "welcome.title": "Plan de Table & Invitations Numériques avec Élégance",
    "welcome.desc": "La plateforme leader pour organiser mariages et célébrations. Gagnez du temps et gérez votre salle sans erreur.",
    "welcome.f1_title": "Gestion des Invités & Tables",
    "welcome.f1_desc": "Attribuez chaque invité à la bonne table avec le glisser-déposer visuel.",
    "welcome.f2_title": "Check-in par QR Code à l'Entrée",
    "welcome.f2_desc": "Scannez les invitations numériques à l'entrée en quelques secondes.",
    "welcome.f3_title": "Statistiques RSVP en Temps Réel",
    "welcome.f3_desc": "Suivez automatiquement les confirmations via WhatsApp et Email.",

    // Services Section
    "services.badge": "NOS SERVICES",
    "services.title": "Tout ce dont vous avez besoin pour un événement parfait",
    "services.s1_title": "Concepteur de Salle 2D",
    "services.s1_desc": "Concevez le plan de votre salle avec tables rondes, carrées, piste de danse, scène et sièges.",
    "services.s2_title": "Invitations Numériques WhatsApp",
    "services.s2_desc": "Envoyez des invitations luxueuses en 1 clic sur WhatsApp avec suivi RSVP automatique.",
    "services.s3_title": "Scan QR Code Rapide",
    "services.s3_desc": "Fluidifiez l'entrée des invités par simple scan sur smartphone sans file d'attente.",
    "services.s4_title": "Rapports & Export Excel",
    "services.s4_desc": "Exportez la liste finale des invités et le plan de table vers Excel ou PDF.",

    // Hall Section
    "hall.badge": "CONCEPTEUR DE SALLE 2D",
    "hall.title": "Planifiez les sièges et la structure de la salle dans les détails",
    "hall.desc": "Créez votre salle de manière interactive avec tables, scène, bar et placez vos invités.",
    "hall.btn": "Découvrir les Fonctionnalités",

    // Testimonials Section
    "testi.badge": "TÉMOIGNAGES CLIENTS",
    "testi.title": "Ce que nos clients disent de NoaEvent",

    // Calculator
    "calc.badge": "INTERACTIF · ÉCONOMIES DE TEMPS ET DE COÛT",
    "calc.title": "Calculez vos économies avec NoaEvent",
    "calc.subtitle": "Sélectionnez le nombre estimé d'invités pour voir vos économies instantanées",
    "calc.guests": "Nombre d'Invités",
    "calc.print_savings": "ÉCONOMIES D'IMPRESSION",
    "calc.time_saved": "TEMPS GAGNÉ",
    "calc.accuracy": "PRÉCISION DU PLAN & TRAITEUR",
    "calc.in_printing": "sur l'impression et les papiers",
    "calc.in_rsvp": "en appels de confirmation",
    "calc.accuracy_val": "Précision 100%",
    "calc.accuracy_sub": "avec Concepteur de Salle & QR Check-in à l'entrée",
    "calc.diaspora_title": "Invitations Multilingues pour la Diaspora",
    "calc.diaspora_desc": "Envoyez des invitations en albanais 🇦🇱, allemand 🇩🇪, anglais 🇬🇧 ou français 🇫🇷 via WhatsApp.",

    // Pricing
    "pricing.title": "Tarifs & Formules",
    "pricing.subtitle": "Choisissez le forfait idéal pour activer votre compte et accéder à toutes les fonctionnalités.",
    "pricing.basic": "1 organisation d'événement",
    "pricing.pro": "Jusqu'à 11 événements",
    "pricing.custom": "Événements illimités",
    "pricing.btn": "CHOISIR CE FORFAIT",
    "pricing.popular": "Le Plus Populaire",

    // FAQ
    "faq.badge": "FOIRE AUX QUESTIONS",
    "faq.title": "Questions & Réponses",

    // Footer
    "footer.sub_title": "Abonnez-vous aujourd'hui et économisez 20% sur votre premier forfait",
    "footer.sub_placeholder": "Entrez votre adresse e-mail",
    "footer.sub_btn": "S'abonner Maintenant",
    "footer.rights": "Tous droits réservés.",

    // Floating Bar
    "float.title": "✨ Planifiez le mariage de vos rêves avec NoaEvent",
    "float.btn": "Devenir Client",

    // Dashboard
    "dashboard.welcome": "Bienvenue sur le Tableau de Bord",
    "dashboard.active_events": "Événements Actifs",
    "dashboard.total_guests": "Total des Invités",
    "dashboard.confirmed_rsvp": "Confirmations RSVP",
    "dashboard.create_event": "Créer un Événement",

    // Modal
    "modal.title": "S'inscrire & Choisir un Forfait",
    "modal.subtitle": "Sélectionnez votre forfait préféré pour continuer",
    "modal.name": "Nom Complet",
    "modal.email": "Adresse E-mail",
    "modal.password": "Mot de Passe",
    "modal.phone": "Numéro de Téléphone (WhatsApp)",
    "modal.submit": "Procéder au Paiement",
  },
};

// Language detection helper
export function detectInitialLanguage(): Language {
  const stored = localStorage.getItem("app_lang");
  if (stored && (stored === "sq" || stored === "en" || stored === "de" || stored === "fr")) {
    return stored as Language;
  }

  // Detect via browser navigator
  if (typeof navigator !== "undefined") {
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith("sq") || navLang.includes("al")) return "sq";
    if (navLang.startsWith("de") || navLang.includes("at") || navLang.includes("ch")) return "de";
    if (navLang.startsWith("fr")) return "fr";
    if (navLang.startsWith("en") || navLang.includes("us") || navLang.includes("gb")) return "en";
  }

  // Detect via timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes("Tirane") || tz.includes("Pristina") || tz.includes("Skopje")) return "sq";
    if (tz.includes("Berlin") || tz.includes("Vienna") || tz.includes("Zurich")) return "de";
    if (tz.includes("Paris") || tz.includes("Brussels")) return "fr";
  } catch (e) {
    // Ignore error
  }

  return "sq";
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  currentLangObj: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => detectInitialLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  // Async IP-based geolocation check on first mount if not manually chosen before
  useEffect(() => {
    if (!localStorage.getItem("app_lang")) {
      fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.country_code) {
            const cc = data.country_code.toUpperCase();
            let detected: Language = "sq";
            if (["AL", "XK", "MK"].includes(cc)) detected = "sq";
            else if (["DE", "AT", "CH"].includes(cc)) detected = "de";
            else if (["FR", "BE", "LU"].includes(cc)) detected = "fr";
            else if (["US", "GB", "CA", "AU"].includes(cc)) detected = "en";

            setLanguageState(detected);
            localStorage.setItem("app_lang", detected);
          }
        })
        .catch(() => {
          // Fallback silence
        });
    }
  }, []);

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    if (TRANSLATIONS.sq[key]) {
      return TRANSLATIONS.sq[key];
    }
    return fallback || key;
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLangObj }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

// Custom Language Selector Dropdown component
export function LanguageSelector({ className = "", isDark = false }: { className?: string; isDark?: boolean }) {
  const { language, setLanguage, currentLangObj } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative inline-block text-left z-50 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border shadow-sm ${
          isDark
            ? "bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800"
            : "bg-white/90 border-slate-200 text-slate-800 hover:bg-slate-100"
        }`}
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="text-sm">{currentLangObj.flag}</span>
        <span>{currentLangObj.nativeName}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute right-0 mt-1 w-44 rounded-xl border shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-200"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-b border-border/50 mb-1">
              Select Language
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                  language === lang.code
                    ? isDark
                      ? "bg-primary/20 text-primary font-bold"
                      : "bg-primary/10 text-primary font-bold"
                    : isDark
                    ? "hover:bg-slate-800 text-slate-300"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                </span>
                {language === lang.code && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
