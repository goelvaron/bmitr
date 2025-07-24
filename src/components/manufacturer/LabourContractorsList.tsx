import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  MessageSquare,
  RefreshCw,
  Search,
  Filter,
  Send,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LabourContractorsListProps {
  manufacturerId: string;
}

interface LabourContractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  city: string;
  state: string;
  district: string;
  country: string;
  service_types: string[];
  experience_years: string;
  additional_info?: string;
  created_at: string;
}

interface LabourInquiry {
  id: string;
  labour_contractor_id: string;
  client_name: string;
  client_phone: string;
  service_type: string;
  project_description: string;
  budget_range?: string;
  timeline?: string;
  status: string;
  response?: string;
  response_date?: string;
  created_at: string;
}

interface InquiryForm {
  service_type: string;
  project_description: string;
  budget_range: string;
  expected_start_date: string;
  project_duration: string;
}

const LabourContractorsList: React.FC<LabourContractorsListProps> = ({
  manufacturerId,
}) => {
  const [labourContractors, setLabourContractors] = useState<
    LabourContractor[]
  >([]);
  const [filteredContractors, setFilteredContractors] = useState<
    LabourContractor[]
  >([]);
  const [myInquiries, setMyInquiries] = useState<LabourInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] =
    useState<LabourContractor | null>(null);
  const [inquiryForm, setInquiryForm] = useState<InquiryForm>({
    service_type: "",
    project_description: "",
    budget_range: "",
    expected_start_date: "",
    project_duration: "",
  });
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLabourContractors();
    fetchMyInquiries();
  }, []);

  useEffect(() => {
    filterContractors();
  }, [labourContractors, searchTerm, selectedServiceType, selectedState]);

  const fetchLabourContractors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("labour_contractors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching labour contractors:", error);
        toast({
          title: "Error",
          description: "Failed to fetch labour contractors.",
          variant: "destructive",
        });
        return;
      }

      setLabourContractors(data || []);
    } catch (err) {
      console.error("Exception fetching labour contractors:", err);
      toast({
        title: "Error",
        description: "Failed to fetch labour contractors.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyInquiries = async () => {
    setLoadingInquiries(true);
    try {
      // Get manufacturer details first to get the client_name and client_phone
      const { data: manufacturerData, error: manufacturerError } =
        await supabase
          .from("manufacturers")
          .select("name, phone")
          .eq("id", manufacturerId)
          .single();

      if (manufacturerError) {
        console.error("Error fetching manufacturer data:", manufacturerError);
        return;
      }

      // Fetch inquiries sent by this manufacturer
      const { data, error } = await supabase
        .from("labour_contractor_inquiries")
        .select("*")
        .eq("client_name", manufacturerData?.name || "")
        .eq("client_phone", manufacturerData?.phone || "")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching my inquiries:", error);
        return;
      }

      setMyInquiries(data || []);
    } catch (err) {
      console.error("Exception fetching my inquiries:", err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const filterContractors = () => {
    let filtered = labourContractors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (contractor) =>
          contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contractor.company_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          contractor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contractor.state.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Service type filter
    if (selectedServiceType) {
      filtered = filtered.filter((contractor) =>
        contractor.service_types?.includes(selectedServiceType),
      );
    }

    // State filter
    if (selectedState) {
      filtered = filtered.filter(
        (contractor) => contractor.state === selectedState,
      );
    }

    setFilteredContractors(filtered);
  };

  const handleSendInquiry = (contractor: LabourContractor) => {
    setSelectedContractor(contractor);
    setInquiryForm({
      service_type: "",
      project_description: "",
      budget_range: "",
      expected_start_date: "",
      project_duration: "",
    });
    setInquiryDialogOpen(true);
  };

  const handleSubmitInquiry = async () => {
    if (
      !selectedContractor ||
      !inquiryForm.service_type ||
      !inquiryForm.project_description
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSendingInquiry(true);
    try {
      console.log("=== SENDING LABOUR INQUIRY ===");
      console.log("Manufacturer ID:", manufacturerId);
      console.log("Labour Contractor ID:", selectedContractor.id);
      console.log("Service Type:", inquiryForm.service_type);
      console.log("Project Description:", inquiryForm.project_description);

      // Get manufacturer details for the inquiry
      const { data: manufacturerData, error: manufacturerError } =
        await supabase
          .from("manufacturers")
          .select("name, phone, email")
          .eq("id", manufacturerId)
          .single();

      if (manufacturerError) {
        console.error("Error fetching manufacturer data:", manufacturerError);
        throw new Error("Failed to fetch manufacturer details");
      }

      const inquiryData = {
        labour_contractor_id: selectedContractor.id,
        client_name: manufacturerData?.name || "Manufacturer",
        client_phone: manufacturerData?.phone || "",
        client_email: manufacturerData?.email || "",
        service_type: inquiryForm.service_type,
        project_description: inquiryForm.project_description,
        budget_range: inquiryForm.budget_range || null,
        timeline: inquiryForm.project_duration || null,
        location: null, // Could be added to the form if needed
        status: "pending",
        priority: "normal",
      };

      console.log("Inquiry data to insert:", inquiryData);

      const { data, error } = await supabase
        .from("labour_contractor_inquiries")
        .insert(inquiryData)
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log("Inquiry inserted successfully:", data);

      toast({
        title: "Inquiry Sent",
        description: `Your inquiry has been sent to ${selectedContractor.name} successfully.`,
      });

      setInquiryDialogOpen(false);
      setSelectedContractor(null);
      setInquiryForm({
        service_type: "",
        project_description: "",
        budget_range: "",
        expected_start_date: "",
        project_duration: "",
      });

      // Refresh inquiries to show the new one
      fetchMyInquiries();
    } catch (err) {
      console.error("Error sending inquiry:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      toast({
        title: "Error",
        description: `Failed to send inquiry: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSendingInquiry(false);
    }
  };

  const getServiceTypeLabel = (serviceType: string) => {
    const serviceTypeLabels: { [key: string]: string } = {
      molders: "Molders (Pather)",
      green_brick_movers: "Green Brick Movers (Kacchi Bharai)",
      stackers: "Stackers (Beldaar)",
      insulation: "Insulation (Raabis)",
      coal_loading: "Coal Loading (Coal Dhulai)",
      firemen: "Firemen (Jalai)",
      withdrawers: "Withdrawers (Nikaasi)",
      jcb_driver: "JCB Driver",
      tractor_driver: "Tractor Driver",
      manager: "Manager",
      welder: "Welder",
      general_labour: "General Labour",
    };
    return serviceTypeLabels[serviceType] || serviceType;
  };

  const uniqueServiceTypes = Array.from(
    new Set(
      labourContractors.flatMap((contractor) => contractor.service_types || []),
    ),
  );

  const uniqueStates = Array.from(
    new Set(labourContractors.map((contractor) => contractor.state)),
  ).filter(Boolean);

  // Helper function to get inquiries for a specific contractor
  const getInquiriesForContractor = (contractorId: string) => {
    return myInquiries.filter(
      (inquiry) => inquiry.labour_contractor_id === contractorId,
    );
  };

  return (
    <div className="bg-white">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Labour Contractors Directory
              </CardTitle>
              <CardDescription>
                Browse and connect with registered labour contractors
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                fetchLabourContractors();
                fetchMyInquiries();
              }}
              disabled={loading || loadingInquiries}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading || loadingInquiries ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedServiceType}
              onValueChange={(value) =>
                setSelectedServiceType(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service Types</SelectItem>
                {uniqueServiceTypes.map((serviceType) => (
                  <SelectItem key={serviceType} value={serviceType}>
                    {getServiceTypeLabel(serviceType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedState}
              onValueChange={(value) =>
                setSelectedState(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedServiceType("");
                setSelectedState("");
              }}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredContractors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No labour contractors found.</p>
              {searchTerm || selectedServiceType || selectedState ? (
                <p className="text-sm mt-2">
                  Try adjusting your filters to see more results.
                </p>
              ) : (
                <p className="text-sm mt-2">
                  Labour contractors will appear here once they register.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Showing {filteredContractors.length} of{" "}
                {labourContractors.length} labour contractors
              </div>
              {filteredContractors.map((contractor) => (
                <Card
                  key={contractor.id}
                  className="border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {contractor.name}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {contractor.company_name}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <p className="text-sm flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>
                                {contractor.city}, {contractor.district},{" "}
                                {contractor.state}
                              </span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{contractor.phone}</span>
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>{contractor.email}</span>
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>
                                Experience: {contractor.experience_years} years
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Registered:{" "}
                              {new Date(
                                contractor.created_at,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Service Types */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Services Offered:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {contractor.service_types?.map(
                              (serviceType, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {getServiceTypeLabel(serviceType)}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Additional Info */}
                        {contractor.additional_info && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Additional Information:
                            </p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {contractor.additional_info}
                            </p>
                          </div>
                        )}

                        {/* My Inquiries and Responses */}
                        {(() => {
                          const contractorInquiries = getInquiriesForContractor(
                            contractor.id,
                          );
                          if (contractorInquiries.length > 0) {
                            return (
                              <div className="mb-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  My Inquiries & Responses:
                                </p>
                                <div className="space-y-3">
                                  {contractorInquiries.map((inquiry) => (
                                    <div
                                      key={inquiry.id}
                                      className="bg-blue-50 border border-blue-200 p-3 rounded-lg"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {inquiry.service_type}
                                          </Badge>
                                          <Badge
                                            variant={
                                              inquiry.status === "responded"
                                                ? "default"
                                                : "destructive"
                                            }
                                            className="text-xs"
                                          >
                                            {inquiry.status}
                                          </Badge>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                          {new Date(
                                            inquiry.created_at,
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 mb-2">
                                        <strong>My Request:</strong>{" "}
                                        {inquiry.project_description}
                                      </p>
                                      {inquiry.budget_range && (
                                        <p className="text-sm text-gray-700 mb-2">
                                          <strong>Budget:</strong>{" "}
                                          {inquiry.budget_range}
                                        </p>
                                      )}
                                      {inquiry.response ? (
                                        <div className="bg-green-50 border border-green-200 p-2 rounded mt-2">
                                          <p className="text-sm text-green-800">
                                            <strong>Response:</strong>{" "}
                                            {inquiry.response}
                                          </p>
                                          {inquiry.response_date && (
                                            <p className="text-xs text-green-600 mt-1">
                                              Responded on:{" "}
                                              {new Date(
                                                inquiry.response_date,
                                              ).toLocaleDateString()}
                                            </p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="bg-yellow-50 border border-yellow-200 p-2 rounded mt-2">
                                          <p className="text-sm text-yellow-800">
                                            <strong>Status:</strong> Waiting for
                                            response from contractor
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      <div className="ml-4">
                        <Button
                          onClick={() => handleSendInquiry(contractor)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Inquiry
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Send Inquiry to {selectedContractor?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedContractor && (
            <div className="space-y-4">
              {/* Contractor Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Contractor Details:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Company:</strong> {selectedContractor.company_name}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedContractor.city},{" "}
                    {selectedContractor.state}
                  </p>
                  <p>
                    <strong>Experience:</strong>{" "}
                    {selectedContractor.experience_years} years
                  </p>
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="service_type">Service Type Required *</Label>
                  <Select
                    value={inquiryForm.service_type}
                    onValueChange={(value) =>
                      setInquiryForm((prev) => ({
                        ...prev,
                        service_type: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedContractor.service_types?.map((serviceType) => (
                        <SelectItem key={serviceType} value={serviceType}>
                          {getServiceTypeLabel(serviceType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="project_description">
                    Project Description *
                  </Label>
                  <Textarea
                    id="project_description"
                    value={inquiryForm.project_description}
                    onChange={(e) =>
                      setInquiryForm((prev) => ({
                        ...prev,
                        project_description: e.target.value,
                      }))
                    }
                    placeholder="Describe your project requirements, timeline, and any specific needs..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget_range">Budget Range</Label>
                    <Input
                      id="budget_range"
                      value={inquiryForm.budget_range}
                      onChange={(e) =>
                        setInquiryForm((prev) => ({
                          ...prev,
                          budget_range: e.target.value,
                        }))
                      }
                      placeholder="e.g., ₹50,000 - ₹1,00,000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="project_duration">Project Duration</Label>
                    <Input
                      id="project_duration"
                      value={inquiryForm.project_duration}
                      onChange={(e) =>
                        setInquiryForm((prev) => ({
                          ...prev,
                          project_duration: e.target.value,
                        }))
                      }
                      placeholder="e.g., 2 weeks, 1 month"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expected_start_date">
                    Expected Start Date
                  </Label>
                  <Input
                    id="expected_start_date"
                    type="date"
                    value={inquiryForm.expected_start_date}
                    onChange={(e) =>
                      setInquiryForm((prev) => ({
                        ...prev,
                        expected_start_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setInquiryDialogOpen(false)}
              disabled={sendingInquiry}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitInquiry}
              disabled={
                sendingInquiry ||
                !inquiryForm.service_type ||
                !inquiryForm.project_description
              }
              className="bg-orange-600 hover:bg-orange-700"
            >
              {sendingInquiry ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabourContractorsList;
