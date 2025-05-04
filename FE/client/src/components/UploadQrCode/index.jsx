import React, { useState, useRef, useEffect } from "react";
import CustomModal from "~/components/CustomModal";
import { Upload, X, CheckCircle, Camera, Users, QrCode } from "lucide-react";
import * as QrService from "~/services/QrService";

const UploadQrCode = ({ open, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanningMode, setScanningMode] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [friendData, setFriendData] = useState(null);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let animationFrame;
    let jsQR;

    async function setupScanner() {
      if (scanningMode && videoRef.current && canvasRef.current) {
        if (!jsQR) {
          try {
            jsQR = (await import("jsqr")).default;
          } catch (error) {
            console.error("Failed to load jsQR library:", error);
            setScanningMode(false);
            return;
          }
        }

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          });

          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          await videoRef.current.play();

          scanQRCode(jsQR);
        } catch (error) {
          console.error("Error accessing camera:", error);
          setScanningMode(false);
        }
      }
    }

    function scanQRCode(jsQR) {
      if (!scanningMode || !videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        console.log("QR Code detected:", code.data);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        handleQRCodeResult(code.data);
      } else {
        animationFrame = requestAnimationFrame(() => scanQRCode(jsQR));
      }
    }

    if (scanningMode) {
      setupScanner();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      if (!scanningMode && streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scanningMode]);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);

      try {
        const res = await QrService.uploadQrImage(file);
        console.log(res);

        if (res && res.code === 1000) {
          setFriendData(res.result);
          setIsSuccess(true);
        } else {
          // Handle error case
          console.error("Error sending friend request:", res);
        }
      } catch (error) {
        console.error("Error uploading QR code:", error);
      } finally {
        setIsUploading(false);
      }

      setSelectedFile(URL.createObjectURL(file));
    }
  };

  const startScanning = () => {
    setScanningMode(true);
  };

  const stopScanning = () => {
    setScanningMode(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleQRCodeResult = async (data) => {
    setScanResult(data);
    setIsUploading(true);

    try {
      // Assume we're calling an API with the QR code data
      const res = await QrService.sendFriendRequest(data);

      if (res && res.code === 1000) {
        setFriendData(res.result);
        setIsSuccess(true);
      } else {
        // Handle error case
        console.error("Error sending friend request:", res);
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
    } finally {
      setIsUploading(false);
      setScanningMode(false);
    }
  };

  const handleClose = () => {
    stopScanning();
    setIsUploading(false);
    setIsSuccess(false);
    setSelectedFile(null);
    setScanResult(null);
    setFriendData(null);
    onClose();
  };

  return (
    <CustomModal isOpen={open} onClose={handleClose}>
      <div className="bg-primary rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Modal header */}
        <div className="p-6 flex justify-between items-center border-b border-borderNewFeed">
          <h2 className="text-xl font-semibold text-ascent-1">
            {scanningMode
              ? "Scan QR Code"
              : isSuccess
              ? "Friend Request Sent"
              : "Add Friends"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6">
          {scanningMode ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full h-64 bg-black mb-6 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full object-cover opacity-0"
                />
                <div className="absolute inset-0 border-2 border-white opacity-50 m-12 rounded-lg"></div>
              </div>
              <p className="text-gray-500 text-center mb-6">
                Position the QR code within the frame to scan
              </p>
              <button
                onClick={stopScanning}
                className="w-full flex items-center justify-center px-4 py-3 bg-black rounded-xl text-white font-medium hover:bg-gray-800 transition-colors"
              >
                Cancel Scanning
              </button>
            </div>
          ) : !isSuccess ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="bg-black rounded-full p-3 mb-4">
                  <QrCode color="white" size={32} />
                </div>
                <h3 className="text-lg font-medium text-ascent-1 mb-2">
                  Scan or Upload QR Code
                </h3>
                <p className="text-gray-500 text-center">
                  Upload a QR code from your gallery or scan directly from your
                  camera to add friends.
                </p>
              </div>

              {selectedFile ? (
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 mb-4">
                  <img
                    src={selectedFile}
                    alt="QR Code Preview"
                    className="w-full h-64 object-contain"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                      <div className="text-black text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-black border-gray-200 mx-auto mb-2"></div>
                        <p>Processing QR code...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors mb-4"
                >
                  <div className="bg-black rounded-full p-4 mb-4">
                    <Upload color="white" size={28} />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">
                    Upload QR Code
                  </p>
                  <p className="text-gray-500 text-sm">
                    Click to upload or drag and drop
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* <button
                  onClick={startScanning}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  <Camera size={20} className="mr-2" />
                  Scan QR Code
                </button> */}
                <button
                  onClick={handleUploadClick}
                  className="flex items-center justify-center px-4 py-3 bg-black rounded-xl text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  <Upload size={20} className="mr-2" />
                  Upload QR
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="bg-black rounded-full p-3 mb-4">
                <CheckCircle color="white" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Friend Request Sent!
              </h3>
              <p className="text-gray-500 text-center mb-6">
                You've successfully sent a friend request to{" "}
                {friendData?.recipientUsername || "the user"}.
              </p>
              <div className="bg-gray-100 w-full rounded-xl p-4 flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-gray-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {friendData?.recipientUsername || "User"}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    @{friendData?.recipientUsername || "user"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 w-full rounded-xl p-4 mb-6">
                <p className="text-gray-900 text-sm font-medium mb-1">
                  Request Status
                </p>
                <p className="text-black font-medium">
                  {friendData?.status || "PENDING"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center px-4 py-3 bg-black rounded-xl text-white font-medium hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default UploadQrCode;
