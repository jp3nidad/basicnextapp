"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface TestCategory {
  id: number;
  name: string;
  description: string | null;
}

export async function getTestCategories(): Promise<TestCategory[]> {
  const { rows } = await query<TestCategory>(
    "SELECT id, name, description FROM public.testcategories ORDER BY id ASC"
  );
  return rows;
}

export async function addTestCategory(name: string, description: string): Promise<void> {
  await query(
    "INSERT INTO public.testcategories (name, description) VALUES ($1, $2)",
    [name.trim(), description.trim() || null]
  );
  revalidatePath("/dashboard/admin/testcategories");
}

export async function updateTestCategory(id: number, name: string, description: string): Promise<void> {
  await query(
    "UPDATE public.testcategories SET name = $2, description = $3 WHERE id = $1",
    [id, name.trim(), description.trim() || null]
  );
  revalidatePath("/dashboard/admin/testcategories");
}

export async function deleteTestCategory(id: number): Promise<void> {
  await query("DELETE FROM public.testcategories WHERE id = $1", [id]);
  revalidatePath("/dashboard/admin/testcategories");
}
