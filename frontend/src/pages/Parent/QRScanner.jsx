import React, { useState, useRef, useEffect } from "react";
import QrScanner from "qr-scanner";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import { meetingsApi } from "../../api/meetingsApi";

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [qrScanner, setQrScanner] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
    };
  }, [qrScanner]);

  const startScanning = async () => {
    try {
      setError("");
      setIsScanning(true);

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setError("No camera found on this device");
        setIsScanning(false);
        return;
      }

      // Create QR scanner instance
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          // QR code detected
          handleQRCodeDetected(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: "environment", // Use back camera if available
        }
      );

      setQrScanner(scanner);
      await scanner.start();
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setError("Failed to start camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
    setIsScanning(false);
  };

  const handleQRCodeDetected = async (qrData) => {
    try {
      setLoading(true);

      // Stop scanning to prevent multiple scans
      stopScanning();

      // Send QR code data to backend for processing
      const response = await meetingsApi.scanQRCode(qrData);

      setScanResult({
        success: true,
        message: response.data.message,
        meeting: response.data.data?.meeting,
        attendance: response.data.data,
      });
    } catch (err) {
      console.error("QR scan error:", err);
      setScanResult({
        success: false,
        message: err.response?.data?.message || "Failed to process QR code",
      });
    } finally {
      setLoading(false);
      setShowResultModal(true);
    }
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    setScanResult(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour12 = hours > 12 ? hours - 12 : hours == 0 ? 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Scanner</h1>
        <p className="text-gray-600">
          Scan the meeting QR code to mark your attendance
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          {!isScanning ? (
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4h2m0-6V9a3 3 0 00-3-3H9m1.5-2-1.5 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Scan
              </h3>
              <p className="text-gray-500 mb-6">
                Click the button below to start scanning QR codes for meeting
                attendance
              </p>
              <Button onClick={startScanning} className="px-6 py-3">
                📱 Start QR Scanner
              </Button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  📷 Scanning for QR Code
                </h3>
                <p className="text-gray-500">
                  Point your camera at the meeting QR code
                </p>
              </div>

              {/* Camera Video */}
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  style={{ maxHeight: "400px" }}
                />
                {loading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
                      <LoadingSpinner />
                      <span className="text-gray-700">
                        Processing QR code...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={stopScanning}
                  className="px-6 py-2"
                >
                  ❌ Stop Scanning
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📋 Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Make sure you have camera permissions enabled</li>
          <li>• Hold your device steady and point the camera at the QR code</li>
          <li>• The QR code should fill most of the camera view</li>
          <li>
            • Attendance will be marked automatically when QR code is detected
          </li>
        </ul>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={handleResultModalClose}
        title="QR Scan Result"
        size="md"
      >
        <div className="p-6">
          {scanResult && (
            <div>
              {scanResult.success ? (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ✅ Success!
                  </h3>
                  <p className="text-gray-600 mb-4">{scanResult.message}</p>

                  {scanResult.meeting && (
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Meeting Details:
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <strong>Title:</strong> {scanResult.meeting.title}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {formatDate(scanResult.meeting.date)}
                        </p>
                        <p>
                          <strong>Venue:</strong> {scanResult.meeting.venue}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ❌ Scan Failed
                  </h3>
                  <p className="text-gray-600">{scanResult.message}</p>
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <Button onClick={handleResultModalClose} className="px-6 py-2">
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default QRScanner;
