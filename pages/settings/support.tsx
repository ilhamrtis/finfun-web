import React, { useState } from "react";
import { useRouter } from "next/router";
import NewNavbar from "../../components/NewNavbar";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I create an account?",
    answer:
      "You can create an account by clicking the 'Sign Up' button on the homepage and following the steps.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Click on 'Forgot Password' at the login screen, and we'll send instructions to your registered email address.",
  },
  {
    question: "What if I encounter a bug?",
    answer:
      "Use the contact form below to let us know about the issue. Please include steps to reproduce the bug and any screenshots that could help.",
  },
];

export default function SupportPage() {
  const router = useRouter();

  // Simple form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Optional: handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you'd call an API endpoint to handle or store the support message
    // e.g. await fetch("/api/support", { method: "POST", body: JSON.stringify({ name, email, message }) })

    alert("Support request submitted!");
    setName("");
    setEmail("");
    setMessage("");
  };

  // Toggle FAQ expand/collapse
  const handleToggleFAQ = (index: number) => {
    setFaqOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Title Bar */}
      <div className="flex items-center justify-between p-4 bg-white shadow">
      <button onClick={() => router.back()} className="text-xl text-gray-700">
            <img src="/images/icons/left.svg" alt="Arrow left" className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-semibold">Support Center</h1>
        <div></div>
      </div>

      <div className="p-4 flex-1">
        {/* FAQ Section */}
        <div className="mb-8 bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          {FAQ_DATA.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 pb-3 mb-3">
              <button
                onClick={() => handleToggleFAQ(index)}
                className="w-full text-left focus:outline-none"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{faq.question}</span>
                  <span className="ml-2 text-gray-500">
                    {faqOpenIndex === index ? "-" : "+"}
                  </span>
                </div>
              </button>
              {faqOpenIndex === index && (
                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Still Need Help?</h2>
          <p className="text-sm text-gray-500 mb-4">
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={4}
                placeholder="Describe your issue or question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
      <div className="mb-12"></div>
      <NewNavbar />
    </div>
  );
}
