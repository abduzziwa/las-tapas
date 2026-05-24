"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Employee {
  employeeId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  shiftDetails: string;
}

interface FormData extends Employee {
  password: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const EMPTY_FORM: FormData = {
  employeeId: "",
  name: "",
  email: "",
  role: "waiter",
  isActive: true,
  shiftDetails: "",
  password: "",
};

function validate(data: FormData, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!isEdit && !data.employeeId.trim()) errors.employeeId = "Employee ID is required";
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!isEdit && !data.password) errors.password = "Password is required for new employees";
  if (!isEdit && data.password && data.password.length < 6) errors.password = "Password must be at least 6 characters";
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

const ROLE_COLORS: Record<string, string> = {
  admin:   "bg-red-100 text-red-700",
  manager: "bg-purple-100 text-purple-700",
  waiter:  "bg-blue-100 text-blue-700",
  chef:    "bg-orange-100 text-orange-700",
  bar:     "bg-cyan-100 text-cyan-700",
  cashier: "bg-yellow-100 text-yellow-700",
};

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error();
      setEmployees(await res.json());
    } catch {
      toast.error("Failed to fetch employees", { position: "top-center", autoClose: 3000 });
    }
  };

  const touch = (name: string) => setTouched(prev => new Set(prev).add(name));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    touch(name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(formData, !!editingEmployee);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched(new Set(Object.keys(errs)));
      return;
    }
    setErrors({});

    try {
      const url = editingEmployee
        ? `/api/employees?employeeId=${editingEmployee.employeeId}`
        : `/api/employees`;

      const body: Partial<FormData> = { ...formData };
      if (editingEmployee && !formData.password) delete body.password;

      const res = await fetch(url, {
        method: editingEmployee ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to save employee", { position: "top-center", autoClose: 3000 });
        return;
      }
      fetchEmployees();
      closeModal();
      toast.success(`Employee ${editingEmployee ? "updated" : "added"} successfully`, { position: "top-center", autoClose: 3000 });
    } catch {
      toast.error("Failed to save employee", { position: "top-center", autoClose: 3000 });
    }
  };

  const handleDelete = async (employeeId: string) => {
    try {
      const res = await fetch(`/api/employees?employeeId=${employeeId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      fetchEmployees();
      toast.success("Employee deleted", { position: "top-center", autoClose: 3000 });
    } catch {
      toast.error("Failed to delete employee", { position: "top-center", autoClose: 3000 });
    } finally {
      setDeleteTarget(null);
    }
  };

  const openEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({ ...employee, password: "" });
    setErrors({});
    setTouched(new Set());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData(EMPTY_FORM);
    setErrors({});
    setTouched(new Set());
    setShowPassword(false);
  };

  const err = (field: keyof FormData) => (touched.has(field) ? errors[field] : undefined);
  const inputCls = (field: keyof FormData) =>
    err(field) ? "border-red-400 focus-visible:ring-red-400" : "";

  return (
    <div>
      <ToastContainer position="top-center" autoClose={3000} newestOnTop />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete employee?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            This will permanently remove the employee account. This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Staff</h2>
        <Dialog open={isModalOpen} onOpenChange={open => { if (!open) closeModal(); else setIsModalOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingEmployee(null); setFormData(EMPTY_FORM); setErrors({}); setTouched(new Set()); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 py-4">

                {/* Employee ID — hidden on edit */}
                {!editingEmployee && (
                  <div className="grid gap-1">
                    <Label htmlFor="employeeId">
                      Employee ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="employeeId" name="employeeId"
                      placeholder="e.g. emp-001"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      onBlur={() => touch("employeeId")}
                      className={inputCls("employeeId")}
                    />
                    <FieldError msg={err("employeeId")} />
                  </div>
                )}

                {/* Name */}
                <div className="grid gap-1">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name" name="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={() => touch("name")}
                    className={inputCls("name")}
                  />
                  <FieldError msg={err("name")} />
                </div>

                {/* Email */}
                <div className="grid gap-1">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email" name="email" type="email"
                    placeholder="staff@lastapas.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => touch("email")}
                    className={inputCls("email")}
                  />
                  <FieldError msg={err("email")} />
                </div>

                {/* Role */}
                <div className="grid gap-1">
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["waiter", "chef", "bar", "manager", "cashier", "admin"].map(r => (
                        <SelectItem key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Shift details */}
                <div className="grid gap-1">
                  <Label htmlFor="shiftDetails">Shift Details</Label>
                  <Input
                    id="shiftDetails" name="shiftDetails"
                    placeholder="e.g. Mon–Fri 17:00–23:00"
                    value={formData.shiftDetails}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Password */}
                <div className="grid gap-1">
                  <Label htmlFor="password">
                    {editingEmployee ? "New Password" : <>Password <span className="text-red-500">*</span></>}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password" name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => !editingEmployee && touch("password")}
                      placeholder={editingEmployee ? "Leave blank to keep current" : "Min. 6 characters"}
                      className={`pr-10 ${inputCls("password")}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldError msg={err("password")} />
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <Input
                    id="isActive" name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium">Active (can log in)</span>
                </label>

              </div>

              <p className="text-xs text-gray-400 mb-3">
                <span className="text-red-500">*</span> Required fields
              </p>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit">{editingEmployee ? "Update" : "Add"} Employee</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                No employees yet — add one above.
              </TableCell>
            </TableRow>
          )}
          {employees.map((emp) => (
            <TableRow key={emp.employeeId}>
              <TableCell className="font-mono text-xs text-gray-500">{emp.employeeId}</TableCell>
              <TableCell className="font-medium">{emp.name}</TableCell>
              <TableCell className="text-gray-500 text-sm">{emp.email}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[emp.role] ?? "bg-gray-100 text-gray-700"}`}>
                  {emp.role}
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">{emp.shiftDetails || "—"}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${emp.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {emp.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(emp.employeeId)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Employees;
