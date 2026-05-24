"use client";
import React, { useState, useEffect, useRef } from "react";
import { PlusCircle, Edit, Trash2, AlertCircle, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MenuItem {
  foodId: string;
  name: string;
  description: string;
  price: number;
  category: "food" | "drink" | "dessert";
  ingredients: string[];
  halal: boolean;
  vegetarian: boolean;
  alcoholic: boolean;
  countryOfOrigin: string;
  imageUrl: string;
  images: string[];
}

type FormErrors = Partial<Record<keyof MenuItem, string>>;

const EMPTY_FORM: MenuItem = {
  foodId: "",
  name: "",
  description: "",
  price: 0,
  category: "food",
  ingredients: [],
  halal: false,
  vegetarian: false,
  alcoholic: false,
  countryOfOrigin: "",
  imageUrl: "",
  images: [],
};

// Map form category value to upload folder name
const CATEGORY_FOLDER: Record<string, string> = {
  food:    "food",
  drink:   "drinks",
  dessert: "desserts",
};

function validate(data: MenuItem, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!isEdit && !data.foodId.trim()) errors.foodId = "Food ID is required";
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.description.trim()) errors.description = "Description is required";
  if (!data.price || data.price <= 0) errors.price = "Price must be greater than 0";
  if (!data.countryOfOrigin.trim()) errors.countryOfOrigin = "Country of origin is required";
  return errors;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle className="h-3 w-3 shrink-0" /> {msg}
    </p>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const CATEGORY_BADGE: Record<string, string> = {
  food:    "bg-orange-100 text-orange-700",
  drink:   "bg-blue-100 text-blue-700",
  dessert: "bg-purple-100 text-purple-700",
};

