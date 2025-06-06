
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import type { AutoresModel, AutoresFormValues } from '@/lib/types';
import { getAllAutores, createAutor, updateAutor, deleteAutor } from '@/lib/services/autores';
import { AutorList } from '@/components/lists/autor-list';
import { AutorForm } from '@/components/forms/autor-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import axios from 'axios'; // Added import for axios
import { API_BASE_URL } from '@/lib/api-config'; // Added import for API_BASE_URL

export default function AutoresPage() {
  const [autores, setAutores] = useState<AutoresModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentAutor, setCurrentAutor] = useState<AutoresModel | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [autorToDelete, setAutorToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const loadAutores = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllAutores();
      setAutores(data);
    } catch (error: any) {
      let description = "Error al cargar autores. Por favor, inténtalo de nuevo más tarde.";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          description = `Error del servidor (${error.response.status}). No se pudieron cargar los autores.`;
        } else if (error.request) {
          // The request was made but no response was received
          description = `Error de red al cargar autores. Verifica tu conexión y que el servidor API (${API_BASE_URL}) esté accesible.`;
        } else {
          // Something happened in setting up the request that triggered an Error
          description = `Error de configuración al cargar autores: ${error.message}`;
        }
      } else {
        // Non-Axios error
        console.error("Non-Axios error in loadAutores:", error);
        description = "Ocurrió un error inesperado al cargar los autores.";
      }
      toast({ title: "Error de Carga", description, variant: "destructive" });
      console.error("Full error details (loadAutores):", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAutores();
  }, [loadAutores]);

  const handleSubmitAutor = async (data: AutoresFormValues, id?: number) => {
    setIsSubmitting(true);
    try {
      const fechaNacimiento = data.fechaNacimiento || undefined; // Ensure undefined if empty/null
      if (id) {
        await updateAutor(id, data.nombre, data.apellido, fechaNacimiento, data.nacionalidad);
        toast({ title: "Éxito", description: "Autor actualizado con éxito." });
      } else {
        await createAutor(data.nombre, data.apellido, fechaNacimiento, data.nacionalidad);
        toast({ title: "Éxito", description: "Autor creado con éxito." });
      }
      setShowForm(false);
      setCurrentAutor(null);
      loadAutores();
    } catch (err) {
      toast({ title: "Error", description: "Error al guardar el autor.", variant: "destructive" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAutor = async () => {
    if (autorToDelete === null) return;
    setIsSubmitting(true);
    try {
      await deleteAutor(autorToDelete);
      toast({ title: "Éxito", description: "Autor eliminado con éxito." });
      loadAutores();
    } catch (err) {
      toast({ title: "Error", description: "Error al eliminar el autor.", variant: "destructive" });
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setAutorToDelete(null);
    }
  };

  const handleEditAutor = (autor: AutoresModel) => {
    setCurrentAutor(autor);
    setShowForm(true);
  };

  const handleAddNewAutor = () => {
    setCurrentAutor(null);
    setShowForm(true);
  };
  
  const confirmDelete = (id: number) => {
    setAutorToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleCancelForm = () => {
    setCurrentAutor(null);
    setShowForm(false);
  };

  if (loading && !showForm) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <p className="ml-4 text-lg text-muted-foreground">Cargando autores...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Gestión de Autores</h1>
        {!showForm && (
          <Button onClick={handleAddNewAutor} className="shadow-md">
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Nuevo Autor
          </Button>
        )}
      </div>

      {showForm ? (
        <AutorForm
          currentAutor={currentAutor}
          onSubmit={handleSubmitAutor}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
        />
      ) : (
        <AutorList
          autores={autores}
          onEdit={handleEditAutor}
          onDelete={confirmDelete}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este autor?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAutor} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
