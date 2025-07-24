import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserProfile,
  updateUserProfile,
  type EndCustomer,
} from "@/services/userService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  indianStatesDistricts,
  getDistrictsByState,
} from "@/data/indian_states_districts";

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<EndCustomer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    company_name: string;
    gst_details: string;
    country: string;
    state: string;
    district: string;
    city: string;
    pin_code: string;
  }>({
    name: "",
    email: "",
    company_name: "",
    gst_details: "",
    country: "",
    state: "",
    district: "",
    city: "",
    pin_code: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get customer ID from localStorage
        const customerId = localStorage.getItem("customerId");

        if (!customerId) {
          setError("User not authenticated");
          navigate("/e-ent-market");
          return;
        }

        const { success, data, message } = await getUserProfile(customerId);

        if (!success || !data) {
          setError(message || "Failed to fetch profile");
          return;
        }

        setUserProfile(data);

        // Initialize form data with user profile data
        setFormData({
          name: data.name || "",
          email: data.email || "",
          company_name: data.company_name || "",
          gst_details: data.gst_details || "",
          country: data.country || "",
          state: data.state || "",
          district: data.district || "",
          city: data.city || "",
          pin_code: data.pin_code || "",
        });

        // Set available districts if state is selected and country is India
        if (data.state && data.country === "India") {
          setAvailableDistricts(getDistrictsByState(data.state));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Update available districts when state changes
  useEffect(() => {
    if (formData.state && formData.country === "India") {
      setAvailableDistricts(getDistrictsByState(formData.state));
    }
  }, [formData.state, formData.country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset district when state changes
    if (name === "state") {
      setFormData((prev) => ({ ...prev, district: "" }));
    }
  };

  const handleBackToProfile = () => {
    navigate("/profile");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log("Submitting form with data:", formData);
    setIsSaving(true);
    setError(null);

    try {
      const customerId = localStorage.getItem("customerId");
      if (!customerId) {
        setError("User not authenticated");
        navigate("/e-ent-market");
        return;
      }

      const { success, message } = await updateUserProfile(
        customerId,
        formData,
      );

      if (!success) {
        setError(message);
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
        return;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Navigate back to profile view
      navigate("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating your profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-hotRed-600" />
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-orange-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button
            onClick={handleBackToProfile}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-orange-50 p-4">
      <div className="container mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={handleBackToProfile}
          className="mb-4 flex items-center gap-2 hover:bg-orange-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Button>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-hotRed-700">
              Edit Profile
            </CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Personal Information
                </h3>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      placeholder="Your company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gst_details">GST Details</Label>
                    <Input
                      id="gst_details"
                      name="gst_details"
                      value={formData.gst_details}
                      onChange={handleInputChange}
                      placeholder="GST number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700">Location</h3>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        handleSelectChange("country", value)
                      }
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Nepal">Nepal</SelectItem>
                        <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    {formData.country === "India" ? (
                      <Select
                        value={formData.state}
                        onValueChange={(value) =>
                          handleSelectChange("state", value)
                        }
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(indianStatesDistricts).map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Your state/province"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">Address District</Label>
                    {formData.country === "India" ? (
                      <Select
                        value={formData.district}
                        onValueChange={(value) =>
                          handleSelectChange("district", value)
                        }
                        disabled={!formData.state}
                      >
                        <SelectTrigger id="district">
                          <SelectValue placeholder="Select address district" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        placeholder="Your address district"
                      />
                    )}
                    <p className="text-sm text-gray-500">
                      Select the district where your address is located
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Your city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin_code">PIN Code</Label>
                    <Input
                      id="pin_code"
                      name="pin_code"
                      value={formData.pin_code}
                      onChange={handleInputChange}
                      placeholder="PIN code"
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToProfile}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-hotRed-600 hover:bg-hotRed-700 flex items-center gap-2"
                disabled={isSaving}
                onClick={handleSubmit}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
