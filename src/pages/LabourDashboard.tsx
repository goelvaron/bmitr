import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  Users,
  Edit,
  Plus,
  Trash2,
  Send,
  Eye,
  MessageSquare,
  DollarSign,
  MapIcon,
  Settings,
} from "lucide-react";
import LabourProfileManagement from "@/components/LabourProfileManagement";

const LabourDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [labourId, setLabourId] = useState<string | null>(null);
  const [labourData, setLabourData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleProfileUpdate = (updatedData: any) => {
    setLabourData(updatedData);
  };

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  const [inquiries, setInquiries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [newService, setNewService] = useState({
    service_type: "",
    pricing: "",
    service_area: "",
    description: "",
  });
  const [newInquiry, setNewInquiry] = useState({
    service_type: "",
    message: "",
    budget_range: "",
  });
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    // Check if user is logged in as a labour contractor
    const storedLabourId = localStorage.getItem("labourId");
    if (!storedLabourId) {
      navigate("/labour-auth");
      return;
    }

    // Set the ID immediately to prevent flickering
    setLabourId(storedLabourId);

    // Verify the labour contractor ID exists in the database and fetch data
    const verifyAndFetchLabourContractor = async () => {
      try {
        console.log("Verifying labour contractor ID:", storedLabourId);
        const { data, error } = await supabase
          .from("labour_contractors")
          .select("*")
          .eq("id", storedLabourId)
          .single();

        if (error || !data) {
          console.error("Error verifying labour contractor:", error);
          localStorage.removeItem("labourId");
          navigate("/labour-auth");
          return;
        }

        console.log("Labour contractor verified successfully");
        setLabourData(data);

        // Load additional data
        await Promise.all([
          loadInquiries(storedLabourId),
          loadProjects(storedLabourId),
        ]);
      } catch (err) {
        console.error("Exception verifying labour contractor:", err);
        localStorage.removeItem("labourId");
        navigate("/labour-auth");
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchLabourContractor();
  }, [navigate]);

  const loadInquiries = async (contractorId: string) => {
    try {
      const { data, error } = await supabase
        .from("labour_contractor_inquiries")
        .select("*")
        .eq("labour_contractor_id", contractorId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setInquiries(data);
      }
    } catch (err) {
      console.error("Error loading inquiries:", err);
    }
  };

  const loadProjects = async (contractorId: string) => {
    try {
      const { data, error } = await supabase
        .from("labour_contractor_projects")
        .select("*")
        .eq("labour_contractor_id", contractorId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  };

  const handleAddService = (serviceType: string) => {
    if (!labourData || !labourId) return;

    const currentServices = labourData.service_types || [];
    if (currentServices.includes(serviceType)) {
      alert("Service already added");
      return;
    }

    const updatedServices = [...currentServices, serviceType];
    updateServices(updatedServices);
  };

  const handleRemoveService = (serviceType: string) => {
    if (!labourData || !labourId) return;

    const currentServices = labourData.service_types || [];
    const updatedServices = currentServices.filter(
      (service) => service !== serviceType,
    );
    updateServices(updatedServices);
  };

  const updateServices = async (services: string[]) => {
    setLoadingAction(true);
    try {
      const { data, error } = await supabase
        .from("labour_contractors")
        .update({ service_types: services })
        .eq("id", labourId)
        .select()
        .single();

      if (error) {
        console.error("Error updating services:", error);
        alert("Failed to update services");
      } else {
        setLabourData(data);
        setServiceDialogOpen(false);
        alert("Services updated successfully!");
      }
    } catch (err) {
      console.error("Exception updating services:", err);
      alert("Failed to update services");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSendInquiry = async () => {
    if (!labourId || !newInquiry.service_type || !newInquiry.message) {
      alert("Please fill in all required fields");
      return;
    }

    setLoadingAction(true);
    try {
      // Send inquiry to admin instead of manufacturers
      const { error } = await supabase
        .from("labour_contractor_inquiries")
        .insert({
          labour_contractor_id: labourId,
          client_name: "Bhatta Mitra Admin",
          client_phone: "admin@bhattamitra.com",
          service_type: newInquiry.service_type,
          project_description: newInquiry.message,
          budget_range: newInquiry.budget_range,
          status: "pending",
          location:
            `${labourData?.city || ""}, ${labourData?.state || ""}, ${labourData?.country || ""}`
              .trim()
              .replace(/^,\s*|,\s*$/g, ""),
        });

      if (error) {
        console.error("Error sending inquiry:", error);
        alert("Failed to send inquiry to admin");
      } else {
        alert("Inquiry sent to Bhatta Mitra Admin successfully!");
        setNewInquiry({
          service_type: "",
          message: "",
          budget_range: "",
        });
        loadInquiries(labourId);
      }
    } catch (err) {
      console.error("Exception sending inquiry:", err);
      alert("Failed to send inquiry to admin");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateInquiryResponse = async (
    inquiryId: string,
    response: string,
  ) => {
    setLoadingAction(true);
    try {
      const { error } = await supabase
        .from("labour_contractor_inquiries")
        .update({
          response,
          status: "responded",
          response_date: new Date().toISOString(),
        })
        .eq("id", inquiryId);

      if (error) {
        console.error("Error updating inquiry:", error);
        alert("Failed to update inquiry");
      } else {
        alert("Response sent successfully!");
        loadInquiries(labourId!);
      }
    } catch (err) {
      console.error("Exception updating inquiry:", err);
      alert("Failed to update inquiry");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("labourId");
    navigate("/labour-auth");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
        page="labour-dashboard"
      />

      <main className="flex-grow bg-orange-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-orange-800">
              Labour/Contractor Dashboard
            </h1>
            <Button
              variant="outline"
              className="border-hotRed-600 text-hotRed-600 hover:bg-hotRed-50"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <div className="mb-8 bg-orange-100 p-1 rounded-xl border border-orange-200 overflow-x-auto">
              <TabsList className="flex w-full justify-between">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <Settings className="h-3 w-3" />
                  <span>Profile Management</span>
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <DollarSign className="h-3 w-3" />
                  <span>Service Management</span>
                </TabsTrigger>
                <TabsTrigger
                  value="inquiries"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Inquiry Management</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile">
              {labourData && (
                <LabourProfileManagement
                  labourId={labourId!}
                  labourData={labourData}
                  onProfileUpdate={handleProfileUpdate}
                />
              )}
            </TabsContent>

            <TabsContent value="services">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Service Management
                      </span>
                      <Dialog
                        open={serviceDialogOpen}
                        onOpenChange={setServiceDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Manage Services
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </CardTitle>
                    <CardDescription>
                      Manage your service offerings, pricing, and availability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {labourData?.service_types &&
                    labourData.service_types.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {labourData.service_types.map(
                          (service: string, index: number) => (
                            <Card
                              key={index}
                              className="border-l-4 border-l-orange-500"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold">
                                    {service
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l: string) =>
                                        l.toUpperCase(),
                                      )}
                                  </h4>
                                  <div className="flex gap-2">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Remove Service
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to remove this
                                            service? This action cannot be
                                            undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() =>
                                              handleRemoveService(service)
                                            }
                                          >
                                            Remove
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Experience: {labourData.experience_years}{" "}
                                  years
                                </p>
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs text-muted-foreground">
                                    Pricing and detailed service management
                                    coming soon
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          No services added yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Add your first service to start managing your
                          offerings
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inquiries">
              <div className="space-y-6">
                <Card>
                  <CardHeader></CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Contact Bhatta Mitra Admin
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Use this form to send inquiries directly to the Bhatta
                        Mitra Admin team. They will help connect you with
                        potential clients and provide support for your services.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="service_type_inquiry">
                          Service Type <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="service_type_inquiry"
                          value={newInquiry.service_type}
                          onChange={(e) =>
                            setNewInquiry({
                              ...newInquiry,
                              service_type: e.target.value,
                            })
                          }
                          placeholder="e.g., Molders, JCB Driver"
                        />
                      </div>
                      <div>
                        <Label htmlFor="budget_range">
                          Budget Range (Optional)
                        </Label>
                        <Input
                          id="budget_range"
                          value={newInquiry.budget_range}
                          onChange={(e) =>
                            setNewInquiry({
                              ...newInquiry,
                              budget_range: e.target.value,
                            })
                          }
                          placeholder="e.g., ₹10,000 - ₹20,000"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <Label htmlFor="inquiry_message">
                        Message <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="inquiry_message"
                        value={newInquiry.message}
                        onChange={(e) =>
                          setNewInquiry({
                            ...newInquiry,
                            message: e.target.value,
                          })
                        }
                        placeholder="Describe your service offering, availability, and any specific requirements or questions for the admin team"
                        className="min-h-[120px]"
                      />
                    </div>
                    <Button
                      onClick={handleSendInquiry}
                      disabled={loadingAction}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {loadingAction
                        ? "Sending..."
                        : "Send Inquiry to Bhatta Mitra Admin"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Received Inquiries</CardTitle>
                    <CardDescription>
                      Inquiries and requests from manufacturers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {inquiries.length > 0 ? (
                      <div className="space-y-4">
                        {inquiries.map((inquiry) => (
                          <Card
                            key={inquiry.id}
                            className="border-l-4 border-l-blue-500"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">
                                    {inquiry.client_name}
                                  </h4>
                                  <Badge
                                    variant={
                                      inquiry.status === "pending"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {inquiry.status}
                                  </Badge>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(
                                    inquiry.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm mb-2">
                                <strong>Service:</strong> {inquiry.service_type}
                              </p>
                              <p className="text-sm mb-2">
                                <strong>Contact:</strong> {inquiry.client_phone}
                              </p>
                              {inquiry.budget_range && (
                                <p className="text-sm mb-2">
                                  <strong>Budget:</strong>{" "}
                                  {inquiry.budget_range}
                                </p>
                              )}
                              <p className="text-sm mb-3">
                                <strong>Description:</strong>{" "}
                                {inquiry.project_description}
                              </p>
                              {inquiry.response && (
                                <div className="bg-green-50 p-3 rounded-md mb-3">
                                  <p className="text-sm">
                                    <strong>Your Response:</strong>{" "}
                                    {inquiry.response}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Responded on:{" "}
                                    {new Date(
                                      inquiry.response_date,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              )}
                              {inquiry.status === "pending" && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-orange-600 hover:bg-orange-700"
                                    >
                                      <MessageSquare className="h-3 w-3 mr-2" />
                                      Respond
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Respond to Inquiry
                                      </DialogTitle>
                                      <DialogDescription>
                                        Send your response to{" "}
                                        {inquiry.client_name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                      placeholder="Type your response here..."
                                      className="min-h-[100px]"
                                      id={`response-${inquiry.id}`}
                                    />
                                    <DialogFooter>
                                      <Button
                                        onClick={() => {
                                          const textarea =
                                            document.getElementById(
                                              `response-${inquiry.id}`,
                                            ) as HTMLTextAreaElement;
                                          if (textarea?.value.trim()) {
                                            handleUpdateInquiryResponse(
                                              inquiry.id,
                                              textarea.value,
                                            );
                                          } else {
                                            alert("Please enter a response");
                                          }
                                        }}
                                        disabled={loadingAction}
                                        className="bg-orange-600 hover:bg-orange-700"
                                      >
                                        {loadingAction
                                          ? "Sending..."
                                          : "Send Response"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          No inquiries received yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Manufacturer inquiries will appear here when they
                          contact you
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Service Management Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            style={{ display: "none" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Services
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Services</DialogTitle>
            <DialogDescription>
              Add or remove services from your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-4 block">
                Available Services
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: "molders", label: "Molders (Pather)" },
                  {
                    value: "green_brick_movers",
                    label: "Green Brick Movers (Kacchi Bharai)",
                  },
                  { value: "stackers", label: "Stackers (Beldaar)" },
                  { value: "insulation", label: "Insulation (Raabis)" },
                  {
                    value: "coal_loading",
                    label: "Coal Loading (Coal Dhulai)",
                  },
                  { value: "firemen", label: "Firemen (Jalai)" },
                  {
                    value: "withdrawers",
                    label: "Withdrawers (Nikaasi)",
                  },
                  { value: "jcb_driver", label: "JCB Driver" },
                  { value: "tractor_driver", label: "Tractor Driver" },
                  { value: "manager", label: "Manager" },
                  { value: "welder", label: "Welder" },
                  { value: "general_labour", label: "General Labour" },
                ].map((service) => {
                  const currentServiceTypes = labourData?.service_types || [];
                  const isSelected = currentServiceTypes.includes(
                    service.value,
                  );
                  return (
                    <div
                      key={service.value}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        isSelected
                          ? "bg-orange-50 border-orange-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleAddService(service.value);
                            } else {
                              handleRemoveService(service.value);
                            }
                          }}
                        />
                        <Label className="text-sm font-normal cursor-pointer">
                          {service.label}
                        </Label>
                      </div>
                      {isSelected && (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-800"
                        >
                          Selected
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setServiceDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
      />
    </div>
  );
};

export default LabourDashboard;
