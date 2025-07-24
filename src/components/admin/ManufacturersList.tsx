import React, { useState, useEffect } from "react";
import {
  getAllManufacturers,
  updateManufacturerStatus,
  type BrickOwner,
} from "@/services/customerService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, Search, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ManufacturersList = () => {
  const [manufacturers, setManufacturers] = useState<BrickOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    manufacturerId: string;
    newStatus: string;
    manufacturerName: string;
  }>({ open: false, manufacturerId: "", newStatus: "", manufacturerName: "" });
  const { toast } = useToast();

  useEffect(() => {
    loadManufacturers();
  }, []);

  const loadManufacturers = async () => {
    try {
      setLoading(true);
      const data = await getAllManufacturers();
      setManufacturers(data);
    } catch (error) {
      console.error("Error loading manufacturers:", error);
      toast({
        title: "Error",
        description: "Failed to load manufacturers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    manufacturerId: string,
    newStatus: string,
  ) => {
    try {
      setUpdatingStatus(manufacturerId);
      await updateManufacturerStatus(manufacturerId, newStatus);

      // Update local state
      setManufacturers((prev) =>
        prev.map((manufacturer) =>
          manufacturer.id === manufacturerId
            ? { ...manufacturer, status: newStatus }
            : manufacturer,
        ),
      );

      toast({
        title: "Success",
        description: `Manufacturer status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update manufacturer status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
      setConfirmDialog({
        open: false,
        manufacturerId: "",
        newStatus: "",
        manufacturerName: "",
      });
    }
  };

  const openConfirmDialog = (
    manufacturerId: string,
    newStatus: string,
    manufacturerName: string,
  ) => {
    setConfirmDialog({
      open: true,
      manufacturerId,
      newStatus,
      manufacturerName,
    });
  };

  const getStatusBadge = (status: string | null) => {
    const statusValue = status || "pending";
    switch (statusValue.toLowerCase()) {
      case "approved":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "waitlist":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            <Clock className="w-3 h-3 mr-1" />
            Waitlist
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 border-red-200"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const filteredManufacturers = manufacturers.filter((manufacturer) => {
    const matchesSearch =
      manufacturer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.company_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      manufacturer.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.district?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (manufacturer.status || "pending").toLowerCase() ===
        statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    total: manufacturers.length,
    approved: manufacturers.filter(
      (m) => (m.status || "pending").toLowerCase() === "approved",
    ).length,
    waitlist: manufacturers.filter(
      (m) => (m.status || "pending").toLowerCase() === "waitlist",
    ).length,
    pending: manufacturers.filter(
      (m) => (m.status || "pending").toLowerCase() === "pending",
    ).length,
    rejected: manufacturers.filter(
      (m) => (m.status || "pending").toLowerCase() === "rejected",
    ).length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading manufacturers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statusCounts.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.approved}
            </div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.waitlist}
            </div>
            <p className="text-xs text-muted-foreground">Waitlist</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.pending}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.rejected}
            </div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manufacturer Management</CardTitle>
          <CardDescription>
            Manage manufacturer registrations and approve or reject
            applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search manufacturers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manufacturers Table */}
          {filteredManufacturers.length === 0 ? (
            <div className="text-center py-8 flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No manufacturers found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No manufacturers have registered yet."}
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableCaption>
                  Showing {filteredManufacturers.length} of{" "}
                  {manufacturers.length} manufacturers
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Kiln Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredManufacturers.map((manufacturer) => (
                    <TableRow key={manufacturer.id}>
                      <TableCell className="font-medium">
                        {manufacturer.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {manufacturer.company_name || "N/A"}
                      </TableCell>
                      <TableCell>{manufacturer.email || "N/A"}</TableCell>
                      <TableCell>
                        {manufacturer.city &&
                        manufacturer.district &&
                        manufacturer.state
                          ? `${manufacturer.city}, ${manufacturer.district}, ${manufacturer.state}`
                          : manufacturer.district && manufacturer.state
                            ? `${manufacturer.district}, ${manufacturer.state}`
                            : manufacturer.state || "N/A"}
                      </TableCell>
                      <TableCell>
                        {manufacturer.kiln_type
                          ? manufacturer.kiln_type.charAt(0).toUpperCase() +
                            manufacturer.kiln_type.slice(1)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(manufacturer.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {(manufacturer.status || "pending").toLowerCase() !==
                            "approved" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                openConfirmDialog(
                                  manufacturer.id,
                                  "approved",
                                  manufacturer.name || "Unknown",
                                )
                              }
                              disabled={updatingStatus === manufacturer.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updatingStatus === manufacturer.id
                                ? "..."
                                : "Approve"}
                            </Button>
                          )}
                          {(manufacturer.status || "pending").toLowerCase() !==
                            "waitlist" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                openConfirmDialog(
                                  manufacturer.id,
                                  "waitlist",
                                  manufacturer.name || "Unknown",
                                )
                              }
                              disabled={updatingStatus === manufacturer.id}
                            >
                              {updatingStatus === manufacturer.id
                                ? "..."
                                : "Waitlist"}
                            </Button>
                          )}
                          {(manufacturer.status || "pending").toLowerCase() !==
                            "rejected" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                openConfirmDialog(
                                  manufacturer.id,
                                  "rejected",
                                  manufacturer.name || "Unknown",
                                )
                              }
                              disabled={updatingStatus === manufacturer.id}
                            >
                              {updatingStatus === manufacturer.id
                                ? "..."
                                : "Reject"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of{" "}
              <strong>{confirmDialog.manufacturerName}</strong> to{" "}
              <strong>{confirmDialog.newStatus}</strong>?
              {confirmDialog.newStatus === "approved" && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                  <strong>Note:</strong> Approving this manufacturer will allow
                  them to access the platform and start listing their products.
                </div>
              )}
              {confirmDialog.newStatus === "rejected" && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <strong>Note:</strong> Rejecting this manufacturer will
                  prevent them from accessing the platform.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleStatusChange(
                  confirmDialog.manufacturerId,
                  confirmDialog.newStatus,
                )
              }
              className={
                confirmDialog.newStatus === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : confirmDialog.newStatus === "rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManufacturersList;
