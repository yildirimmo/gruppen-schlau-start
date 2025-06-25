-- Test Script für Auto-Matching System
-- Dieses Script testet die Auto-Matching Funktionalität mit Testdaten

-- 1. Testdaten erstellen (Schüler mit Verfügbarkeiten)
-- Hinweis: Diese müssen normalerweise über die Anwendung erstellt werden
-- da sie auth.users benötigen. Hier nur als Referenz.

-- Test 1: Potentielle Gruppen finden
SELECT 'Test 1: Potentielle Gruppen finden' as test_name;
SELECT * FROM public.find_potential_auto_groups();

-- Test 2: Alle Schüler anzeigen
SELECT 'Test 2: Alle Schüler anzeigen' as test_name;
SELECT * FROM public.get_all_students();

-- Test 3: Wartende Gruppen mit Schülern
SELECT 'Test 3: Wartende Gruppen mit Schülern' as test_name;
SELECT * FROM public.get_pending_groups_with_students();

-- Test 4: Aktive Gruppen
SELECT 'Test 4: Aktive Gruppen' as test_name;
SELECT * FROM public.get_active_groups();

-- Test 5: Manuelles Auto-Matching (nur für Admins)
-- SELECT 'Test 5: Manuelles Auto-Matching' as test_name;
-- SELECT * FROM public.run_manual_auto_matching();

-- Hilfsfunktionen für Debugging
SELECT 'Debug: Alle Profile' as debug_info;
SELECT id, first_name, last_name, bundesland, klassenstufe, role FROM public.profiles;

SELECT 'Debug: Alle Verfügbarkeiten' as debug_info;
SELECT a.*, p.first_name, p.last_name 
FROM public.availabilities a 
JOIN public.profiles p ON a.user_id = p.id;

SELECT 'Debug: Alle Gruppen' as debug_info;
SELECT * FROM public.groups;

SELECT 'Debug: Alle Gruppenmitglieder' as debug_info;
SELECT gm.*, p.first_name, p.last_name, g.bundesland, g.klassenstufe
FROM public.group_members gm
JOIN public.profiles p ON gm.user_id = p.id
JOIN public.groups g ON gm.group_id = g.id;
