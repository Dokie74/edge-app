-- Add admin approval tracking fields to assessments table

ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS admin_approval_notes text,
ADD COLUMN IF NOT EXISTS admin_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS admin_approved_by uuid,
ADD COLUMN IF NOT EXISTS admin_revision_notes text,
ADD COLUMN IF NOT EXISTS admin_revision_requested_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS admin_revision_requested_by uuid;

-- Add foreign key constraints for admin tracking
ALTER TABLE public.assessments 
ADD CONSTRAINT fk_admin_approved_by 
    FOREIGN KEY (admin_approved_by) REFERENCES employees(id),
ADD CONSTRAINT fk_admin_revision_requested_by 
    FOREIGN KEY (admin_revision_requested_by) REFERENCES employees(id);