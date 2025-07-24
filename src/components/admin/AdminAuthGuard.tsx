import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import {
  checkAdminAccess,
  requestAdminEmailOtp,
  verifyAdminEmailOtp,
  requestAdminPhoneOtp,
  verifyAdminPhoneOtp,
} from "@/services/authService";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthDialog, setShowAuthDialog] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<"email" | "email_otp" | "phone_otp">(
    "email",
  );
  const [email, setEmail] = useState<string>("");
  const [emailOtp, setEmailOtp] = useState<string>("");
  const [phoneOtp, setPhoneOtp] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState<number>(0);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Security constants
  const MAX_ATTEMPTS = 3;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
  const ADMIN_EMAIL = "bhattamitra@protonmail.com";
  const ADMIN_PHONE = "+918008009560";

  useEffect(() => {
    checkAuthStatus();

    // Set up session timeout
    const sessionInterval = setInterval(() => {
      checkSessionValidity();
    }, 60000); // Check every minute

    return () => clearInterval(sessionInterval);
  }, []);

  useEffect(() => {
    if (isBlocked && blockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1000) {
            setIsBlocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTimeRemaining]);

  const checkAuthStatus = async () => {
    try {
      const storedToken = localStorage.getItem("admin_session_token");
      const storedExpiry = localStorage.getItem("admin_session_expiry");
      const storedAttempts = localStorage.getItem("admin_auth_attempts");
      const storedBlockTime = localStorage.getItem("admin_block_time");

      // Check if user is blocked
      if (storedBlockTime) {
        const blockTime = parseInt(storedBlockTime);
        const now = Date.now();
        if (now < blockTime) {
          setIsBlocked(true);
          setBlockTimeRemaining(blockTime - now);
          setIsLoading(false);
          return;
        } else {
          localStorage.removeItem("admin_block_time");
          localStorage.removeItem("admin_auth_attempts");
        }
      }

      // Set attempts from storage
      if (storedAttempts) {
        setAttempts(parseInt(storedAttempts));
      }

      // Check session validity
      if (storedToken && storedExpiry) {
        const expiry = parseInt(storedExpiry);
        if (Date.now() < expiry) {
          // Verify token with backend
          const isValid = await verifySessionToken(storedToken);
          if (isValid) {
            setSessionToken(storedToken);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        }
        // Clear invalid session
        clearSession();
      }

      setShowAuthDialog(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Auth status check failed:", error);
      setShowAuthDialog(true);
      setIsLoading(false);
    }
  };

  const checkSessionValidity = async () => {
    const storedExpiry = localStorage.getItem("admin_session_expiry");
    if (storedExpiry && Date.now() >= parseInt(storedExpiry)) {
      handleLogout();
    }
  };

  const verifySessionToken = async (token: string): Promise<boolean> => {
    try {
      // Verify token format and timestamp
      const [timestamp, hash] = token.split(".");
      if (!timestamp || !hash) return false;

      const tokenTime = parseInt(timestamp);
      if (Date.now() - tokenTime > SESSION_DURATION) return false;

      // Additional server-side verification could be added here
      return true;
    } catch {
      return false;
    }
  };

  const generateSessionToken = (): string => {
    const timestamp = Date.now().toString();
    const randomData = Math.random().toString(36).substring(2);
    const hash = btoa(`${timestamp}.${randomData}.admin_session`).replace(
      /[^a-zA-Z0-9]/g,
      "",
    );
    return `${timestamp}.${hash}`;
  };

  const handleEmailSubmit = async () => {
    if (isBlocked) return;

    setError(null);

    // Validate email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError(
        `Access denied. Only ${ADMIN_EMAIL} is authorized for admin access.`,
      );
      incrementAttempts();
      return;
    }

    // Request email OTP
    try {
      const result = await requestAdminEmailOtp(email);
      if (result.success) {
        setAuthStep("email_otp");
      } else {
        setError(
          result.message || "Failed to send email OTP. Please try again.",
        );
        incrementAttempts();
      }
    } catch (error) {
      setError("Email OTP service unavailable. Please try again later.");
      incrementAttempts();
    }
  };

  const handleEmailOtpSubmit = async () => {
    if (isBlocked) return;

    setError(null);

    try {
      const result = await verifyAdminEmailOtp(email, emailOtp);
      if (result.success) {
        // Request phone OTP after email OTP is verified
        const phoneResult = await requestAdminPhoneOtp(ADMIN_PHONE);
        if (phoneResult.success) {
          setAuthStep("phone_otp");
        } else {
          setError(
            phoneResult.message ||
              "Failed to send phone OTP. Please try again.",
          );
          incrementAttempts();
        }
      } else {
        setError(result.message || "Invalid email OTP. Please try again.");
        incrementAttempts();
      }
    } catch (error) {
      setError("Email OTP verification failed. Please try again.");
      incrementAttempts();
    }
  };

  const handlePhoneOtpSubmit = async () => {
    if (isBlocked) return;

    setError(null);

    try {
      const result = await verifyAdminPhoneOtp(ADMIN_PHONE, phoneOtp);
      if (result.success) {
        // Generate session token
        const token = generateSessionToken();
        const expiry = Date.now() + SESSION_DURATION;

        // Store session
        localStorage.setItem("admin_session_token", token);
        localStorage.setItem("admin_session_expiry", expiry.toString());
        localStorage.removeItem("admin_auth_attempts");
        localStorage.removeItem("admin_block_time");

        setSessionToken(token);
        setIsAuthenticated(true);
        setShowAuthDialog(false);
        setAttempts(0);

        // Log successful admin access
        logAdminAccess(email, "SUCCESS");
      } else {
        setError(result.message || "Invalid phone OTP. Please try again.");
        incrementAttempts();
      }
    } catch (error) {
      setError("Phone OTP verification failed. Please try again.");
      incrementAttempts();
    }
  };

  const incrementAttempts = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem("admin_auth_attempts", newAttempts.toString());

    if (newAttempts >= MAX_ATTEMPTS) {
      const blockUntil = Date.now() + BLOCK_DURATION;
      setIsBlocked(true);
      setBlockTimeRemaining(BLOCK_DURATION);
      localStorage.setItem("admin_block_time", blockUntil.toString());

      // Log security incident
      logAdminAccess(email || "unknown", "BLOCKED");
    }
  };

  const logAdminAccess = async (email: string, status: string) => {
    try {
      await supabase.from("admin_access_logs").insert({
        email,
        status,
        ip_address: "unknown", // Could be enhanced with IP detection
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log admin access:", error);
    }
  };

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setShowAuthDialog(true);
    setAuthStep("email");
    setEmail("");
    setEmailOtp("");
    setPhoneOtp("");
    setError(null);
  };

  const clearSession = () => {
    localStorage.removeItem("admin_session_token");
    localStorage.removeItem("admin_session_expiry");
    setSessionToken(null);
  };

  const resetAuth = () => {
    setAuthStep("email");
    setEmail("");
    setEmailOtp("");
    setPhoneOtp("");
    setError(null);
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="relative">
        {/* Admin Session Indicator */}
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Shield className="h-4 w-4" />
                <span>Admin Session Active</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="h-6 px-2 text-xs"
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Dialog open={showAuthDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Admin Authentication Required
            </DialogTitle>
            <DialogDescription>
              This area requires administrator privileges. Multiple security
              layers must be verified.
            </DialogDescription>
          </DialogHeader>

          {isBlocked ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Access blocked due to multiple failed attempts. Please wait{" "}
                  {formatTime(blockTimeRemaining)} before trying again.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    authStep === "email"
                      ? "bg-blue-500"
                      : ["email_otp", "phone_otp"].includes(authStep)
                        ? "bg-green-500"
                        : "bg-gray-300"
                  }`}
                />
                <div
                  className={`w-3 h-3 rounded-full ${
                    authStep === "email_otp"
                      ? "bg-blue-500"
                      : authStep === "phone_otp"
                        ? "bg-green-500"
                        : "bg-gray-300"
                  }`}
                />
                <div
                  className={`w-3 h-3 rounded-full ${
                    authStep === "phone_otp" ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {attempts > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Warning: {attempts}/{MAX_ATTEMPTS} failed attempts. Account
                    will be temporarily blocked after {MAX_ATTEMPTS} failures.
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Step */}
              {authStep === "email" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Administrator Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="bhattamitra@protonmail.com"
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Only{" "}
                      <span className="font-mono font-semibold">
                        bhattamitra@protonmail.com
                      </span>{" "}
                      is authorized for admin access
                    </p>
                  </div>
                  <Button
                    onClick={handleEmailSubmit}
                    className="w-full"
                    disabled={!email || isBlocked}
                  >
                    Verify Email
                  </Button>
                </div>
              )}

              {/* Email OTP Step */}
              {authStep === "email_otp" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailOtp">Email Verification Code</Label>
                    <Input
                      id="emailOtp"
                      type="text"
                      value={emailOtp}
                      onChange={(e) =>
                        setEmailOtp(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="Enter 6-digit code from email"
                      className="w-full text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Check your email at{" "}
                      <span className="font-mono font-semibold">
                        {ADMIN_EMAIL}
                      </span>{" "}
                      for the verification code
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={resetAuth}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleEmailOtpSubmit}
                      className="flex-1"
                      disabled={emailOtp.length !== 6 || isBlocked}
                    >
                      Verify Email Code
                    </Button>
                  </div>
                </div>
              )}

              {/* Phone OTP Step */}
              {authStep === "phone_otp" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneOtp">Phone Verification Code</Label>
                    <Input
                      id="phoneOtp"
                      type="text"
                      value={phoneOtp}
                      onChange={(e) =>
                        setPhoneOtp(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="Enter 6-digit SMS code"
                      className="w-full text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Check your phone{" "}
                      <span className="font-mono font-semibold">
                        {ADMIN_PHONE}
                      </span>{" "}
                      for the SMS verification code
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={resetAuth}
                      className="flex-1"
                    >
                      Start Over
                    </Button>
                    <Button
                      onClick={handlePhoneOtpSubmit}
                      className="flex-1"
                      disabled={phoneOtp.length !== 6 || isBlocked}
                    >
                      Verify Phone Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuthGuard;
