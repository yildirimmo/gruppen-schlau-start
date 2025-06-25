# 🚀 Auto-Matching System für GruppenSchlau

Dieses Dokument beschreibt das automatische Matching-System für die GruppenSchlau Plattform.

## 🎯 System Überblick

Das Auto-Matching System erstellt automatisch Gruppen von Schülern basierend auf:
- **Verfügbarkeiten**: Gleiche Zeiten für Nachhilfe
- **Bundesland**: Gleiche regionale Lage
- **Klassenstufe**: Ähnliche Bildungsniveaus
- **Gruppengröße**: 3-4 Schüler pro Gruppe

## 🚀 Kernfunktionen

### 🐐 Automatische Gruppenerstellung
- **Trigger**: Bei neuer Registrierung oder Verfügbakeitsänderung
- **Matching-Algorithmus**: Findet kompatible Schüler basierend auf Kriterien
- **Gruppenerstellung**: Erstellt pending Gruppen für Admin-Review

### 🐐 Automatische Aktivierung
- **Periodischer Trigger**: Tägliche Prüfung auf neue Matches
- **Ereignis-basierte Trigger**: Sofortige Reaktion auf Veränderungen
- **Admin-Kontrolle**: Manuelle Auslösung von Matching-Prozessen

### 🐐 Erweitertes Admin-Panel
- **Schüler-Übersicht**: Vollständige Liste aller Schüler mit Filtern
- **Statistiken**: Anzahl Schüler, Gruppen, pending Matches
- **Gruppen-Management**: Aktivierung von pending Gruppen
- **Auto-Matching Kontrolle**: Manuelle Auslösung von Matching-Prozessen

## 🛠 Datenbank Struktur

### 📊 Neue Funktionen

```sql
CREATE OR REPLACE FUNCTION find_compatible_students(
    student_id UUID,
    max_group_size IL�EGER DEEEUE�14
)...
```

```sql
CREATE OR REPLACE FUNCTION create_auto_group(
    student_ids UUID[]
)...
```

```sql
CREATE OR REPLACE FUNCTION process_auto_matching()...
```

### 📈 Trigger

```sql
CREATE TRIGGER auto_matching_trigger
    AFTER INSERT OR UPDATE ON availabilities
    FOR EACH ROW
    EXECUTE FUNCTION process_auto_matching();
```

## 💫 Implementierte Dateien

### 📁 Datenbank Migration
- `supabase/migrations/20250625195654-auto-matching-system.sql`

### 🚀 TypeScript Hooks
- `src/hooks/useAutoMatching.tsx` - Auto-Matching Funktionalität
- `src/hooks/useStudentManagement.tsx` - Schüler-Verwaltung

### 🎨 React Komponenten
- `src/components/StudentManagement.tsx` - Schüler-Übersicht Komponente

### 🧩 Test-Script
- `test-auto-matching.sql` - Test-Daten und Verifikation

## 🚀 Nutzung

### 🐠 Admin-Panel
1. **Schüler-Übersicht**: Navigiere zum neuen Tab "Schüler"
2. **Filter**: Nutze Filter für Bundesland, Klassenstufe, Gruppenstatus
3. **Aktionen**: Bearbeite, Löschen, Gruppen ansehen
4. **Auto-Matching**: Manuelle Auslösung über den "Auto-Matching ausführen" Button

### 🐐 Automatische Funktion
1. **Automatische Auslösung:** System läuft automatisch bei neuen Registrierungen
2. **Periodische Prüfung:** Tägliche Prüfung auf neue Matches
3. **Admin-Review:** Pending Gruppen erscheinen im Admin-Panel zur Bestätigung

## 🚀 Konfiguration

### 📊 Datenbank Setup
1. **Migration ausführen**:
```bash
supabase db push
```

2. **Test-Daten einspielen**:
```bash
psql -f test-auto-matching.sql -d [DATABASE_URL]
```

### 🚀 Frontend Integration
1. **Hooks importieren**:
```typescript
import { useAutoMatching } from './hooks/useAutoMatching';
import { useStudentManagement } from './hooks/useStudentManagement';
```

2. **Komponente einbinden**:
```typescript
import StudentManagement from './components/StudentManagement';
```

## 🐐 Testing

### 🧩 Test-Scenarios
1. **Neue Registrierung:** Schüler registriert sich und fügt Verfügbakeiten hinzu
2. **Verfügbakeitsänderung:** Bestehender Schüler ändert Verfügbarkeiten
3. **Manuelles Matching:** Admin löst manuell Auto-Matching aus
4. **Gruppen-Aktivierung:** Admin aktiviert pending Gruppen

### 📈 Status Verifikation
```sql
-- Prüfung auf neue Gruppen
SELECT count(*) FROM groups WHERE status = 'pending';

-- Prüfung auf automatische Matches
SELECT * FROM groups WHERE created_by = 'auto-matching-system';
```

## 🚀 Erweiterungsmöglichkeiten

### 🚀 Zukünftige Features
- **Intelligentes Matching**: Berücksichtigung von Lernstil, Interessen, Leistungsniveau
- **Geografisches Matching**: Berücksichtigung von Entfernung zwischen Schülern
- **Prioritäts-basiertes Matching**: Bevorzugung bestimmter Kriterien
- **ML-basiertes Matching**: Maschine Learning für optimale Gruppenbildung