
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { PrestamosModel, PrestamosFormValues } from '@/lib/types';
import { getAllPrestamos, createPrestamo, updatePrestamo, deletePrestamo } from '@/lib/services/prestamos';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2, ArrowRightLeft, Edit, Trash2, CalendarIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prestamoSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// PrestamoForm Component
interface PrestamoFormProps {
  currentData?: PrestamosModel | null;
  onSubmit: (data: PrestamosFormValues, id?: number) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function PrestamoForm({ currentData, onSubmit, onCancel, isSubmitting }: PrestamoFormProps) {
  const form = useForm<PrestamosFormValues>({
    resolver: zodResolver(prestamoSchema),
    defaultValues: {
      idLector: currentData?.idLector ?? undefined,
      idBibliotecario: currentData?.idBibliotecario ?? undefined,
      idEjemplar: currentData?.idEjemplar ?? undefined,
      fechaPrestamo: currentData?.fechaPrestamo || '',
      fechaDevolucion: currentData?.fechaDevolucion || '',
    },
  });

  useEffect(() => {
    if (currentData) {
      form.reset({
        ...currentData,
        idLector: Number(currentData.idLector),
        idBibliotecario: Number(currentData.idBibliotecario),
        idEjemplar: Number(currentData.idEjemplar),
      });
    } else {
      form.reset({ idLector: undefined, idBibliotecario: undefined, idEjemplar: undefined, fechaPrestamo: '', fechaDevolucion: '' });
    }
  }, [currentData, form]);

  const handleSubmit = async (data: PrestamosFormValues) => {
     const payload = {
      ...data,
      idLector: Number(data.idLector),
      idBibliotecario: Number(data.idBibliotecario),
      idEjemplar: Number(data.idEjemplar),
    };
    await onSubmit(payload, currentData?.idPrestamo);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{currentData ? 'Editar Préstamo' : 'Crear Nuevo Préstamo'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="idLector" render={({ field }) => ( <FormItem><FormLabel>ID Lector</FormLabel><FormControl><Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="idBibliotecario" render={({ field }) => ( <FormItem><FormLabel>ID Bibliotecario</FormLabel><FormControl><Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="idEjemplar" render={({ field }) => ( <FormItem><FormLabel>ID Ejemplar</FormLabel><FormControl><Input type="number" placeholder="Ej: 1" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem> )} />
            <FormField
              control={form.control}
              name="fechaPrestamo"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Préstamo</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                        >
                          {field.value ? (format(new Date(field.value), "PPP", { locale: es })) : (<span>Seleccione una fecha</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')}
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
              name="fechaDevolucion"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Devolución</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}
                        >
                          {field.value ? (format(new Date(field.value), "PPP", { locale: es })) : (<span>Seleccione una fecha</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : '')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? (currentData ? 'Actualizando...' : 'Creando...') : (currentData ? 'Actualizar' : 'Crear')}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

// PrestamoList Component
interface PrestamoListProps {
  items: PrestamosModel[];
  onEdit: (item: PrestamosModel) => void;
  onDelete: (id: number) => void;
}

function PrestamoList({ items, onEdit, onDelete }: PrestamoListProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return format(date, 'PPP', { locale: es });
  };
  return (
    <Card>
      <CardHeader><CardTitle>Lista de Préstamos</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No hay préstamos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>ID Lector</TableHead><TableHead>ID Bibliotecario</TableHead><TableHead>ID Ejemplar</TableHead><TableHead>F. Préstamo</TableHead><TableHead>F. Devolución</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.idPrestamo}><TableCell>{item.idPrestamo}</TableCell><TableCell>{item.idLector}</TableCell><TableCell>{item.idBibliotecario}</TableCell><TableCell>{item.idEjemplar}</TableCell><TableCell>{formatDate(item.fechaPrestamo)}</TableCell><TableCell>{formatDate(item.fechaDevolucion)}</TableCell><TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => onEdit(item)} aria-label="Editar"><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => onDelete(item.idPrestamo)} aria-label="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// PrestamosPage Component
export default function PrestamosPage() {
  const [data, setData] = useState<PrestamosModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<PrestamosModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllPrestamos();
      setData(result);
    } catch (err) {
      toast({ title: "Error", description: "Error al cargar préstamos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (formData: PrestamosFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      if (id) {
        await updatePrestamo(id, formData.idLector, formData.idBibliotecario, formData.idEjemplar, formData.fechaPrestamo, formData.fechaDevolucion);
        toast({ title: "Éxito", description: "Préstamo actualizado." });
      } else {
        await createPrestamo(formData.idLector, formData.idBibliotecario, formData.idEjemplar, formData.fechaPrestamo, formData.fechaDevolucion);
        toast({ title: "Éxito", description: "Préstamo creado." });
      }
      setShowForm(false); setCurrentItem(null); loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al guardar el préstamo.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (itemToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deletePrestamo(itemToDelete);
      toast({ title: "Éxito", description: "Préstamo eliminado." });
      loadData();
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar préstamo.", variant: "destructive" });
    } finally {
      setIsSubmitting(false); setShowDeleteConfirm(false); setItemToDelete(null);
    }
  };
  
  const handleEdit = (item: PrestamosModel) => { setCurrentItem(item); setShowForm(true); };
  const handleAddNew = () => { setCurrentItem(null); setShowForm(true); };
  const confirmDelete = (id: number) => { setItemToDelete(id); setShowDeleteConfirm(true); };
  const handleCancelForm = () => { setCurrentItem(null); setShowForm(false); };

  if (loading && !showForm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando préstamos...</p>
    </div>
  );
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center"><ArrowRightLeft className="mr-3 h-8 w-8" />Gestión de Préstamos</h1>
        {!showForm && ( <Button onClick={handleAddNew} className="shadow-md"><PlusCircle className="mr-2 h-5 w-5" />Agregar Nuevo</Button> )}
      </div>
      {showForm ? ( <PrestamoForm currentData={currentItem} onSubmit={handleSubmit} onCancel={handleCancelForm} isSubmitting={isSubmitting} /> ) 
      : ( <PrestamoList items={data} onEdit={handleEdit} onDelete={confirmDelete} /> )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. ¿Seguro que quieres eliminar este préstamo?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
