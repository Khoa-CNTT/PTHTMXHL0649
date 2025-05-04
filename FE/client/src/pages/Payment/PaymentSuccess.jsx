import React, { useEffect, useState } from "react";
import { Heart, Send, ArrowRight } from "lucide-react";
import { PageMeta } from "~/components";
import { APP_NAME } from "~/utils";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PaymentSuccess = () => {
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  return (
    <>
      <PageMeta title={`Thank you - ${APP_NAME}`} />
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50 p-4">
        <div
          className={`w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden transition-all duration-700 ${
            animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-rose-50 rounded-full -translate-x-1/2 -translate-y-1/2 z-0"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-50 rounded-full translate-x-1/2 translate-y-1/2 z-0"></div>

          <div className="flex flex-col items-center justify-center text-center relative z-10">
            {/* Heart Animation */}
            <div
              className={`mb-6 transition-all duration-1000 ${
                animate ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 bg-rose-100 rounded-full animate-pulse"></div>
                <Heart
                  size={64}
                  fill="#f43f5e"
                  className="text-rose-500 relative z-10"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Gratitude Message */}
            <h1
              className={`text-4xl font-bold text-gray-800 mb-3 transition-all duration-700 delay-300 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              Thank You for Your Kindness!
            </h1>

            <p
              className={`text-gray-600 mb-6 max-w-md transition-all duration-700 delay-500 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              Your generous donation will make a real difference in the lives of
              those we serve. Together, we're creating positive change in our
              community.
            </p>

            {/* Impact Visualization */}
            <div
              className={`w-full bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl p-5 mb-8 transition-all duration-700 delay-700 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-1">
                    Your Impact
                  </p>
                  <p className="text-lg font-medium mb-3 text-gray-700">
                    You've helped us reach our goal!
                  </p>
                  <div className="flex space-x-2 justify-center">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          animate
                            ? "bg-rose-500 scale-100"
                            : "bg-rose-200 scale-0"
                        }`}
                        style={{ transitionDelay: `${800 + index * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Email notification */}
            <div
              className={`flex items-center justify-center mb-8 text-gray-600 transition-all duration-700 delay-900 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="bg-amber-50 rounded-full p-3 mr-4">
                <Send
                  size={20}
                  className={`transition-all duration-1000 ${
                    animate ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
              <div className="text-left">
                <p className="font-medium">Receipt Coming Soon</p>
                <p className="text-sm text-gray-500">
                  A donation receipt will be sent to your email
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 w-full max-w-sm transition-all duration-700 delay-1000 ${
                animate
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <span
                onClick={() => navigate("/fundraisers")}
                className="flex-1 cursor-pointer py-3 px-6 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center group"
              >
                See Your Impact
                <ArrowRight
                  size={18}
                  className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
              <span
                onClick={() => navigate("/")}
                className="flex-1 py-3 cursor-pointer px-6 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition duration-200"
              >
                Return Home
              </span>
            </div>

            {/* Inspirational quote */}
            <div
              className={`mt-8 text-gray-500 italic transition-all duration-700 delay-1200 ${
                animate ? "opacity-100" : "opacity-0"
              }`}
            >
              <p>"Alone we can do so little; together we can do so much."</p>
              <p className="text-sm mt-1">— Helen Keller</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
