"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface MedicalTest {
  id: number;
  name: string;
  description: string | null;
  iduom: number;
  idcategory: number;
  normalmin: number | null;
  normalmax: number | null;
  unit: string;
  category: string;
}

export interface LookupItem {
  id: number;
  name: string;
}

export async function getMedicalTests(): Promise<MedicalTest[]> {
  const { rows } = await query<MedicalTest>(`
    SELECT
      mt.id,
      mt.name,
      mt.description,
      mt.iduom,
      mt.idcategory,
      mt.normalmin,
      mt.normalmax,
      u.name AS unit,
      tc.name AS category
    FROM public.medicaltests mt
    JOIN public.testcategories tc ON mt.idcategory = tc.id
    JOIN public.uom u ON mt.iduom = u.id
    ORDER BY mt.id ASC
  `);

  return rows;
}

export async function getUomOptions(): Promise<LookupItem[]> {
  const { rows } = await query<LookupItem>(
    "SELECT id, name FROM public.uom ORDER BY name ASC"
  );
  return rows;
}

export async function getCategoryOptions(): Promise<LookupItem[]> {
  const { rows } = await query<LookupItem>(
    "SELECT id, name FROM public.testcategories ORDER BY name ASC"
  );
  return rows;
}

export async function addMedicalTest(data: {
  name: string;
  description: string;
  iduom: number;
  idcategory: number;
  normalmin: number | null;
  normalmax: number | null;
}): Promise<void> {
  await query(
    `INSERT INTO public.medicaltests
      (name, description, iduom, idcategory, normalmin, normalmax)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      data.name.trim(),
      data.description.trim() || null,
      data.iduom,
      data.idcategory,
      data.normalmin,
      data.normalmax,
    ]
  );
  revalidatePath("/dashboard/admin/medicaltests");
}

export async function updateMedicalTest(
  id: number,
  data: {
    name: string;
    description: string;
    iduom: number;
    idcategory: number;
    normalmin: number | null;
    normalmax: number | null;
  }
): Promise<void> {
  await query(
    `UPDATE public.medicaltests
        SET name = $2,
            description = $3,
            iduom = $4,
            idcategory = $5,
            normalmin = $6,
            normalmax = $7
      WHERE id = $1`,
    [
      id,
      data.name.trim(),
      data.description.trim() || null,
      data.iduom,
      data.idcategory,
      data.normalmin,
      data.normalmax,
    ]
  );
  revalidatePath("/dashboard/admin/medicaltests");
}

export async function deleteMedicalTest(id: number): Promise<void> {
  await query("DELETE FROM public.medicaltests WHERE id = $1", [id]);
  revalidatePath("/dashboard/admin/medicaltests");
}
