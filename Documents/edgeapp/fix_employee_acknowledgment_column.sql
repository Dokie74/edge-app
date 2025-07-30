-- Add missing employee_acknowledged_at column to assessments table
-- This column is needed for tracking when employees acknowledge completed manager reviews

ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS employee_acknowledged_at timestamp with time zone;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assessments' 
AND column_name = 'employee_acknowledged_at';

SELECT 'employee_acknowledged_at column added successfully!' as result;