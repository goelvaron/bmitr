import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={handleBack}
          variant="outline"
          className="mb-6 flex items-center gap-2 hover:bg-redFiredMustard-50 border-redFiredMustard-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-redFiredMustard-800 mb-8">
            Privacy Policy for Bhatta Mitra
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-redFiredMustard-700 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Bhatta Mitra ("we," "our," or "us"), your privacy matters. This
              Privacy Policy explains how we collect, use, and share your
              information when you use our platform — whether through our
              website, mobile app, or any related services. We are committed to
              handling your personal data responsibly and transparently.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-redFiredMustard-700 mb-4">
              What Information We Collect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To provide and improve our services, we may collect the following
              types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Personal Details:</strong> Such as your name, mobile
                number, email address, and location, Aadhaar or PAN (where
                required for verification/KYC).
              </li>
              <li>
                <strong>Business Information:</strong> Including brick kiln
                name, address, and operational details, GST Details and other
                Licenses.
              </li>
              <li>
                <strong>Usage Data:</strong> Such as your device type, IP
                address, and how you interact with our platform.
              </li>
              <li>
                <strong>Other Sources:</strong> If you link social media or
                third-party accounts, we may receive related data as permitted
                by those platforms.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-redFiredMustard-700 mb-4">
              How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The information we collect is used to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Deliver and improve the functionality of our services</li>
              <li>
                Connect brick buyers with manufacturers and service providers
              </li>
              <li>Personalize your experience on the platform</li>
              <li>
                Send important updates, service notifications, or promotional
                content
              </li>
              <li>Meet legal or regulatory obligations</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We only use your data for legitimate business purposes and never
              for anything irrelevant to your use of the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-redFiredMustard-700 mb-4">
              When We Share Your Data
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                Trusted service providers who help us with platform operations
                (e.g., hosting, support, payments)
              </li>
              <li>
                Other users (e.g., basic business details for trade
                facilitation)
              </li>
              <li>To comply with the Legal requirements</li>
              <li>
                Partners, in cases where collaboration is needed to fulfill your
                requests
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              All third parties are bound to protect your data and use it only
              for agreed purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-redFiredMustard-700 mb-4">
              Data Security Measures
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We take strong precautions to protect your data using modern
              security tools and protocols. While no system is foolproof, we
              regularly review our practices to keep your information safe from
              unauthorized access or misuse.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-redFiredMustard-700 mb-4">
              Your Rights
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You can request to view, update, or delete your personal data at
              any time. Simply reach out to us via the contact information
              below, and we'll assist you in accordance with applicable data
              protection laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-redFiredMustard-700 mb-4">
              Policy Updates
            </h2>
            <p className="text-gray-700 leading-relaxed">
              As our platform grows and evolves, this Privacy Policy may be
              updated from time to time. We'll post any changes here, and for
              significant updates, we may notify you directly. Continued use of
              our services means you agree to the revised policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-redFiredMustard-700 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              If you have questions, concerns, or requests related to this
              Privacy Policy, please contact:
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Email:</strong> customervoice@bhattamitra.com
            </p>
            <p className="text-gray-700 leading-relaxed mt-6 text-sm">
              <strong>Last Updated:</strong> 15 July 2025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