// ── Image picker (2×2 grid, up to 4 slots) ──────────────────────────────────
function ImagePicker({
  images,
  category,
  onChange,
}: {
  images: string[];
  category: string;
  onChange: (imgs: string[]) => void;
}) {
  const [uploading, setUploading] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const targetSlot = useRef<number>(0);

  const openPicker = (slot: number) => {
    targetSlot.current = slot;
    setUploadError(null);
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slot = targetSlot.current;
    setUploading(slot);
    setUploadError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", CATEGORY_FOLDER[category] ?? "food");

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message ?? "Upload failed");

      const updated = [...images];
      updated[slot] = data.url;
      onChange(updated.slice(0, 4));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (slot: number) => {
    const updated = [...images];
    updated.splice(slot, 1);
    onChange(updated);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />

      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((slot) => {
          const url         = images[slot];
          const isUploading = uploading === slot;
          const isFirst     = slot === 0;

          return (
            <div
              key={slot}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                isFirst ? "border-orange-300 bg-orange-50/40" : "border-dashed border-gray-200 bg-gray-50"
              }`}
            >
              {url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Image ${slot + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openPicker(slot)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(slot)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {isFirst && (
                    <span className="absolute bottom-0 left-0 right-0 text-[9px] font-semibold text-center bg-orange-500/80 text-white py-0.5">
                      MAIN
                    </span>
                  )}
                </>
              ) : isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openPicker(slot)}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-orange-500 transition-colors group"
                >
                  <ImagePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium">
                    {isFirst ? "Add main" : `Photo ${slot + 1}`}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 mt-1.5">
        Click a slot to upload · first slot = main display image · max 5 MB each
      </p>

      {uploadError && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle className="h-3 w-3 shrink-0" /> {uploadError}
        </p>
      )}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

const MenuItems = () => {
  const [menuItems,    setMenuItems]    = useState<MenuItem[]>([]);
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData,     setFormData]     = useState<MenuItem>(EMPTY_FORM);
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [editingItem,  setEditingItem]  = useState<MenuItem | null>(null);
  const [touched,      setTouched]      = useState<Set<string>>(new Set());

  useEffect(() => { fetchMenuItems(); }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch("/api/menu");
      if (!res.ok) throw new Error();
      setMenuItems(await res.json());
    } catch {
      toast.error("Failed to fetch menu items", { position: "top-center", autoClose: 3000 });
    }
  };

  const touch = (name: string) => setTouched(prev => new Set(prev).add(name));

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsed = type === "number" ? parseFloat(value) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: parsed }));
    touch(name);
  };

  const handleIngredients = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      ingredients: e.target.value.split(",").map(s => s.trim()).filter(Boolean),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(formData, !!editingItem);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched(new Set(Object.keys(errs)));
      return;
    }
    setErrors({});
    try {
      const url = editingItem ? `/api/menu?foodId=${editingItem.foodId}` : "/api/menu";
      const res = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl: formData.images[0] ?? formData.imageUrl ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to save menu item", { position: "top-center", autoClose: 3000 });
        return;
      }
      toast.success(`Menu item ${editingItem ? "updated" : "added"} successfully`, { position: "top-center", autoClose: 3000 });
      fetchMenuItems();
      closeModal();
    } catch {
      toast.error("Failed to save menu item", { position: "top-center", autoClose: 3000 });
    }
  };

  const handleDelete = async (foodId: string) => {
    try {
      const res = await fetch(`/api/menu?id=${foodId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Menu item deleted", { position: "top-center", autoClose: 3000 });
      fetchMenuItems();
    } catch {
      toast.error("Failed to delete menu item", { position: "top-center", autoClose: 3000 });
    } finally {
      setDeleteTarget(null);
    }
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      ...item,
      images: Array.isArray(item.images) && item.images.length
        ? item.images
        : item.imageUrl ? [item.imageUrl] : [],
    });
    setErrors({});
    setTouched(new Set());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setTouched(new Set());
  };

  const err      = (field: keyof MenuItem) => (touched.has(field) ? errors[field] : undefined);
  const inputCls = (field: keyof MenuItem) =>
    err(field) ? "border-red-400 focus-visible:ring-red-400" : "";

  return (
    <div>
      <ToastContainer position="top-center" autoClose={3000} newestOnTop closeOnClick />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete menu item?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">This cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <Dialog open={isModalOpen} onOpenChange={open => { if (!open) closeModal(); else setIsModalOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingItem(null); setFormData(EMPTY_FORM); setErrors({}); setTouched(new Set()); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[560px] bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} noValidate className="space-y-4 py-2">

              {/* Food ID — new items only */}
              {!editingItem && (
                <Field label="Food ID" required>
                  <Input
                    id="foodId" name="foodId"
                    placeholder="e.g. F013 or burger-01"
                    value={formData.foodId}
                    onChange={handleInput}
                    onBlur={() => touch("foodId")}
                    className={inputCls("foodId")}
                  />
                  <FieldError msg={err("foodId")} />
                </Field>
              )}

              {/* Name */}
              <Field label="Name" required>
                <Input
                  id="name" name="name"
                  placeholder="Patatas Bravas"
                  value={formData.name}
                  onChange={handleInput}
                  onBlur={() => touch("name")}
                  className={inputCls("name")}
                />
                <FieldError msg={err("name")} />
              </Field>

              {/* Description */}
              <Field label="Description" required>
                <Textarea
                  id="description" name="description"
                  placeholder="Short description of the dish…"
                  value={formData.description}
                  onChange={handleInput}
                  onBlur={() => touch("description")}
                  className={inputCls("description")}
                  rows={3}
                />
                <FieldError msg={err("description")} />
              </Field>

              {/* Price + Category — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (€)" required>
                  <Input
                    id="price" name="price"
                    type="number" min="0.01" step="0.01"
                    placeholder="0.00"
                    value={formData.price || ""}
                    onChange={handleInput}
                    onBlur={() => touch("price")}
                    className={inputCls("price")}
                  />
                  <FieldError msg={err("price")} />
                </Field>

                <Field label="Category">
                  <Select
                    value={formData.category}
                    onValueChange={(v: "food" | "drink" | "dessert") =>
                      setFormData(prev => ({ ...prev, category: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="drink">Drink</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Country + Ingredients — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country of origin" required>
                  <Input
                    id="countryOfOrigin" name="countryOfOrigin"
                    placeholder="Spain"
                    value={formData.countryOfOrigin}
                    onChange={handleInput}
                    onBlur={() => touch("countryOfOrigin")}
                    className={inputCls("countryOfOrigin")}
                  />
                  <FieldError msg={err("countryOfOrigin")} />
                </Field>

                <Field label="Ingredients">
                  <Input
                    id="ingredients" name="ingredients"
                    placeholder="potato, oil, salt"
                    value={formData.ingredients.join(", ")}
                    onChange={handleIngredients}
                  />
                  <p className="text-[11px] text-gray-400">Comma-separated</p>
                </Field>
              </div>

              {/* Dietary flags */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Dietary</p>
                <div className="flex gap-6">
                  {([
                    { key: "halal",      label: "Halal"      },
                    { key: "vegetarian", label: "Vegetarian" },
                    { key: "alcoholic",  label: "Alcoholic"  },
                  ] as const).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <Checkbox
                        id={key}
                        checked={formData[key]}
                        onCheckedChange={c => setFormData(p => ({ ...p, [key]: !!c }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Photos</p>
                <ImagePicker
                  images={formData.images}
                  category={formData.category}
                  onChange={imgs => setFormData(p => ({ ...p, images: imgs }))}
                />
              </div>

              <p className="text-xs text-gray-400">
                <span className="text-red-500">*</span> Required fields
              </p>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit">{editingItem ? "Update" : "Add"} Menu Item</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Image</TableHead>
            <TableHead>Food ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Dietary</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                No menu items yet — add one above.
              </TableCell>
            </TableRow>
          )}
          {menuItems.map((item) => {
            const thumb = item.images?.[0] ?? item.imageUrl ?? null;
            return (
              <TableRow key={item.foodId}>
                <TableCell>
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ImagePlus className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-500">{item.foodId}</TableCell>
                <TableCell className="font-medium">
                  {item.name}
                  {item.images && item.images.length > 1 && (
                    <span className="ml-1.5 text-[10px] text-gray-400">+{item.images.length - 1}</span>
                  )}
                </TableCell>
                <TableCell>€{item.price.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE[item.category] ?? ""}`}>
                    {item.category}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-gray-500 space-x-1">
                  {item.halal      && <span className="text-green-600">Halal</span>}
                  {item.vegetarian && <span className="text-emerald-600">Veg</span>}
                  {item.alcoholic  && <span className="text-purple-600">Alc</span>}
                  {!item.halal && !item.vegetarian && !item.alcoholic && "—"}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item.foodId)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MenuItems;
