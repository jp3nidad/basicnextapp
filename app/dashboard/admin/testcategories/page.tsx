"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { showMessage } from "@/components/MessageModal";
import ConfirmModal from "@/components/ConfirmModal";
import PageGuardWrapper from "@/components/PageGuardWrapper";
import {
  TestCategory,
  addTestCategory,
  deleteTestCategory,
  getTestCategories,
  updateTestCategory,
} from "./actions";

export default function Page() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [rows, setRows] = useState<TestCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const loadData = useCallback(() => {
    getTestCategories()
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isPending && !session) router.push("/");
  }, [isPending, session, router]);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  const handleAdd = async () => {
    try {
      await addTestCategory(name, description);
      setName("");
      setDescription("");
      await showMessage("Category added successfully.");
      loadData();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to add category.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await ConfirmModal("Delete this category?");
    if (!confirmed) return;

    try {
      await deleteTestCategory(id);
      await showMessage("Category deleted successfully.");
      loadData();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to delete category.");
    }
  };

  const beginEdit = (row: TestCategory) => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditDescription(row.description ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateTestCategory(id, editName, editDescription);
      await showMessage("Category updated successfully.");
      cancelEdit();
      loadData();
    } catch (error) {
      console.error(error);
      await showMessage("Failed to update category.");
    }
  };

  if (isPending || !session) return <div className="p-6">Loading...</div>;

  return (
    <PageGuardWrapper requiredRoles={["ADMINISTRATOR"]}>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Medical Test Categories</h1>

        <div className="rounded border bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              className="rounded border px-3 py-2 text-sm"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="rounded border px-3 py-2 text-sm md:col-span-2"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="mt-3 rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Category
          </button>
        </div>

        <div className="overflow-auto rounded border bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
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
                        className="w-full rounded border px-2 py-1"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      row.name
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingId === row.id ? (
                      <input
                        className="w-full rounded border px-2 py-1"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    ) : (
                      row.description ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingId === row.id ? (
                      <div className="space-x-2">
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
                      <div className="space-x-2">
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
                  <td className="px-4 py-4 text-center text-sm text-gray-500" colSpan={4}>
                    No categories found.
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
