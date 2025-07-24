import React, { useState, useEffect } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Search } from "lucide-react";
import { indianStatesDistricts } from "@/data/indian_states_districts";
import { Customer, getAllCustomers } from "@/services/customerService";

const CustomersList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load customers from Supabase
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Starting customer fetch...");
        const loadedCustomers = await getAllCustomers();
        console.log(
          "Customer fetch completed:",
          loadedCustomers?.length || 0,
          "customers",
        );

        if (Array.isArray(loadedCustomers)) {
          setCustomers(loadedCustomers);
          setFilteredCustomers(loadedCustomers);
          console.log("Customers loaded successfully");
        } else {
          console.warn("getAllCustomers returned non-array:", loadedCustomers);
          setCustomers([]);
          setFilteredCustomers([]);
          setError("Invalid data format received from database.");
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";

        // Provide more specific error messages
        if (errorMessage.includes("environment variables")) {
          setError("Database configuration error. Please contact support.");
        } else if (errorMessage.includes("does not exist")) {
          setError(
            "Database table not found. Please contact support to run migrations.",
          );
        } else if (
          errorMessage.includes("timeout") ||
          errorMessage.includes("network")
        ) {
          setError(
            "Network connection error. Please check your internet connection and try again.",
          );
        } else {
          setError(`Failed to load customers: ${errorMessage}`);
        }

        setCustomers([]);
        setFilteredCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    try {
      let result = customers || [];

      // Apply search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter((customer) => {
          try {
            return (
              (customer.name || "").toLowerCase().includes(term) ||
              (customer.email || "").toLowerCase().includes(term) ||
              (customer.company_name || "").toLowerCase().includes(term) ||
              (customer.district || "").toLowerCase().includes(term)
            );
          } catch (filterErr) {
            console.warn("Error filtering customer:", customer, filterErr);
            return false;
          }
        });
      }

      // Apply state filter
      if (stateFilter) {
        result = result.filter((customer) => customer.state === stateFilter);
      }

      // Apply category filter
      if (categoryFilter) {
        result = result.filter(
          (customer) => customer.category === categoryFilter,
        );
      }

      setFilteredCustomers(result);
    } catch (err) {
      console.error("Error applying filters:", err);
      setFilteredCustomers([]);
    }
  }, [customers, searchTerm, stateFilter, categoryFilter]);

  const exportToCSV = () => {
    try {
      // Create CSV content
      const headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Company",
        "State",
        "District",
        "Category",
        "Joined Date",
      ];

      const csvRows = [
        headers.join(","),
        ...filteredCustomers
          .map((customer) => {
            try {
              return [
                customer.id || "",
                `"${customer.name || ""}"`,
                `"${customer.email || ""}"`,
                `"${customer.phone || ""}"`,
                `"${customer.company_name || ""}"`,
                `"${customer.state || ""}"`,
                `"${customer.district || ""}"`,
                `"${customer.category || ""}"`,
                `"${customer.created_at ? new Date(customer.created_at).toLocaleDateString() : ""}"`,
              ].join(",");
            } catch (rowErr) {
              console.warn("Error processing customer row:", customer, rowErr);
              return "";
            }
          })
          .filter((row) => row !== ""),
      ];

      const csvContent = csvRows.join("\n");

      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `bhatta-mitra-customers-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export CSV. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-redFiredMustard-800">
            Onboarded Customers Database
          </CardTitle>
          <CardDescription>Loading customer data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-redFiredMustard-600 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-redFiredMustard-800">
            Onboarded Customers Database
          </CardTitle>
          <CardDescription>Error loading customer data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 mb-4">
            <div className="font-semibold mb-2">Error Details:</div>
            <div>{error}</div>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700"
          >
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-redFiredMustard-800">
          Onboarded Customers Database
        </CardTitle>
        <CardDescription>
          View and manage all customers who have joined the Bhatta Mitra™
          platform
        </CardDescription>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or company..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All States</SelectItem>
                {indianStatesDistricts.map((stateData) => (
                  <SelectItem key={stateData.state} value={stateData.state}>
                    {stateData.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Brick Kiln Owner">
                  Brick Kiln Owner
                </SelectItem>
                <SelectItem value="Contractor">Contractor</SelectItem>
                <SelectItem value="Builder">Builder</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={exportToCSV}
            >
              <Download size={16} />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableCaption>
              {filteredCustomers.length === 0
                ? "No customers found. Adjust filters or add new customers."
                : `Showing ${filteredCustomers.length} of ${customers.length} customers`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                try {
                  return (
                    <TableRow key={customer.id || Math.random()}>
                      <TableCell className="font-medium">
                        {customer.name || "N/A"}
                      </TableCell>
                      <TableCell>{customer.company_name || "N/A"}</TableCell>
                      <TableCell>
                        <div className="text-sm">{customer.email || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">
                          {customer.phone || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {customer.district || "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {customer.state || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>{customer.category || "N/A"}</TableCell>
                      <TableCell>
                        {customer.created_at
                          ? new Date(customer.created_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                } catch (rowErr) {
                  console.warn(
                    "Error rendering customer row:",
                    customer,
                    rowErr,
                  );
                  return (
                    <TableRow key={Math.random()}>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Error displaying customer data
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomersList;
