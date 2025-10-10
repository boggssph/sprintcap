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
  sprintNumber: z.string()
    .min(1, "Sprint name is required")
    .max(50, "Number must be 50 characters or less")
    .refine((num) => num.trim().length >= 1, {
      message: "Sprint name is required"
    }),
  squadId: z.string().min(1, "Please select a squad"),
  startDate: z.date().refine((date) => date >= new Date(), {
    message: "Start date cannot be in the past"
  }),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.date().refine((date) => date >= new Date(), {
    message: "End date cannot be in the past"
  }),
  endTime: z.string().min(1, "End time is required"),
})
.refine((data) => {
  const start = new Date(data.startDate);
  const [startHours, startMinutes] = data.startTime.split(':').map(Number);
  start.setHours(startHours, startMinutes);
  const end = new Date(data.endDate);
  const [endHours, endMinutes] = data.endTime.split(':').map(Number);
  end.setHours(endHours, endMinutes);
  return end > start;
}, {
  message: "End date and time must be after start date and time",
  path: ["endDate"]
})
.refine((data) => {
  const start = new Date(data.startDate);
  const now = new Date();
  return start >= now;
}, {
  message: "Start date and time cannot be in the past",
  path: ["startDate"]
})
.refine((data) => {
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
  const [selectedSquad, setSelectedSquad] = React.useState<Squad | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Draft functionality
  const [draftKey] = React.useState(() => `sprint-draft-${Date.now()}`);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sprintNumber: "",
      squadId: "",
      startDate: undefined,
      startTime: "",
      endDate: undefined,
      endTime: "",
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

  // Update selectedSquad when squadId changes
  React.useEffect(() => {
    const squadId = form.watch('squadId');
    const squad = squads.find(s => s.id === squadId) || null;
    setSelectedSquad(squad);
  }, [form.watch('squadId'), squads]);

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
      const fullSprintName = selectedSquad?.alias && values.sprintNumber.trim() 
        ? `${selectedSquad.alias}-Sprint-${values.sprintNumber.trim()}`
        : values.sprintNumber.trim(); // fallback

      // Convert Date objects and time strings to ISO datetime strings
      const startDate = values.startDate;
      const [startHours, startMinutes] = values.startTime.split(':').map(Number);
      startDate.setHours(startHours, startMinutes, 0, 0);
      const startDateTime = startDate.toISOString();

      const endDate = values.endDate;
      const [endHours, endMinutes] = values.endTime.split(':').map(Number);
      endDate.setHours(endHours, endMinutes, 0, 0);
      const endDateTime = endDate.toISOString();

      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullSprintName,
          squadId: values.squadId,
          startDate: startDateTime,
          endDate: endDateTime,
        }),
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
            const formField = field === 'name' ? 'sprintNumber' : field;
            form.setError(formField as keyof z.infer<typeof formSchema>, {
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
                  name="sprintNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="sprintNumber" className="text-base font-medium">Sprint Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                            {selectedSquad?.alias ? `${selectedSquad.alias}-Sprint-` : 'Select squad first'}
                          </span>
                          <Input
                            id="sprintNumber"
                            type="text"
                            placeholder={selectedSquad?.alias ? "e.g., 1, 2, 2025.10" : ""}
                            value={field.value}
                            onChange={field.onChange}
                            className={`h-12 text-base pl-32 ${isSubmitting ? 'opacity-50' : ''}`}
                            disabled={isSubmitting || !selectedSquad?.alias}
                            aria-describedby="sprintNumber-description sprintNumber-error"
                            onBlur={() => validateField('sprintNumber')}
                          />
                        </div>
                      </FormControl>
                      <div id="sprintNumber-description" className="sr-only">
                        Enter the sprint number to create the full sprint name
                      </div>
                      {selectedSquad?.alias && field.value.trim() && (
                        <div className="text-xs text-gray-600 mt-1">
                          Full Sprint Name: <span className="font-mono text-gray-900">{selectedSquad.alias}-Sprint-{field.value.trim()}</span>
                        </div>
                      )}
                      {validationErrors.sprintNumber && (
                        <p className="text-sm font-medium text-destructive" id="sprintNumber-error">
                          {validationErrors.sprintNumber}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
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
                                    format(field.value, "PPP")
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
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) {
                                    // Store Date object directly to avoid timezone issues
                                    field.onChange(date);
                                    // Auto-set end date to 2 weeks later if not set
                                    if (!form.getValues('endDate')) {
                                      const endDate = new Date(date);
                                      endDate.setDate(endDate.getDate() + 14);
                                      form.setValue('endDate', endDate);
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
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Start Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              className="h-12 text-base"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
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
                                    format(field.value, "PPP")
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
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) {
                                    // Store Date object directly to avoid timezone issues
                                    field.onChange(date);
                                  }
                                }}
                                disabled={(date) => {
                                  const startDate = form.getValues('startDate');
                                  if (startDate) {
                                    return date <= startDate;
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
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">End Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              className="h-12 text-base"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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