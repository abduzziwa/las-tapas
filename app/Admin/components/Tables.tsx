// "use client";

// import { PlusCircle, Edit, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { useEffect, useState } from "react";
// import { endpoints } from "@/app/api/endpoint";

// const Tables = () => {
//   const [tables, setTables] = useState<
//     { tableNumber: string; seats: string; status: string; occupiedBy: string }[]
//   >([]);
//   const [isTableModalOpen, setIsTableModalOpen] = useState(false);
//   const [tableFormData, setTableFormData] = useState({
//     tableNumber: "",
//     seats: "",
//     status: "available",
//     occupiedBy: "none",
//   });
//   const [editingTable, setEditingTable] = useState<{
//     tableNumber: string;
//     seats: string;
//     status: string;
//     occupiedBy: string;
//   } | null>(null);

//   useEffect(() => {
//     fetchTables();
//   }, []);

//   const fetchTables = async () => {
//     try {
//       const response = await fetch(
//         `http://${endpoints.next_ip_port}/api/tables`
//       );
//       if (!response.ok) throw new Error("Failed to fetch tables");
//       const data = await response.json();
//       setTables(data);
//     } catch (error) {
//       console.error("Error fetching tables:", error);
//     }
//   };

//   //   const handleTableInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   //     const { name, value } = e.target;
//   //     setTableFormData((prev) => ({ ...prev, [name]: value }));
//   //   };

//   //   const handleTableStatusChange = (value: string) => {
//   //     setTableFormData((prev) => ({ ...prev, status: value }));
//   //   };

//   const handleTableSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     try {
//       const url = editingTable
//         ? `http://localhost/api/tables/${editingTable.tableNumber}`
//         : "http://localhost/api/tables";
//       const method = editingTable ? "PUT" : "POST";
//       const response = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(tableFormData),
//       });
//       if (!response.ok) throw new Error("Failed to save table");
//       fetchTables();
//       setIsTableModalOpen(false);
//       setEditingTable(null);
//       setTableFormData({
//         tableNumber: "",
//         seats: "",
//         status: "available",
//         occupiedBy: "none",
//       });
//     } catch (error) {
//       console.error("Error saving table:", error);
//     }
//   };

//   const handleEditTable = (table: {
//     tableNumber: string;
//     seats: string;
//     status: string;
//     occupiedBy: string;
//   }) => {
//     setEditingTable(table);
//     setTableFormData(table);
//     setIsTableModalOpen(true);
//   };

//   const handleDeleteTable = async (tableNumber: string) => {
//     try {
//       const response = await fetch(
//         `http://localhost/api/tables/${tableNumber}`,
//         {
//           method: "DELETE",
//         }
//       );
//       if (!response.ok) throw new Error("Failed to delete table");
//       fetchTables();
//     } catch (error) {
//       console.error("Error deleting table:", error);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Tables</h2>
//       <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
//         <DialogTrigger asChild>
//           <Button>
//             <PlusCircle className="mr-2 h-4 w-4" /> Add Table
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {editingTable ? "Edit Table" : "Add New Table"}
//             </DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleTableSubmit}>
//             {/* Table form fields */}
//             <DialogFooter className="mt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => {
//                   setIsTableModalOpen(false);
//                   setEditingTable(null);
//                 }}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {editingTable ? "Update" : "Add"} Table
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Table Number</TableHead>
//             <TableHead>Seats</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Occupied By</TableHead>
//             <TableHead>Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {tables.map((table) => (
//             <TableRow key={table.tableNumber}>
//               <TableCell>{table.tableNumber}</TableCell>
//               <TableCell>{table.seats}</TableCell>
//               <TableCell>{table.status}</TableCell>
//               <TableCell>{table.occupiedBy}</TableCell>
//               <TableCell>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => handleEditTable(table)}
//                 >
//                   <Edit className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => handleDeleteTable(table.tableNumber)}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// };

// export default Tables;

