"use client";

import React, { useState, useEffect, useRef } from "react";
import { PlusCircle, Edit, Trash2, QrCode, RefreshCw, Printer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRCode from "react-qr-code";
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

interface TableData {
  tableNumber: string;
  seats: number;
  status: string;
  occupiedBy: string[];
}

interface QRSeat { seat: string; url: string; }
interface QRData  { table: string; seats: QRSeat[]; }

type FormErrors = { tableNumber?: string; seats?: string };

const STATUS_STYLE: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  occupied:  "bg-red-100 text-red-700",
  booked:    "bg-amber-100 text-amber-700",
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <AlertCircle className="h-3 w-3 flex-shrink-0" /> {msg}
    </p>
  );
}

function validate(data: { tableNumber: string; seats: string }, isEdit: boolean): FormErrors {
  const errs: FormErrors = {};
  if (!isEdit && !data.tableNumber.trim()) errs.tableNumber = "Table ID is required";
  const n = parseInt(data.seats, 10);
  if (!data.seats) errs.seats = "Number of seats is required";
  else if (isNaN(n) || n < 1 || n > 20) errs.seats = "Seats must be between 1 and 20";
  return errs;
}

const Tables = () => {
  const [tables,       setTables]       = useState<TableData[]>([]);
  const [isFormOpen,   setIsFormOpen]   = useState(false);
  const [isQROpen,     setIsQROpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [qrData,       setQrData]       = useState<QRData | null>(null);
  const [qrLoading,    setQrLoading]    = useState(false);
  const [formData,     setFormData]     = useState({ tableNumber: "", seats: "", status: "available" });
  const [formErrors,   setFormErrors]   = useState<FormErrors>({});
  const [apiError,     setApiError]     = useState<string | null>(null);
  const [touched,      setTouched]      = useState<Set<string>>(new Set());
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/tables");
      if (!res.ok) throw new Error("Failed to fetch tables");
      setTables(await res.json());
    } catch {
      toast.error("Failed to fetch tables");
    }
  };

  const touch = (name: string) => setTouched(prev => new Set(prev).add(name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(formData, !!editingTable);
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      setTouched(new Set(Object.keys(errs)));
      return;
    }
    setFormErrors({});
    setApiError(null);
    try {
      const url = editingTable
        ? `/api/tables?tableNumber=${editingTable.tableNumber}`
        : `/api/tables`;
      const res = await fetch(url, {
        method: editingTable ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, seats: parseInt(formData.seats, 10) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setApiError(body.message || `Failed to save table (${res.status})`);
        return;
      }
      toast.success(`Table ${editingTable ? "updated" : "added"} successfully`);
      fetchTables();
      closeForm();
    } catch {
      setApiError("Network error — could not save table");
    }
  };

  const handleDelete = async (tableNumber: string) => {
    try {
      const res = await fetch(`/api/tables?tableNumber=${tableNumber}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.message || "Failed to delete table");
        return;
      }
      toast.success("Table deleted");
      fetchTables();
    } catch {
      toast.error("Network error — could not delete table");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleReset = async (table: TableData) => {
    try {
      const res = await fetch(`/api/tables?tableNumber=${table.tableNumber}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...table, status: "available", occupiedBy: [] }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Table ${table.tableNumber} reset`);
      fetchTables();
    } catch {
      toast.error("Failed to reset table");
    }
  };

  const handleGenerateQR = async (table: TableData) => {
    setQrLoading(true);
    setIsQROpen(true);
    setQrData(null);
    try {
      const res = await fetch(`/api/qrcode?tableNumber=${table.tableNumber}&seats=${table.seats}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.message || "Failed to generate QR codes");
        setIsQROpen(false);
        return;
      }
      setQrData(await res.json());
    } catch {
      toast.error("Network error — could not generate QR codes");
      setIsQROpen(false);
    } finally {
      setQrLoading(false);
    }
  };

  const openEdit = (table: TableData) => {
    setEditingTable(table);
    setFormData({ tableNumber: table.tableNumber, seats: String(table.seats), status: table.status });
    setFormErrors({});
    setApiError(null);
    setTouched(new Set());
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTable(null);
    setFormData({ tableNumber: "", seats: "", status: "available" });
    setFormErrors({});
    setApiError(null);
    setTouched(new Set());
  };

  const err = (f: keyof FormErrors) => (touched.has(f) ? formErrors[f] : undefined);
  const inputCls = (f: keyof FormErrors) =>
    err(f) ? "border-red-400 focus-visible:ring-red-400" : "";

  return (
    <div className="p-4 sm:p-6">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #qr-print-area, #qr-print-area * { visibility: visible !important; }
          #qr-print-area { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; padding: 24px !important; background: white !important; }
        }
      `}</style>

      <ToastContainer position="top-center" autoClose={3000} newestOnTop />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-white max-w-sm">
          <DialogHeader><DialogTitle>Delete table?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">This will permanently remove the table and cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && handleDelete(deleteTarget)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Tables</h2>
        <Dialog open={isFormOpen} onOpenChange={open => { if (!open) closeForm(); else setIsFormOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTable(null); setFormData({ tableNumber: "", seats: "", status: "available" }); setFormErrors({}); setApiError(null); setTouched(new Set()); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Table
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTable ? "Edit Table" : "Add New Table"}</DialogTitle>
            </DialogHeader>

            {/* API error banner */}
            {apiError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-4 py-4">

                {/* Table ID */}
                {!editingTable && (
                  <div className="grid gap-1">
                    <Label htmlFor="tableNumber">
                      Table ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tableNumber"
                      placeholder="e.g. T1, Terrace-2, Bar-1"
                      value={formData.tableNumber}
                      onChange={e => setFormData(p => ({ ...p, tableNumber: e.target.value }))}
                      onBlur={() => touch("tableNumber")}
                      className={inputCls("tableNumber")}
                    />
                    <FieldError msg={err("tableNumber")} />
                  </div>
                )}

                {/* Seats */}
                <div className="grid gap-1">
                  <Label htmlFor="seats">
                    Number of seats <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="seats"
                    type="number"
                    min={1}
                    max={20}
                    placeholder="1 – 20"
                    value={formData.seats}
                    onChange={e => setFormData(p => ({ ...p, seats: e.target.value }))}
                    onBlur={() => touch("seats")}
                    className={inputCls("seats")}
                  />
                  <FieldError msg={err("seats")} />
                </div>

                {/* Status */}
                <div className="grid gap-1">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={v => setFormData(p => ({ ...p, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <p className="text-xs text-gray-400 mb-3">
                <span className="text-red-500">*</span> Required fields
              </p>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit">{editingTable ? "Update" : "Add"} Table</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tables list */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-gray-500">Table</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-gray-500">Seats</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-gray-500">Status</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-gray-500">Active Sessions</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-10">
                  No tables yet — add one above.
                </TableCell>
              </TableRow>
            )}
            {tables.map(table => (
              <TableRow key={table.tableNumber} className="hover:bg-gray-50 transition-colors">
                <TableCell className="font-semibold text-gray-900">{table.tableNumber}</TableCell>
                <TableCell className="text-gray-600">{table.seats}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[table.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {table.status}
                  </span>
                </TableCell>
                <TableCell>
                  {Array.isArray(table.occupiedBy) && table.occupiedBy.length > 0 ? (
                    <span className="text-sm text-gray-700 font-medium">
                      {table.occupiedBy.length} / {table.seats} seated
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5 flex-wrap">
                    <Button
                      variant="outline" size="sm"
                      className="text-orange-600 border-orange-200 hover:bg-orange-50 text-xs"
                      onClick={() => handleGenerateQR(table)}
                    >
                      <QrCode className="h-3.5 w-3.5 mr-1" /> QR Codes
                    </Button>

                    {table.status === "occupied" && (
                      <Button
                        variant="outline" size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs"
                        onClick={() => handleReset(table)}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => openEdit(table)}>
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(table.tableNumber)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* QR Code Print Modal */}
      <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
        <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Codes — Table {qrData?.table}
            </DialogTitle>
          </DialogHeader>

          {qrLoading && (
            <div className="flex justify-center items-center py-12 gap-3">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-orange-500 border-t-transparent" />
              <span className="text-gray-500 text-sm">Generating codes…</span>
            </div>
          )}

          {qrData && (
            <>
              <div className="flex justify-between items-center mb-4 print:hidden">
                <p className="text-sm text-gray-500">
                  {qrData.seats.length} QR code{qrData.seats.length !== 1 ? "s" : ""} — one per seat.
                </p>
                <Button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-white"
                  style={{ background: "linear-gradient(135deg,#F95E07,#DB8555)" }}
                >
                  <Printer className="h-4 w-4" /> Print QR Codes
                </Button>
              </div>

              <div id="qr-print-area" ref={printRef}>
                <div className="text-center mb-6 hidden print:block">
                  <p className="text-2xl font-bold">Las Tapas</p>
                  <p className="text-lg">Table {qrData.table} — Scan to order</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 p-2">
                  {qrData.seats.map(({ seat, url }) => (
                    <div key={seat} className="flex flex-col items-center border border-gray-200 rounded-xl p-4 gap-3 bg-white">
                      <QRCode
                        value={url}
                        size={160}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        viewBox="0 0 256 256"
                      />
                      <div className="text-center">
                        <p className="font-bold text-base">{qrData.table}</p>
                        <p className="text-gray-400 text-xs mt-0.5">Seat {seat}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-center text-xs text-gray-400 print:block hidden">
                  Scan with your phone camera to place your order
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tables;
