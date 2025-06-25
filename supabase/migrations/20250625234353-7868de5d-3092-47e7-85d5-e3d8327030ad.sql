
-- Prüfe den aktuellen Admin-Status des Benutzers
SELECT id, email, first_name, last_name, is_admin 
FROM profiles 
WHERE first_name LIKE '%Yildirim%' OR last_name LIKE '%Madanoglu%' OR email LIKE '%yildirim%';

-- Setze den Benutzer als Admin (ersetze die ID mit der tatsächlichen User ID aus der obigen Abfrage)
-- UPDATE profiles SET is_admin = true WHERE email = 'deine-email@example.com';
