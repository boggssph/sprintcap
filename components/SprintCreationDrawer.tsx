"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Combobox } from "@/components/ui/combobox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

// Enhanced form schema with comprehensive validation
const formSchema = z.object({
  name: z.string()
    .min(1, "Sprint name is required")
    .max(100, "Name must be 100 characters or less")
    .refine((name) => name.trim().length >= 3, {
      message: "Sprint name should be at least 3 characters"
    }),
  squadId: z.string().min(1, "Please select a squad"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})
.refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
})
.refine((data) => {
  const start = new Date(data.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return start >= today;
}, {
  message: "Start date cannot be in the past",
  path: ["startDate"]
})
.refine((data) => {
  if (!data.startDate || !data.endDate) return true;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return durationDays >= 1 && durationDays <= 90;
}, {
  message: "Sprint duration should be between 1-90 days",
  path: ["endDate"]
})

interface SprintCreationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSprintCreated?: () => void
}

interface Squad {
  id: string
  name: string
  alias: string
}

// Error boundary component
class SprintCreationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SprintCreationDrawer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Drawer open={true} onOpenChange={() => {}}>
          <DrawerContent className="max-h-[95vh] w-full max-w-2xl mx-auto">
            <DrawerHeader>
              <DrawerTitle className="text-red-600">Something went wrong</DrawerTitle>
              <DrawerDescription>
                There was an error loading the sprint creation form.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6 pb-6">
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      );
    }

    return this.props.children;
  }
}

function SprintCreationDrawerInner({
  open,
  onOpenChange,
  onSprintCreated
}: SprintCreationDrawerProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [squads, setSquads] = React.useState<Squad[]>([]);
  const [isLoadingSquads, setIsLoadingSquads] = React.useState(false);
  const [squadError, setSquadError] = React.useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Draft functionality
  const [draftKey] = React.useState(() => `sprint-draft-${Date.now()}`);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      squadId: "",
      startDate: "",
      endDate: "",
    },
  });

  // Draft saving functionality
  const saveDraft = React.useCallback(() => {
    const values = form.getValues();
    localStorage.setItem(draftKey, JSON.stringify({
      ...values,
      savedAt: new Date().toISOString()
    }));
  }, [form, draftKey]);

  const loadDraft = React.useCallback(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const savedAt = new Date(parsed.savedAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          form.reset(parsed);
          toast.info('Draft loaded from previous session');
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch (error) {
        localStorage.removeItem(draftKey);
      }
    }
  }, [form, draftKey]);

  // Auto-save on changes
  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (form.formState.isDirty) {
        saveDraft();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, saveDraft]);

  const fetchSquads = async () => {
    setIsLoadingSquads(true);
    setSquadError(null);
    try {
      const response = await fetch('/api/squads');
      if (!response.ok) {
        throw new Error(`Failed to load squads: ${response.status}`);
      }
      const data = await response.json();
      setSquads(data.squads || []);
    } catch (error) {
      console.error('Failed to fetch squads:', error);
      setSquadError('Failed to load squads. Please refresh and try again.');
      setSquads([]);
    } finally {
      setIsLoadingSquads(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      fetchSquads();
      loadDraft();
    }
  }, [open, loadDraft]);

  // Real-time field validation
  const validateField = React.useCallback(async (field: string) => {
    try {
      await form.trigger(field as keyof z.infer<typeof formSchema>);
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path[0] === field);
        setValidationErrors(prev => ({
          ...prev,
          [field]: fieldError?.message || ''
        }));
      }
    }
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success('Sprint created successfully!');
        form.reset();
        localStorage.removeItem(draftKey); // Clear draft on success
        onOpenChange(false);
        onSprintCreated?.();
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.details) {
          Object.entries(errorData.details).forEach(([field, message]) => {
            form.setError(field as keyof z.infer<typeof formSchema>, {
              message: message as string
            });
          });
        } else {
          toast.error(errorData.message || 'Validation failed');
        }
      } else if (response.status === 403) {
        toast.error('You do not have permission to create sprints for this squad');
      } else if (response.status === 409) {
        toast.error('A sprint with this name already exists');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to create sprint');
      }
    } catch (error) {
      console.error('Network error creating sprint:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty && !isSubmitting) {
      setShowConfirmDialog(true);
      return;
    }
    onOpenChange(newOpen);
  };

  const handleConfirmClose = () => {
    setShowConfirmDialog(false);
    form.reset();
    localStorage.removeItem(draftKey);
    onOpenChange(false);
  };

  const handleCancelClose = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[95vh] w-full max-w-2xl mx-auto overflow-visible">
          <DrawerHeader className="px-6 py-4">
            <DrawerTitle className="text-2xl font-semibold">Create New Sprint</DrawerTitle>
            <DrawerDescription>
              Fill in the details below to create a new sprint for your team.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-6 pb-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                aria-labelledby="sprint-form-title"
                aria-describedby="sprint-form-description"
              >
                <div id="sprint-form-title" className="sr-only">
                  Create New Sprint Form
                </div>
                <div id="sprint-form-description" className="sr-only">
                  Fill in the details below to create a new sprint for your team.
                </div>

                <FormField
                  control={form.control}
                  name="squadId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Squad</FormLabel>
                      <FormControl>
                        {isLoadingSquads ? (
                          <div className="h-12 flex items-center justify-center text-base text-muted-foreground border rounded-md">
                            Loading squads...
                          </div>
                        ) : squadError ? (
                          <div className="h-12 flex items-center justify-between text-base text-destructive border rounded-md px-3">
                            <span>Failed to load squads</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={fetchSquads}
                            >
                              Retry
                            </Button>
                          </div>
                        ) : squads.length === 0 ? (
                          <div className="h-12 flex items-center justify-center text-base text-muted-foreground border rounded-md">
                            No squads available
                          </div>
                        ) : (
                          <Combobox
                            options={squads.map((squad) => ({
                              label: `${squad.name} (${squad.alias})`,
                              value: squad.id,
                            }))}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Select a squad"
                            disabled={isSubmitting}
                            className="h-12 text-base"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Sprint Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Sprint 2025.01"
                          className="h-12 text-base"
                          disabled={isSubmitting}
                          aria-describedby="name-description name-error"
                          {...field}
                          onBlur={() => validateField('name')}
                        />
                      </FormControl>
                      <div id="name-description" className="sr-only">
                        Enter a descriptive name for your sprint
                      </div>
                      {validationErrors.name && (
                        <p className="text-sm font-medium text-destructive" id="name-error">
                          {validationErrors.name}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base font-medium">Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-12 pl-3 text-left font-normal text-base",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a start date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(date.toISOString().split('T')[0]);
                                  // Auto-set end date to 2 weeks later if not set
                                  if (!form.getValues('endDate')) {
                                    const endDate = new Date(date);
                                    endDate.setDate(endDate.getDate() + 14);
                                    form.setValue('endDate', endDate.toISOString().split('T')[0]);
                                  }
                                }
                              }}
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base font-medium">End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-12 pl-3 text-left font-normal text-base",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick an end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(date.toISOString().split('T')[0]);
                                }
                              }}
                              disabled={(date) => {
                                const startDate = form.getValues('startDate');
                                if (startDate) {
                                  return date <= new Date(startDate);
                                }
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSubmitting}
                    className="h-12 text-base"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoadingSquads}
                    className="h-12 text-base min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Sprint'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close this form?
              Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function SprintCreationDrawer(props: SprintCreationDrawerProps) {
  return (
    <SprintCreationErrorBoundary>
      <SprintCreationDrawerInner {...props} />
    </SprintCreationErrorBoundary>
  );
}