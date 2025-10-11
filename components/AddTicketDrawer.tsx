import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkType, ParentType, PlannedUnplanned } from "@/lib/types/ticket";
import { CreateTicketRequest } from "@/lib/types/ticket";

const ticketSchema = z.object({
  jiraId: z.string().min(1, "Jira ID is required"),
  hours: z.number().min(0, "Hours must be 0 or greater"),
  workType: z.nativeEnum(WorkType),
  parentType: z.nativeEnum(ParentType),
  plannedUnplanned: z.nativeEnum(PlannedUnplanned),
  memberId: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface AddTicketDrawerProps {
  sprintId: string;
  squadMembers: Array<{ id: string; displayName: string }>;
  onTicketAdded: () => void;
}

export function AddTicketDrawer({
  sprintId,
  squadMembers,
  onTicketAdded,
}: AddTicketDrawerProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      jiraId: "",
      hours: 0,
      workType: WorkType.BACKEND,
      parentType: ParentType.STORY,
      plannedUnplanned: PlannedUnplanned.PLANNED,
      memberId: undefined,
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true);
    try {
      const request: CreateTicketRequest = {
        jiraId: data.jiraId,
        hours: data.hours,
        workType: data.workType,
        parentType: data.parentType,
        plannedUnplanned: data.plannedUnplanned,
        memberId: data.memberId || undefined,
      };

      const response = await fetch(`/api/sprints/${sprintId}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create ticket");
      }

      form.reset();
      setOpen(false);
      onTicketAdded();
    } catch (error) {
      console.error("Error creating ticket:", error);
      // TODO: Add proper error handling/toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Ticket
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Add New Ticket</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="jiraId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jira ID</FormLabel>
                    <FormControl>
                      <Input placeholder="PROJ-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={WorkType.BACKEND}>Backend</SelectItem>
                        <SelectItem value={WorkType.FRONTEND}>Frontend</SelectItem>
                        <SelectItem value={WorkType.TESTING}>Testing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ParentType.BUG}>Bug</SelectItem>
                        <SelectItem value={ParentType.STORY}>Story</SelectItem>
                        <SelectItem value={ParentType.TASK}>Task</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedUnplanned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned/Unplanned</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select planning status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PlannedUnplanned.PLANNED}>
                          Planned
                        </SelectItem>
                        <SelectItem value={PlannedUnplanned.UNPLANNED}>
                          Unplanned
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Member (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {squadMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}