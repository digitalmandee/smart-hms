-- Update Reception menu icon to ConciergeBell (Desk doesn't exist in lucide-react)
UPDATE menu_items SET icon = 'ConciergeBell' WHERE code = 'reception';