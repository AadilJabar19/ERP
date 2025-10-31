import { z } from 'zod';

// ============= Common Schemas =============

const emailSchema = z.string().email('Invalid email address');
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');
const dateSchema = z.string().or(z.date());

// ============= Employee Schema =============

export const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    dateOfBirth: dateSchema.optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
    nationality: z.string().optional(),
    bloodGroup: z.string().optional(),
  }),
  contactInfo: z.object({
    email: emailSchema,
    phone: phoneSchema,
    alternatePhone: phoneSchema.optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    emergencyContact: z.object({
      name: z.string().optional(),
      relationship: z.string().optional(),
      phone: phoneSchema.optional(),
      email: emailSchema.optional(),
    }).optional(),
  }),
  employment: z.object({
    department: z.string().min(1, 'Department is required'),
    position: z.string().min(1, 'Position is required'),
    employmentType: z.enum(['full-time', 'part-time', 'contract', 'intern']).default('full-time'),
    workLocation: z.enum(['office', 'remote', 'hybrid']).default('office'),
    hireDate: dateSchema.optional(),
    probationEndDate: dateSchema.optional(),
    contractEndDate: dateSchema.optional(),
    workingHours: z.number().min(0).max(168).default(40),
  }),
  compensation: z.object({
    baseSalary: z.number().min(0, 'Salary must be positive'),
    currency: z.string().default('USD'),
    payFrequency: z.enum(['weekly', 'bi-weekly', 'monthly']).default('monthly'),
    overtimeRate: z.number().min(0).default(1.5),
  }),
});

// ============= Leave Schema =============

export const leaveSchema = z.object({
  leaveType: z.enum(['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  totalDays: z.number().min(1, 'Total days must be at least 1'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ============= Product Schema =============

export const productSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  pricing: z.object({
    cost: z.number().min(0, 'Cost must be positive'),
    sellingPrice: z.number().min(0, 'Selling price must be positive'),
    currency: z.string().default('USD'),
  }).refine((data) => data.sellingPrice >= data.cost, {
    message: 'Selling price should be greater than or equal to cost',
    path: ['sellingPrice'],
  }),
  inventory: z.object({
    stockLevels: z.object({
      reorderPoint: z.number().min(0, 'Reorder point must be positive'),
      maxStock: z.number().min(0, 'Max stock must be positive'),
    }),
  }),
  status: z.enum(['active', 'inactive', 'discontinued']).default('active'),
});

// ============= Lead Schema =============

export const leadSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactInfo: z.object({
    email: emailSchema,
    phone: phoneSchema,
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
  }),
  source: z.enum(['website', 'referral', 'cold-call', 'social-media', 'event', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  opportunity: z.object({
    value: z.number().min(0, 'Opportunity value must be positive'),
    probability: z.number().min(0).max(100, 'Probability must be between 0 and 100'),
    expectedCloseDate: dateSchema.optional(),
  }).optional(),
  notes: z.string().optional(),
});

// ============= Customer Schema =============

export const customerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactInfo: z.object({
    email: emailSchema,
    phone: phoneSchema,
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
  }),
  billingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
  }),
  shippingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
});

// ============= Project Schema =============

export const projectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).default('planning'),
  team: z.array(z.string()).min(1, 'At least one team member is required'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ============= Event Schema =============

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  type: z.enum(['meeting', 'deadline', 'holiday', 'training', 'other']),
  location: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  isAllDay: z.boolean().default(false),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// ============= Login Schema =============

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// ============= Register Schema =============

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'manager', 'employee']).default('employee'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ============= Change Password Schema =============

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password must be different from current password",
  path: ['newPassword'],
});

// ============= Stock Movement Schema =============

export const stockMovementSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  warehouse: z.string().min(1, 'Warehouse is required'),
  movementType: z.enum(['in', 'out', 'transfer', 'adjustment']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  referenceNumber: z.string().optional(),
});

// ============= Quote Schema =============

export const quoteSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  items: z.array(z.object({
    product: z.string().min(1, 'Product is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
  })).min(1, 'At least one item is required'),
  validUntil: dateSchema.optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

// ============= Invoice Schema =============

export const invoiceSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
  })).min(1, 'At least one item is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(0),
});
