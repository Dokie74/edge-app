-- Add missing manager GWC boolean fields to assessments table

ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS manager_gwc_gets_it boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS manager_gwc_wants_it boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS manager_gwc_capacity boolean DEFAULT NULL;