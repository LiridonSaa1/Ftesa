import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useCreateEvent, getListEventsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Emri duhet të jetë të paktën 2 karaktere").max(100),
  date: z.string().min(1, "Data është e detyrueshme"),
  time: z.string().optional(),
  venue: z.string().max(200).optional(),
  address: z.string().max(300).optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EventCreate() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createEvent = useCreateEvent();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: "",
      time: "",
      venue: "",
      address: "",
      description: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createEvent.mutate(
      { data: values },
      {
        onSuccess: (newEvent) => {
          toast({
            title: "Eventi u krijua!",
            description: "Eventi juaj u krijua me sukses.",
          });
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
          setLocation(`/events/${newEvent.id}`);
        },
        onError: () => {
          toast({
            title: "Gabim",
            description: "Pati një problem gjatë krijimit të eventit. Ju lutem provoni përsëri.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Krijo Event të Ri</h1>
          <p className="text-muted-foreground mt-1">Plotësoni detajet e eventit tuaj për të filluar.</p>
        </div>
      </div>

      <Card className="border-primary/20 shadow-lg bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="font-serif">Detajet e Eventit</CardTitle>
          <CardDescription>
            Të gjitha fushat me yll (*) janë të detyrueshme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emri i Eventit *</FormLabel>
                      <FormControl>
                        <Input placeholder="psh. Dasma e Albanit & Zanës" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Koha</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendi (Salla)</FormLabel>
                        <FormControl>
                          <Input placeholder="psh. Grand Hotel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresa</FormLabel>
                        <FormControl>
                          <Input placeholder="psh. Rr. Agim Ramadani, Prishtinë" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Përshkrimi</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Informacione shtesë rreth eventit..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" className="mr-2" asChild>
                  <Link href="/events">Anulo</Link>
                </Button>
                <Button type="submit" disabled={createEvent.isPending}>
                  {createEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Krijo Eventin
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
