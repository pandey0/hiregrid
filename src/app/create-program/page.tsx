"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { ArrowLeft, Plus } from "lucide-react";
import { programSchema } from "@shared/schema";
import RoundFormField from "@/components/ui/round-form-field";
import authService from "@/services/authService";
import { apiRequest } from "@/lib/queryClient";

// ✅ Extended schema for create form validation
const createProgramSchema = programSchema.extend({
  name: z.string().min(1, "Program name is required"),
  description: z.string().min(1, "Description is required"),
  rounds: z
    .array(
      z.object({
        round_number: z.number(),
        name: z.string().min(1, "Round name is required"),
        time_per_round: z.number().min(1, "Time must be at least 1 minute"),
        panelists: z.array(z.string()).min(1, "At least one panelist is required")
      })
    )
    .min(1, "At least one round is required")
});

type CreateProgramValues = z.infer<typeof createProgramSchema>;

export default function CreateProgram() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ✅ Auth check
  const currentUser = authService.getCurrentUser();
  if (!currentUser?.organizationId) {
    toast({
      title: "Error",
      description: "You must be part of an organization to create a program",
      variant: "destructive"
    });
    router.push("/dashboard");
    return null;
  }

  // ✅ Form setup
  const form = useForm<CreateProgramValues>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      name: "",
      description: "",
      organizationId: currentUser.organizationId,
      rounds: [
        {
          round_number: 1,
          name: "",
          time_per_round: 30,
          panelists: [""]
        }
      ]
    }
  });

  // ✅ Rounds dynamic field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rounds"
  });

  const addRound = () => {
    append({
      round_number: fields.length + 1,
      name: "",
      time_per_round: 30,
      panelists: [""]
    });
  };

  const removeRound = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      const updatedRounds = form.getValues().rounds.filter((_, i) => i !== index);
      updatedRounds.forEach((r, idx) => {
        r.round_number = idx + 1;
      });
      form.setValue("rounds", updatedRounds);
    }
  };

  // ✅ React Query mutation
  const createProgramMutation = useMutation({
    mutationFn: async (data: CreateProgramValues) => {
      const programData = {
        ...data,
        organizationId: currentUser.organizationId
      };
      const res = await apiRequest("POST", "/api/create-program", programData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      toast({
        title: "Program created",
        description: "Your program has been created successfully"
      });
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error creating program",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CreateProgramValues) => {
    createProgramMutation.mutate({
      ...data,
      organizationId: currentUser.organizationId,
      rounds: data.rounds.map((round) => ({
        ...round,
        panelists: round.panelists.filter((p) => p.trim() !== "")
      }))
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="mr-3 text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Create New Program</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Program Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer Hiring" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the program"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rounds */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <FormLabel>Rounds</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addRound}
                    className="text-primary hover:text-blue-700 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Round
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <RoundFormField
                      key={field.id}
                      index={index}
                      control={form.control}
                      onRemove={() => removeRound(index)}
                      showRemoveButton={fields.length > 1}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="mr-3"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createProgramMutation.isPending}>
                  {createProgramMutation.isPending ? "Creating..." : "Create Program"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
