import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react";
import { PageMeta } from "~/components";
import { APP_NAME } from "~/utils";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <>
      <PageMeta title={`Don't worry - ${APP_NAME}`} />
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 p-4">
        <div
          className={`w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden transition-all duration-700 ${
            animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-50 rounded-full -translate-x-1/2 -translate-y-1/2 z-0"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gray-50 rounded-full translate-x-1/2 translate-y-1/2 z-0"></div>

          <div className="flex flex-col items-center justify-center text-center relative z-10">
            {/* Alert Animation */}
            <div
              className={`mb-6 transition-all duration-1000 ${
                animate ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 bg-red-100 rounded-full animate-pulse"></div>
                <AlertCircle
                  size={64}
                  className="text-red-500 relative z-10"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Error Message */}
            <h1
              className={`text-3xl font-bold text-gray-800 mb-3 transition-all duration-700 delay-300 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              Payment Unsuccessful
            </h1>

            <p
              className={`text-gray-600 mb-6 max-w-md transition-all duration-700 delay-500 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              We encountered an issue processing your donation. Don't worry - no
              charges were made to your account.
            </p>

            {/* Error Information */}
            <div
              className={`w-full bg-red-50 rounded-xl p-5 mb-8 transition-all duration-700 delay-700 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="flex items-start text-left">
                <div className="flex-shrink-0 mr-3">
                  <HelpCircle size={20} className="text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">
                    Common reasons for failure:
                  </p>
                  <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                    <li>Insufficient funds in your account</li>
                    <li>Card expiration date incorrect</li>
                    <li>Temporary connection issue</li>
                    <li>Bank declined the transaction</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 w-full max-w-sm transition-all duration-700 delay-900 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <a
                href="#"
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center group"
              >
                <RefreshCw
                  size={18}
                  className="mr-2 transition-transform duration-300 group-hover:rotate-90"
                />
                Try Again
              </a>
              <a
                href="#"
                className="flex-1 py-3 px-6 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition duration-200 flex items-center justify-center"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Home
              </a>
            </div>

            {/* Support info */}
            <div
              className={`mt-8 text-gray-500 transition-all duration-700 delay-1100 ${
                animate ? "opacity-100" : "opacity-0"
              }`}
            >
              <p>
                Need assistance?{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;
