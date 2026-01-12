import { z } from 'zod';

// Validation schemas for monitoring data
export const monitoringDataSchema = z.object({
  file_name: z
    .string()
    .trim()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters'),
  pic: z
    .string()
    .trim()
    .max(100, 'PIC name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s'\-\.]*$/, 'PIC contains invalid characters')
    .optional()
    .nullable()
    .transform(val => val || null),
  document_number: z
    .string()
    .trim()
    .max(50, 'Document number must be less than 50 characters')
    .optional()
    .nullable()
    .transform(val => val || null),
  approval_comment: z
    .string()
    .trim()
    .max(1000, 'Comment must be less than 1000 characters')
    .optional()
    .nullable()
    .transform(val => val || null),
});

// Schema for adding new monitoring data
export const newMonitoringDataSchema = monitoringDataSchema.extend({
  project_id: z.string().uuid('Invalid project ID').optional(),
});

// Schema for project data
export const projectDataSchema = z.object({
  project_name: z
    .string()
    .trim()
    .min(1, 'Project name is required')
    .max(255, 'Project name must be less than 255 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable()
    .transform(val => val || null),
  status: z.enum(['Active', 'On Hold', 'Completed', 'Cancelled']).default('Active'),
});

// Validation result type for proper type narrowing
export type ValidationResult<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };

// Helper function to validate and return errors in a user-friendly format
export function validateMonitoringData(data: {
  file_name?: string;
  pic?: string | null;
  document_number?: string | null;
  approval_comment?: string | null;
}): ValidationResult<z.infer<typeof monitoringDataSchema>> {
  const result = monitoringDataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return { success: false, error: firstError?.message || 'Validation failed' };
}

export function validateProjectData(data: {
  project_name?: string;
  description?: string | null;
  status?: string;
}): ValidationResult<z.infer<typeof projectDataSchema>> {
  const result = projectDataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return { success: false, error: firstError?.message || 'Validation failed' };
}
