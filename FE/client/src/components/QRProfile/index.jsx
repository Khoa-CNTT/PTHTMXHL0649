import React, { useState, useEffect } from "react";
import * as UserService from "~/services/UserService";
import CustomModal from "~/components/CustomModal";
import { useQuery } from "@tanstack/react-query";

const QRProfile = ({ open, onClose }) => {
  const fetchQR = async () => {
    const blob = await UserService.getQrUser();
    const url = URL.createObjectURL(blob);
    return url;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["qr"],
    queryFn: fetchQR,
    enabled: open,
  });

  useEffect(() => {
    return () => {
      if (data) URL.revokeObjectURL(data);
    };
  }, [data]);

  return (
    <CustomModal isOpen={open} onClose={onClose}>
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your Personal QR Code
        </h2>

        <div className="relative">
          {isLoading ? (
            <div className="w-64 h-64 bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              <div className="w-64 h-64 p-3 bg-white rounded-lg shadow-lg overflow-hidden">
                {data && (
                  <img
                    src={data}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            Scan this code to share your profile instantly
          </p>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (data) {
                  const link = document.createElement("a");
                  link.href = data;
                  link.download = "my-qr-code.png";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition duration-200"
              disabled={!data}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default QRProfile;
