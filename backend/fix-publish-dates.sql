-- Fix existing published announcements to have publishDate set
-- This SQL will set publishDate to createdAt for all published announcements that don't have a publishDate

UPDATE Announcement 
SET publishDate = createdAt 
WHERE isPublished = true 
  AND publishDate IS NULL;

-- Verify the update
SELECT id, title, isPublished, publishDate, createdAt 
FROM Announcement 
WHERE isPublished = true 
ORDER BY publishDate DESC;
