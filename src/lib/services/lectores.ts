// src/lib/services/lectores.ts
import axios from 'axios';
import type { LectoresModel, DateOnlyString } from '@/lib/types';
import { API_BASE_URL, formatDateForApi } from '@/lib/api-config';

const API_URL = `${API_BASE_URL}/Lectores`;

export const getAllLectores = async (): Promise<LectoresModel[]> => {
  const response = await axios.get<LectoresModel[]>(API_URL);
  return response.data.map(lector => ({
    ...lector,
    fechaRegistro: lector.fechaRegistro ? formatDateForApi(lector.fechaRegistro) : undefined
  }));
};

export const getLectorById = async (id: number): Promise<LectoresModel> => {
  const response = await axios.get<LectoresModel>(`${API_URL}/${id}`);
  if (response.data.fechaRegistro) {
    response.data.fechaRegistro = formatDateForApi(response.data.fechaRegistro);
  }
  return response.data;
};

export const createLector = async (
  idPersona: number,
  fechaRegistro: DateOnlyString | undefined,
  ocupacion: string
): Promise<LectoresModel> => {
  const fechaRegistroParam = fechaRegistro || 'null';
  const response = await axios.post<LectoresModel>(
    `${API_URL}/${idPersona}/${encodeURIComponent(fechaRegistroParam)}/${encodeURIComponent(ocupacion)}`
  );
  if (response.data.fechaRegistro) {
    response.data.fechaRegistro = formatDateForApi(response.data.fechaRegistro);
  }
  return response.data;
};

export const updateLector = async (
  id: number,
  idPersona?: number | null,
  fechaRegistro?: DateOnlyString | null,
  ocupacion?: string | null
): Promise<LectoresModel> => {
  let url = `${API_URL}/${id}`;
  const params = new URLSearchParams();

  if (idPersona !== undefined && idPersona !== null) params.append('idPersona', String(idPersona));
  if (fechaRegistro !== undefined && fechaRegistro !== null) params.append('fechaRegistro', fechaRegistro);
  if (ocupacion !== undefined && ocupacion !== null) params.append('ocupacion', ocupacion);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await axios.put<LectoresModel>(url);
  if (response.data.fechaRegistro) {
    response.data.fechaRegistro = formatDateForApi(response.data.fechaRegistro);
  }
  return response.data;
};

export const deleteLector = async (id: number): Promise<void> => {
  await axios.delete<void>(`${API_URL}/${id}`);
};
