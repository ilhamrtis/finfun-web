import React from "react";
import NewNavbar from "../../components/NewNavbar";
import { useRouter } from "next/router";

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-xl text-gray-700">
            <img src="/images/icons/left.svg" alt="Arrow left" className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold">Legal & Privacy</h1>
        <div />
      </div>

      <main className="flex-1 p-4">
        {/* Terms of Service Section */}
        <section className="bg-white p-4 mb-8 rounded-md shadow">
          <h2 className="text-lg font-bold mb-2">Terms of Service</h2>
          <p className="text-sm text-gray-600 mb-4">
            These Terms of Service (&quot;Terms&quot;) govern your use of our
            website, products, and services (&quot;Services&quot;). By using
            the Services, you agree to be bound by these Terms. If you do not
            agree, do not use the Services.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>
              <strong>Eligibility:</strong> You must be at least 18 years old
              (or the age of majority in your jurisdiction) to use our Services.
            </li>
            <li>
              <strong>Account Responsibility:</strong> You are responsible for
              maintaining the confidentiality of your login credentials.
            </li>
            <li>
              <strong>Prohibited Conduct:</strong> You agree not to misuse our
              Services, violate any laws, or infringe on third-party rights.
            </li>
            <li>
              <strong>Termination:</strong> We reserve the right to suspend or
              terminate your access to the Services at our discretion.
            </li>
            {/* Add more terms as needed */}
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            For the full Terms of Service, please contact our support team or
            review any additional documentation provided on our platform.
          </p>
        </section>

        {/* Privacy Policy Section */}
        <section className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-bold mb-2">Privacy Policy</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your privacy is important to us. This Privacy Policy explains how we
            collect, use, and share your personal information when you use our
            Services.
          </p>
          <ul className="list-decimal list-inside text-sm text-gray-600 space-y-2">
            <li>
              <strong>Information We Collect:</strong> We may collect
              information such as your name, email address, and usage data.
            </li>
            <li>
              <strong>How We Use Information:</strong> We use the data we
              collect to provide, maintain, and improve our Services.
            </li>
            <li>
              <strong>Sharing and Disclosure:</strong> We do not share your
              personal information with third parties except as required by law
              or to provide our Services.
            </li>
            <li>
              <strong>Security:</strong> We take reasonable measures to protect
              your information but cannot guarantee absolute security.
            </li>
            {/* Add more privacy points as needed */}
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            For more details about our data practices, please contact us at
            help[at]finfun[dot]xyz or visit our detailed Privacy Policy page.
          </p>
        </section>
      </main>
      <div className="mb-12"></div>
      {/* Footer (Navbar or other components) */}
      <NewNavbar />
    </div>
  );
}
