/**
 * Validation schemas for ticket operations
 * Uses Zod for runtime type validation
 */

import { z } from 'zod';

// Base ticket validation schema
export const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['To Do', 'In Progress', 'In Review', 'Done'], {
    errorMap: () => ({ message: 'Status must be one of: To Do, In Progress, In Review, Done' }),
  }),
  assignee: z.string().email('Assignee must be a valid email address').optional(),
  jiraKey: z.string().regex(/^([A-Z]+-\d+)$/, 'Jira key must be in format PROJECT-123').optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  status: z.enum(['To Do', 'In Progress', 'In Review', 'Done'], {
    errorMap: () => ({ message: 'Status must be one of: To Do, In Progress, In Review, Done' }),
  }).optional(),
  assignee: z.string().email('Assignee must be a valid email address').optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
);

// Bulk operations validation
export const bulkCreateTicketsSchema = z.object({
  operation: z.literal('create'),
  tickets: z.array(createTicketSchema).min(1, 'At least one ticket must be provided').max(50, 'Cannot create more than 50 tickets at once'),
});

export const bulkUpdateTicketsSchema = z.object({
  operation: z.literal('update'),
  tickets: z.array(
    z.object({
      id: z.string().uuid('Invalid ticket ID'),
      title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
      description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
      status: z.enum(['To Do', 'In Progress', 'In Review', 'Done']).optional(),
      assignee: z.string().email('Assignee must be a valid email address').optional(),
    }).refine(
      (data) => Object.keys(data).length > 1, // id + at least one field to update
      'At least one field must be provided for update'
    )
  ).min(1, 'At least one ticket must be provided').max(50, 'Cannot update more than 50 tickets at once'),
});

export const bulkOperationSchema = z.discriminatedUnion('operation', [
  bulkCreateTicketsSchema,
  bulkUpdateTicketsSchema,
]);

// Sprint activation validation
export const activateSprintSchema = z.object({
  isActive: z.boolean(),
});

// Export validation schema
export const ticketValidation = {
  create: createTicketSchema,
  update: updateTicketSchema,
  bulk: bulkOperationSchema,
  activateSprint: activateSprintSchema,
};

// Type exports for use in API routes
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type BulkOperationInput = z.infer<typeof bulkOperationSchema>;
export type ActivateSprintInput = z.infer<typeof activateSprintSchema>;