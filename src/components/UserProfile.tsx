import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, type EndCustomer } from "@/services/userService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Pencil, ArrowLeft, Loader2 } from "lucide-react";

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<EndCustomer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleBackToDashboard = () => {
    navigate("/end-user-dashboard");
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-redFiredMustard-50 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-hotRed-600" />
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-redFiredMustard-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <Button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-redFiredMustard-50 p-4">
      <div className="container mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={handleBackToDashboard}
          className="mb-4 flex items-center gap-2 hover:bg-redFiredMustard-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-hotRed-700">
              User Profile
            </CardTitle>
            <CardDescription>View your account information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {userProfile && (
              <>
                <div>
                  <h3 className="text-lg font-medium text-gray-700">
                    Personal Information
                  </h3>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">
                        {userProfile.name || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">
                        {userProfile.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">
                        {userProfile.company_name || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">GST Details</p>
                      <p className="font-medium">
                        {userProfile.gst_details || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700">
                    Location
                  </h3>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="font-medium">
                        {userProfile.country || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium">
                        {userProfile.state || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">District</p>
                      <p className="font-medium">
                        {userProfile.district || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">
                        {userProfile.city || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PIN Code</p>
                      <p className="font-medium">
                        {userProfile.pin_code || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter>
            <Button
              onClick={handleEditProfile}
              className="bg-hotRed-600 hover:bg-hotRed-700 flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
