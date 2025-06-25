# Auto-Matching System für GruppenSchlau

## Übersicht

Das Auto-Matching System wurde erfolgreich implementiert und ermöglicht die automatische Erstellung von Schülergruppen basierend auf:
- Bundesland
- Klassenstufe  
- Verfügbarkeiten (gemeinsame Zeitslots)
- Mindestanzahl von 3 Schülern pro Gruppe

## Implementierte Features

### ✅ 1. Database Functions (SQL)

**Datei:** `supabase/migrations/20250625195654-auto-matching-system.sql`

- `find_potential_auto_groups()` - Findet potentielle Gruppen mit 3+ Schülern
- `create_auto_groups()` - Erstellt automatisch Gruppen aus potentiellen Matches
- `get_all_students()` - Holt alle Schüler für Admin-Übersicht
- `run_manual_auto_matching()` - Manuelles Auto-Matching für Admins
- `trigger_auto_matching()` - Trigger-Funktion für automatisches Matching

### ✅ 2. Trigger System

**Automatische Trigger:**
- Bei neuen Verfügbarkeiten (`availabilities` INSERT)
- Bei neuen Schüler-Registrierungen (`profiles` INSERT/UPDATE)
- Verwendet `pg_notify` für asynchrone Verarbeitung

### ✅ 3. React Hooks

**Datei:** `src/hooks/useAutoMatching.tsx`
- Potentielle Gruppen anzeigen
- Manuelles Auto-Matching starten
- Auto-Matching triggern

**Datei:** `src/hooks/useStudentManagement.tsx`
- Alle Schüler anzeigen mit Filtern
- Schüler bearbeiten/löschen
- Statistiken

### ✅ 4. Admin-Panel Erweiterungen

**Datei:** `src/pages/AdminDashboard.tsx`
- Neue Tabs-Navigation:
  - **Gruppen-Management:** Wartende Gruppen verwalten
  - **Schüler-Übersicht:** Alle Schüler mit Filtern
  - **Aktive Gruppen:** Übersicht aktiver Gruppen
- Auto-Matching Sektion mit "Auto-Matching starten" Button
- Potentielle Gruppen Vorschau

**Datei:** `src/components/StudentManagement.tsx`
- Vollständige Schüler-Tabelle
- Filter nach Bundesland, Klassenstufe, Gruppenstatus
- Suchfunktion
- Statistik-Cards
- Schüler löschen/bearbeiten

### ✅ 5. TypeScript Types

**Datei:** `src/integrations/supabase/types.ts`
- Alle neuen Database Functions typisiert
- Vollständige Type-Safety

## Funktionsweise

### Auto-Matching Algorithmus

1. **Schüler sammeln:** Alle Schüler ohne Gruppe mit Verfügbarkeiten
2. **Matching:** Findet 3er-Gruppen mit:
   - Gleichem Bundesland
   - Gleicher Klassenstufe
   - Mindestens 1 gemeinsamer Zeitslot
3. **Gruppenerstellung:** Erstellt Gruppen im "pending" Status
4. **Admin-Review:** Admin kann Gruppen aktivieren und WhatsApp-Links hinzufügen

### Trigger-System

```sql
-- Bei neuen Verfügbarkeiten
CREATE TRIGGER availability_auto_matching_trigger
  AFTER INSERT ON public.availabilities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_availability_change();

-- Bei neuen Schüler-Registrierungen  
CREATE TRIGGER student_registration_auto_matching_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_student_registration();
```

## Admin-Funktionen

### Manuelles Auto-Matching
```typescript
const { runAutoMatching } = useAutoMatching();
// Startet manuell das Auto-Matching
runAutoMatching.mutate();
```

### Schüler-Management
```typescript
const { students, deleteStudent, updateStudent } = useStudentManagement();
// Alle Schüler mit Filtern
// Schüler bearbeiten/löschen
```

## Testing

### Testdaten erstellen
1. Registriere 3+ Schüler mit gleichem Bundesland/Klassenstufe
2. Füge überlappende Verfügbarkeiten hinzu
3. Auto-Matching sollte automatisch triggern

### Manueller Test
```sql
-- Potentielle Gruppen anzeigen
SELECT * FROM public.find_potential_auto_groups();

-- Auto-Matching manuell starten (als Admin)
SELECT * FROM public.run_manual_auto_matching();
```

## Nächste Schritte

### 🔧 Noch zu implementieren:
1. **Edge Function für periodisches Auto-Matching** (optional)
2. **E-Mail-Benachrichtigungen** bei neuen Gruppen
3. **Erweiterte Matching-Kriterien** (z.B. Fächer, Level)
4. **Gruppen-Auflösung** bei Inaktivität

### 🎯 Priorität HOCH:
- **Testing mit echten Daten** - Das System ist bereit für Tests
- **Admin-Training** - Admins über neue Features informieren

## Verwendung

### Für Admins:
1. Gehe zu Admin-Dashboard
2. Tab "Schüler-Übersicht" für alle Schüler
3. Auto-Matching Sektion für manuelles Matching
4. Tab "Gruppen-Management" für wartende Gruppen

### Automatisch:
- System läuft automatisch bei neuen Verfügbarkeiten
- Gruppen werden automatisch erstellt wenn 3+ passende Schüler vorhanden
- Admin wird über neue Gruppen informiert

## Technische Details

### Performance
- Optimierte SQL-Queries mit CTEs
- Indizierte Tabellen für schnelle Suche
- Batch-Processing für mehrere Gruppen

### Sicherheit
- Alle Functions mit `SECURITY DEFINER`
- Admin-Checks für kritische Operationen
- RLS Policies für Datenschutz

### Skalierbarkeit
- Limit von 10 Gruppen pro Auto-Matching Durchlauf
- Asynchrone Trigger mit `pg_notify`
- Effiziente Datenbank-Queries
