import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiCamera,
  FiUser,
  FiLogOut,
  FiClock,
  FiCalendar,
  FiMapPin,
  FiFileText,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [hasLoggedInToday, setHasLoggedInToday] = useState(false);
  const [loginRecord, setLoginRecord] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    checkLoginStatus();
    getCurrentLocation();

    // Cleanup function
    return () => {
      stopCamera();
    };
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get("/employee/check-login-status");
      if (response.data.success) {
        setHasLoggedInToday(response.data.hasLoggedInToday);
        setLoginRecord(response.data.loginRecord);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.log("Location access denied or failed:", error);
          // Continue without location
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      toast.error("Camera access denied or not available");
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setCapturedPhoto(null);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Flip the image horizontally for natural selfie effect
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const previewUrl = URL.createObjectURL(blob);
          setPhotoPreview(previewUrl);
          setCapturedPhoto(blob);
        },
        "image/jpeg",
        0.8
      );
    }
  };

  const retakePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setCapturedPhoto(null);
  };

  const confirmAndUpload = () => {
    if (capturedPhoto) {
      uploadPhoto(capturedPhoto);
    }
  };

  const uploadPhoto = async (photoBlob) => {
    if (!photoBlob) {
      toast.error("Please capture a photo");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    const file = new File([photoBlob], "photo.jpg", { type: "image/jpeg" });
    formData.append("photo", file);

    if (location) {
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
      formData.append("accuracy", location.accuracy);
    }

    try {
      const response = await axios.post(
        "/employee/login-with-photo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Login recorded successfully! Welcome to office.");
        setHasLoggedInToday(true);
        setLoginRecord(response.data.loginRecord);
        stopCamera();
        checkLoginStatus();
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to record login";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <FiUser className="h-8 w-8 text-primary-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Employee Portal
                </h1>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-primary-600 transition-colors"
              >
                <FiLogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium flex items-center">
              <FiUser className="h-4 w-4 mr-2" />
              Dashboard
            </div>
            <Link
              to="/employee/records"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center"
            >
              <FiFileText className="h-4 w-4 mr-2" />
              My Login Records
            </Link>
          </div>
        </div>
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.name}!
              </h2>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  Employee ID: {user?.employeeId}
                </p>
                <p className="text-sm text-gray-600">
                  Department: {user?.department}
                </p>
                <p className="text-sm text-gray-600">Email: {user?.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Today's Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Login Status */}
        {hasLoggedInToday ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiClock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-green-900">
                  ✅ You're checked in for today!
                </h3>
                {loginRecord && (
                  <div className="mt-2 text-sm text-green-700">
                    <p className="flex items-center">
                      <FiCalendar className="h-4 w-4 mr-1" />
                      Login Time:{" "}
                      {new Date(loginRecord.loginDate).toLocaleTimeString()}
                    </p>
                    {location && (
                      <p className="flex items-center mt-1">
                        <FiMapPin className="h-4 w-4 mr-1" />
                        Location recorded
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Daily Check-in Required
              </h3>
              <p className="text-gray-600 mb-6">
                Please take a photo to record your attendance for today
              </p>

              {/* The main container for the camera view */}
              <div
                className="relative inline-block w-full max-w-sm rounded-lg shadow-lg"
                style={{ minHeight: "300px" }}
              >
                {/* Video element is shown when capturing but no preview is available */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-auto rounded-lg ${
                    isCapturing && !photoPreview ? "" : "hidden"
                  }`}
                  style={{ transform: "scaleX(-1)" }}
                />

                {/* Canvas for capturing the image (always hidden) */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Photo preview is shown when available */}
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Captured"
                    className="w-full h-auto rounded-lg object-contain"
                  />
                )}
              </div>

              {/* Conditional buttons based on state */}
              {!isCapturing ? (
                <div className="space-y-4 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startCamera}
                    className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto mx-auto"
                  >
                    <FiCamera className="h-5 w-5 mr-2" />
                    Take Live Photo
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4 mt-6">
                  {/* Buttons for capture, retake, and confirm */}
                  {!photoPreview ? (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={capturePhoto}
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                      >
                        <FiCamera className="h-5 w-5 mr-2" />
                        Capture Photo
                      </motion.button>

                      <button
                        onClick={stopCamera}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={confirmAndUpload}
                        disabled={isUploading}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          "✅ Confirm & Submit"
                        )}
                      </motion.button>

                      <button
                        onClick={retakePhoto}
                        disabled={isUploading}
                        className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                      >
                        📷 Retake Photo
                      </button>

                      <button
                        onClick={stopCamera}
                        disabled={isUploading}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Daily Attendance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    hasLoggedInToday
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {hasLoggedInToday ? "Checked In" : "Pending"}
                </span>
              </div>
              {loginRecord && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(loginRecord.loginDate).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ℹ️ Instructions
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Take a clear photo of yourself</p>
              <p>• Ensure good lighting</p>
              <p>• You can only check-in once per day</p>
              <p>• Photos are stored securely for 7 days</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
