"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface Uom {
  id: number;
  name: string;
  description: string | null;
}

export async function getUom(): Promise<Uom[]> {
  const { rows } = await query<Uom>(
    "SELECT id, name, description FROM public.uom ORDER BY id ASC"
  );
  return rows;
}

export async function addUom(name: string, description: string): Promise<void> {
  await query(
    "INSERT INTO public.uom (name, description) VALUES ($1, $2)",
    [name.trim(), description.trim() || null]
  );
  revalidatePath("/dashboard/admin/uom");
}

export async function updateUom(id: number, name: string, description: string): Promise<void> {
  await query(
    "UPDATE public.uom SET name = $2, description = $3 WHERE id = $1",
    [id, name.trim(), description.trim() || null]
  );
  revalidatePath("/dashboard/admin/uom");
}

export async function deleteUom(id: number): Promise<void> {
  await query("DELETE FROM public.uom WHERE id = $1", [id]);
  revalidatePath("/dashboard/admin/uom");
}
