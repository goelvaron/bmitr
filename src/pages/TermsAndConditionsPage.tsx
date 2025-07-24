import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsAndConditionsPage: React.FC = () => {
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
            Terms & Conditions - Bhatta Mitra
          </h1>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Welcome to Bhatta Mitra (&quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;), Before start using our platform, it is important
              that you read and understand our terms and conditions. By
              accessing or using our websites, mobile applications, or any of
              our services (collectively, the &quot;Platform&quot;), you agree
              to comply with and be bound by these Terms and Conditions.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                1. Use of the Platform
              </h2>
              <p>
                Bhatta Mitra is a digital ecosystem created for the brick kiln
                industry, connecting manufacturers, buyers, transporters, labour
                contractors, and other related service providers. Users agree to
                access and use the Platform solely for legitimate and lawful
                purposes, and in compliance with these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                2. Eligibility
              </h2>
              <p>
                Use of the Platform is restricted to individuals or
                organizations that:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Are at least 18 years old</li>
                <li>Are legally permitted to enter into binding agreements</li>
                <li>
                  Are active participants in the brick kiln and construction
                  ecosystem
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                3. User Accounts
              </h2>
              <p>
                Users may need to create an account to access certain features.
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Ensuring the information you provide is true and up to date
                </li>
                <li>Keeping your login credentials secure</li>
                <li>Any activity carried out under your account</li>
              </ul>
              <p className="mt-3">
                Bhatta Mitra reserves the right to disable or terminate accounts
                in case of misuse or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                4. Services Offered
              </h2>
              <p>Bhatta Mitra provides a platform for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Ordering bricks directly from local kilns</li>
                <li>
                  Listing and finding services like labour, transport, raw
                  materials, etc.
                </li>
                <li>Posting and responding to business inquiries and offers</li>
                <li>
                  Participating in exclusive features (subject to eligibility or
                  selection)
                </li>
              </ul>
              <p className="mt-3">
                Some features may be offered free of charge, while others may be
                paid or accessible by invitation only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                5. Content & Conduct
              </h2>
              <p>
                Users may post content, including business profiles, offers, or
                service listings. You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Share false, misleading, or illegal content</li>
                <li>Violate the rights or privacy of others</li>
                <li>Engage in spam, abuse, or harmful activity</li>
              </ul>
              <p className="mt-3">
                We reserve the right to remove content or take action against
                users who breach these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                6. Payments and Transactions
              </h2>
              <p>Where monetary transactions occur through the platform:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Users agree to conduct them in good faith and compliance with
                  the law
                </li>
                <li>
                  Bhatta Mitra is not responsible for off-platform agreements or
                  payments
                </li>
                <li>
                  Any disputes must be reported promptly through our official
                  support channels
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                7. Intellectual Property
              </h2>
              <p>
                All rights to the design, content, logos, and underlying
                technology of Bhatta Mitra are owned by us or our licensors. You
                may not copy, reuse, or distribute any part of the Platform
                without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                8. Indemnification
              </h2>
              <p>
                You agree to indemnify and hold Bhatta Mitra and its affiliates,
                officers, agents, and employees harmless from any claims,
                losses, damages, liabilities, and expenses, including reasonable
                attorneys' fees, arising out of your use of Bhatta Mitra, your
                violation of these Terms and Conditions, or your violation of
                any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                9. Limitation of Liability
              </h2>
              <p>
                Bhatta Mitra is not liable for any damages arising out of or in
                connection with your use of the Platform, including but not
                limited to direct, indirect, incidental, punitive, and
                consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                10. Modification
              </h2>
              <p>
                We reserve the right to modify these Terms and Conditions at any
                time. Any changes will be effective immediately upon posting on
                the Bhatta Mitra Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                11. Governing Law
              </h2>
              <p>
                These Terms and Conditions are governed by and construed in
                accordance with the laws of India. Any dispute arising out of or
                in connection with these Terms and Conditions will be subject to
                the exclusive jurisdiction of the courts of India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-redFiredMustard-700 mb-3">
                12. Contact Information
              </h2>
              <p>
                If you have any questions or concerns regarding these Terms and
                Conditions, please reach out to us:
              </p>
              <p className="mt-3">📧 Email: customervoice@bhattamitra.in</p>
              <p className="mt-6 font-semibold text-redFiredMustard-700">
                Effective Date: 15 July 2025
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
