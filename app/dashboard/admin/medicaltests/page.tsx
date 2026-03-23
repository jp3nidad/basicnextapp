"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from "@/components/MessageModal";
import ConfirmModal from "@/components/ConfirmModal";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import {
  LookupItem,
  MedicalTest,
  addMedicalTest,
  deleteMedicalTest,
  getCategoryOptions,
  getMedicalTests,
  getUomOptions,
  updateMedicalTest,
} from "./actions";

type FormState = {
  name: string;
  description: string;
  iduom: number;
  idcategory: number;
  normalmin: string;
  normalmax: string;
};

const initialForm: FormState = {
  name: "",
  description: "",
  iduom: 0,
  idcategory: 0,
  normalmin: "",
  normalmax: "",
};

export default function Page() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [rows, setRows] = useState<MedicalTest[]>([]);
  const [uomOptions, setUomOptions] = useState<LookupItem[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<FormState>(initialForm);

  const loadData = useCallback(async () => {
    try {
      const [tests, uoms, categories] = await Promise.all([
        getMedicalTests(),
        getUomOptions(),
        getCategoryOptions(),
      ]);
      setRows(tests);
      setUomOptions(uoms);
      setCategoryOptions(categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) router.push("/");
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  const handleAdd = async () => {
    try {
      await addMedicalTest({
        name: form.name,
        description: form.description,
        iduom: form.iduom,
        idcategory: form.idcategory,
        normalmin: form.normalmin ? Number(form.normalmin) : null,
        normalmax: form.normalmax ? Number(form.normalmax) : null,
      });
      setForm(initialForm);
      await showMessage("Medical test added successfully.");
      await loadData();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to add medical test.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await ConfirmModal("Delete this medical test?");
    if (!confirmed) return;

    try {
      await deleteMedicalTest(id);
      await showMessage("Medical test deleted successfully.");
      await loadData();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to delete medical test.");
    }
  };

  const beginEdit = (row: MedicalTest) => {
    setEditingId(row.id);
    setEditForm({
      name: row.name,
      description: row.description ?? "",
      iduom: row.iduom,
      idcategory: row.idcategory,
      normalmin: row.normalmin?.toString() ?? "",
      normalmax: row.normalmax?.toString() ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(initialForm);
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateMedicalTest(id, {
        name: editForm.name,
        description: editForm.description,
        iduom: editForm.iduom,
        idcategory: editForm.idcategory,
        normalmin: editForm.normalmin ? Number(editForm.normalmin) : null,
        normalmax: editForm.normalmax ? Number(editForm.normalmax) : null,
      });
      await showMessage("Medical test updated successfully.");
      cancelEdit();
      await loadData();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to update medical test.");
    }
  };

  if (isPending || !session) return <div className="p-6">Loading...</div>;

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Medical Tests</h1>

        <div className="rounded border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
            <input
              className="rounded border px-3 py-2 text-sm md:col-span-2"
              placeholder="Test Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <select
              className="rounded border px-3 py-2 text-sm"
              value={form.idcategory || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, idcategory: Number(e.target.value) }))}
            >
              <option value="">Category</option>
              {categoryOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              className="rounded border px-3 py-2 text-sm"
              value={form.iduom || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, iduom: Number(e.target.value) }))}
            >
              <option value="">Unit</option>
              {uomOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              className="rounded border px-3 py-2 text-sm"
              type="number"
              step="0.01"
              placeholder="Min"
              value={form.normalmin}
              onChange={(e) => setForm((prev) => ({ ...prev, normalmin: e.target.value }))}
            />
            <input
              className="rounded border px-3 py-2 text-sm"
              type="number"
              step="0.01"
              placeholder="Max"
              value={form.normalmax}
              onChange={(e) => setForm((prev) => ({ ...prev, normalmax: e.target.value }))}
            />
            <input
              className="rounded border px-3 py-2 text-sm md:col-span-5"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!form.name.trim() || !form.iduom || !form.idcategory}
            className="mt-3 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Medical Test
          </button>
        </div>

        <div className="overflow-auto rounded border bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Test Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Min</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Max</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {rows.map((row, index) => (
                <tr key={row.id} className="even:bg-gray-50/80">
                  <td className="px-4 py-2 text-sm">{index + 1}</td>
                  <td className="px-4 py-2 text-sm">
                    {editingId === row.id ? (
                      <input
                        className="w-48 rounded border px-2 py-1"
                        value={editForm.name}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      row.name
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingId === row.id ? (
                      <select
                        className="rounded border px-2 py-1"
                        value={editForm.idcategory || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, idcategory: Number(e.target.value) }))
                        }
                      >
                        <option value="">Category</option>
                        {categoryOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      row.category
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingId === row.id ? (
                      <select
                        className="rounded border px-2 py-1"
                        value={editForm.iduom || ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, iduom: Number(e.target.value) }))}
                      >
                        <option value="">Unit</option>
                        {uomOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      row.unit
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingId === row.id ? (
                      <input
                        className="w-24 rounded border px-2 py-1"
                        type="number"
                        step="0.01"
                        value={editForm.normalmin}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, normalmin: e.target.value }))}
                      />
                    ) : (
                      row.normalmin ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingId === row.id ? (
                      <input
                        className="w-24 rounded border px-2 py-1"
                        type="number"
                        step="0.01"
                        value={editForm.normalmax}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, normalmax: e.target.value }))}
                      />
                    ) : (
                      row.normalmax ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingId === row.id ? (
                      <input
                        className="w-56 rounded border px-2 py-1"
                        value={editForm.description}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    ) : (
                      row.description ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingId === row.id ? (
                      <div className="space-x-2 whitespace-nowrap">
                        <button
                          className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                          onClick={() => handleUpdate(row.id)}
                        >
                          Save
                        </button>
                        <button
                          className="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="space-x-2 whitespace-nowrap">
                        <button
                          className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600"
                          onClick={() => beginEdit(row)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                          onClick={() => handleDelete(row.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-center text-sm text-gray-500" colSpan={8}>
                    No medical tests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageGuardWrapper>
  );
}