import React, { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
import { endpoints } from "@/app/api/endpoint";
import StatusBadge, { StatusBadgeProps } from "./StatusBadge";

const Tables = () => {
  const { toast } = useToast();
  const [tables, setTables] = useState<
    { tableNumber: string; seats: string; status: string; occupiedBy: string }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: "",
    seats: "",
    status: "available",
    occupiedBy: "none",
  });
  const [editingTable, setEditingTable] = useState<{
    tableNumber: string;
    seats: string;
    status: string;
    occupiedBy: string;
  } | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch("/api/tables");
      if (!response.ok) {
        toast({
          title: "OOPS!!🤦‍♂️🤦‍♂️",
          description: "Failed. Something went wrong",
          style: { backgroundColor: "#ffcccc", color: "black" },
        });
        setIsModalOpen(false);
        throw new Error("Failed to fetch tables");
      }

      const data = await response.json();
      setTables(data);
      toast({
        title: "Success!🎉🎉",
        description: "Operation completed successfully",
        style: { backgroundColor: "green", color: "white" },
      });
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast({
        title: "OOPS!!🤦‍♂️🤦‍♂️",
        description: "Failed. Something went wrong",
        style: { backgroundColor: "#ffcccc", color: "black" },
      });
      setIsModalOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const url = editingTable
        ? `http://${endpoints.next_ip_port}/api/tables?tableNumber=${editingTable.tableNumber}`
        : `http://${endpoints.next_ip_port}/api/tables`;
      const method = editingTable ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        toast({
          title: "OOPS!!🤦‍♂️🤦‍♂️",
          description: "Failed. Something went wrong",
          style: { backgroundColor: "#ffcccc", color: "black" },
        });
        setIsModalOpen(false);
        throw new Error("Failed to save table");
      }
      fetchTables();
      setIsModalOpen(false);
      resetForm();
      toast({
        title: "Sucess😎😎",
        description: "Operation completed successfully",
      });
    } catch (error) {
      toast({
        title: "OOPS!!🤦‍♂️🤦‍♂️",
        description: "Failed. Something went wrong",
        style: { backgroundColor: "#ffcccc", color: "black" },
      });
      setIsModalOpen(false);
      console.error("Error saving table:", error);
    }
  };

  const handleEdit = (table: {
    tableNumber: string;
    seats: string;
    status: string;
    occupiedBy: string;
  }) => {
    setEditingTable(table);
    setFormData(table);
    setIsModalOpen(true);
  };

  const handleDelete = async (tableNumber: string) => {
    try {
      const response = await fetch(
        `http://${endpoints.next_ip_port}/api/tables?tableNumber=${tableNumber}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        toast({
          title: "OOPS!!🤦‍♂️🤦‍♂️",
          description: "Failed. Something went wrong",
          style: { backgroundColor: "#ffcccc", color: "black" },
        });
        setIsModalOpen(false);
        throw new Error("Failed to delete table");
      }
      fetchTables();
    } catch (error) {
      toast({
        title: "OOPS!!🤦‍♂️🤦‍♂️",
        description: "Failed. Something went wrong",
        style: { backgroundColor: "#ffcccc", color: "black" },
      });
      setIsModalOpen(false);
      console.error("Error deleting table:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      tableNumber: "",
      seats: "",
      status: "available",
      occupiedBy: "none",
    });
    setEditingTable(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tables</h2>
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Table
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Edit Table" : "Add New Table"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tableNumber" className="text-right">
                  Table Number
                </Label>
                <Input
                  id="tableNumber"
                  name="tableNumber"
                  value={formData.tableNumber}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="seats" className="text-right">
                  Seats
                </Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  value={formData.seats}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  onValueChange={handleStatusChange}
                  defaultValue={formData.status}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="booked">booked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="occupiedBy" className="text-right">
                  Occupied By
                </Label>
                <Input
                  id="occupiedBy"
                  name="occupiedBy"
                  value={formData.occupiedBy}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingTable ? "Update" : "Add"} Table
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Table Number</TableHead>
            <TableHead>Seats</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Occupied By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables.map((table) => (
            <TableRow key={table.tableNumber}>
              <TableCell>{table.tableNumber}</TableCell>
              <TableCell>{table.seats}</TableCell>
              <TableCell>
                <StatusBadge
                  status={table.status as StatusBadgeProps["status"]}
                >
                  {table.status}
                </StatusBadge>
              </TableCell>
              <TableCell>{table.occupiedBy}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(table)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(table.tableNumber)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Tables;
