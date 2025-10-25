// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Edit, Search } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// interface Appointment {
//   id: string;
//   services: Array<{
//     id: string,
//     name: string,
//     description: string,
//     price: number,
//     duration: string,
//   }>;
//   vehicle: {
//     id: string,
//     name: string,
//     plate: string,
//     model: string,
//     year?: string,
//   };
//   date: string;
//   time: string;
//   status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
//   center: string;
//   technician?: string;
//   notes?: string;
//   createdAt: string;
//   estimatedDuration: string;
//   paymentStatus?: string;
//   totalAmount?: number;
// }

// interface AppointmentTableProps {
//   appointments: Appointment[];
//   onEdit: (appointment: Appointment) => void;
//   onConfirm: (id: string) => void;
//   onCancel: (id: string) => void;
//   showActions?: boolean;
// }

// // Filter form schema
// const filterSchema = z.object({
//   search: z.string().optional(),
//   status: z.enum([
//     "all",
//     "pending",
//     "confirmed",
//     "in_progress",
//     "completed",
//     "cancelled",
//   ]),
// });
// type FilterForm = z.infer<typeof filterSchema>;

// export function AppointmentTable({
//   appointments,
//   onEdit,
//   onConfirm,
//   onCancel,
//   showActions = true,
// }: AppointmentTableProps) {
//   const filterForm =
//     useForm <
//     FilterForm >
//     {
//       resolver: zodResolver(filterSchema),
//       defaultValues: { search: "", status: "all" },
//     };

//   const watchFilters = filterForm.watch();
//   const filteredAppointments = appointments.filter((appointment) => {
//     const term = (watchFilters.search || "").toLowerCase().trim();
//     const serviceNames = appointment.services
//       .map((s) => s.name)
//       .join(" ")
//       .toLowerCase();
//     const matchesSearch =
//       term === "" ||
//       appointment.vehicle.plate.toLowerCase().includes(term) ||
//       appointment.vehicle.name.toLowerCase().includes(term) ||
//       serviceNames.includes(term);

//     const matchesStatus =
//       watchFilters.status === "all" ||
//       appointment.status === watchFilters.status;

//     return matchesSearch && matchesStatus;
//   });

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "pending":
//         return <Badge variant="secondary">Chờ xác nhận</Badge>;
//       case "confirmed":
//         return <Badge variant="default">Đã xác nhận</Badge>;
//       case "in_progress":
//         return <Badge variant="destructive">Đang thực hiện</Badge>;
//       case "completed":
//         return <Badge className="bg-green-500">Hoàn thành</Badge>;
//       case "cancelled":
//         return <Badge variant="outline">Đã hủy</Badge>;
//       default:
//         return <Badge variant="outline">Không xác định</Badge>;
//     }
//   };

//   return (
//     <div className="space-y-4">
//       {/* Search and Filter Controls */}
//       <div className="flex items-center justify-between">
//         <Form {...filterForm}>
//           <form className="flex items-center gap-3">
//             <FormField
//               name="search"
//               control={filterForm.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <FormControl>
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
//                       <Input
//                         className="pl-9 w-64"
//                         placeholder="Tìm kiếm..."
//                         {...field}
//                       />
//                     </div>
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <FormField
//               name="status"
//               control={filterForm.control}
//               render={({ field }) => (
//                 <FormItem>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger className="w-32">
//                         <SelectValue placeholder="Status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="all">Tất cả</SelectItem>
//                       <SelectItem value="pending">Chờ xác nhận</SelectItem>
//                       <SelectItem value="confirmed">Đã xác nhận</SelectItem>
//                       <SelectItem value="in_progress">
//                         Đang thực hiện
//                       </SelectItem>
//                       <SelectItem value="completed">Hoàn thành</SelectItem>
//                       <SelectItem value="cancelled">Đã hủy</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </FormItem>
//               )}
//             />
//           </form>
//         </Form>
//       </div>

//       {/* Appointments Table */}
//       <div className="border rounded-lg">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Ngày</TableHead>
//               <TableHead>Giờ</TableHead>
//               <TableHead>Khách/xe</TableHead>
//               <TableHead>Dịch vụ</TableHead>
//               <TableHead>KTV</TableHead>
//               <TableHead>Trạng thái</TableHead>
//               {showActions && (
//                 <TableHead className="text-right">Thao tác</TableHead>
//               )}
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredAppointments.length === 0 ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={showActions ? 7 : 6}
//                   className="text-center py-8 text-muted-foreground"
//                 >
//                   Không tìm thấy lịch hẹn nào
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredAppointments.map((appointment) => (
//                 <TableRow key={appointment.id}>
//                   <TableCell>
//                     {new Date(appointment.date).toLocaleDateString("vi-VN")}
//                   </TableCell>
//                   <TableCell>{appointment.time}</TableCell>
//                   <TableCell>
//                     {appointment.vehicle.name} - {appointment.vehicle.plate}
//                   </TableCell>
//                   <TableCell>
//                     {appointment.services.map((s) => s.name).join(", ")}
//                   </TableCell>
//                   <TableCell>{appointment.technician || "—"}</TableCell>
//                   <TableCell>{getStatusBadge(appointment.status)}</TableCell>
//                   {showActions && (
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2">
//                         {appointment.status === "pending" && (
//                           <>
//                             <Button
//                               size="sm"
//                               onClick={() => onConfirm(appointment.id)}
//                             >
//                               Xác nhận
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => onCancel(appointment.id)}
//                             >
//                               Hủy
//                             </Button>
//                           </>
//                         )}
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => onEdit(appointment)}
//                         >
//                           <Edit className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   )}
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }
