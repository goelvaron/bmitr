import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { checkAdminAccess } from "@/services/authService";

const AdminLink = () => {
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // Check if current session has admin privileges
      const adminToken = localStorage.getItem("admin_session_token");
      const adminExpiry = localStorage.getItem("admin_session_expiry");

      if (adminToken && adminExpiry) {
        const expiry = parseInt(adminExpiry);
        if (Date.now() < expiry) {
          setIsAdminUser(true);
        }
      }

      // Additional check could be added here for specific admin emails
      // This is a basic implementation - in production, you might want
      // to check against a more sophisticated user management system
    } catch (error) {
      console.error("Admin status check failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Don't render the admin link for non-admin users
  if (isChecking) {
    return null; // Or a loading spinner
  }

  // Only show admin link if user has admin session or for development
  const showAdminLink = isAdminUser || import.meta.env.DEV;

  if (!showAdminLink) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      asChild
      title={
        isAdminUser ? "Admin Dashboard (Authenticated)" : "Admin Dashboard"
      }
      className={isAdminUser ? "border-green-500 text-green-600" : ""}
    >
      <Link to="/admin">
        {isAdminUser ? (
          <Shield className="h-4 w-4" />
        ) : (
          <Settings className="h-4 w-4" />
        )}
      </Link>
    </Button>
  );
};

export default AdminLink;
