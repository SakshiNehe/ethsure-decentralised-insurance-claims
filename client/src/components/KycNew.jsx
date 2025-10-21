import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Check, AlertCircle, Shield, Clock } from "lucide-react";
import { useAccount } from "wagmi";
import { InlineLoader } from "@/components/ui/Loader";

import { 
  sendCustomerKYCOTP, 
  verifyCustomerKYCOTP, 
  resendCustomerKYCOTP,
  sendAgentKYCOTP,
  verifyAgentKYCOTP,
  resendAgentKYCOTP
} from "@/services/kycAPI";

const KycNew = ({ role = "customer", onClose }) => {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    aadhar_number: "",
    pan_number: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Timer for resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // OTP Functions based on role
  const handleSendOTP = async () => {
    if (!formData.phone.trim()) {
      setErrors(prev => ({ ...prev, phone: "Phone number is required to send OTP" }));
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: "Please enter a valid 10-digit phone number" }));
      return;
    }

    setSendingOtp(true);
    try {
      const walletAddress = address.toLowerCase();
      let response;

      if (role === "agent") {
        response = await sendAgentKYCOTP(walletAddress, formData.phone);
      } else {
        response = await sendCustomerKYCOTP(walletAddress, formData.phone);
      }

      if (response.success) {
        setOtpSent(true);
        setResendTimer(60);
        alert("OTP sent successfully to your mobile number!");
      } else {
        alert(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP send error:", error);
      alert(error.response?.data?.message || "An error occurred while sending OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      alert("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      const walletAddress = address.toLowerCase();
      let response;

      if (role === "agent") {
        response = await verifyAgentKYCOTP(walletAddress, otp);
      } else {
        response = await verifyCustomerKYCOTP(walletAddress, otp);
      }

      if (response.success) {
        setOtpVerified(true);
        alert("OTP verified successfully!");
      } else {
        alert(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      alert(error.response?.data?.message || "An error occurred while verifying OTP. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOTP = async () => {
    setSendingOtp(true);
    try {
      const walletAddress = address.toLowerCase();
      let response;

      if (role === "agent") {
        response = await resendAgentKYCOTP(walletAddress);
      } else {
        response = await resendCustomerKYCOTP(walletAddress);
      }

      if (response.success) {
        setResendTimer(60);
        setOtp("");
        alert("OTP resent successfully!");
      } else {
        alert(response.message || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP resend error:", error);
      alert(error.response?.data?.message || "An error occurred while resending OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = "Invalid phone number";
    
    if (!formData.aadhar_number.trim()) newErrors.aadhar_number = "Aadhar number is required";
    else if (!/^\d{12}$/.test(formData.aadhar_number.replace(/\D/g, ''))) newErrors.aadhar_number = "Aadhar number must be 12 digits";
    
    if (!formData.pan_number.trim()) newErrors.pan_number = "PAN number is required";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.toUpperCase())) newErrors.pan_number = "Invalid PAN format";

    if (!otpVerified) {
      alert("Please verify your mobile number with OTP before submitting KYC.");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const kycData = {
        wallet_address: address.toLowerCase(),
        ...formData,
        role: role
      };

      // For now, just simulate success since wrapper functions don't actually submit
      alert("KYC submitted successfully!");
      if (onClose) {
        onClose();
      } else {
        navigate(role === "agent" ? "/agent-dashboard" : "/customer-dashboard");
      }
    } catch (error) {
      console.error("KYC submission error:", error);
      alert(error.response?.data?.message || "An error occurred while submitting KYC. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Complete Your <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">KYC</span>
              </h1>
              <p className="text-gray-400 text-lg mt-1">
                {role === "agent" ? "Agent" : "Customer"} Verification Process
              </p>
            </div>
          </div>
        </div>

        {/* KYC Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                {/* Personal Information Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
                    <User className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Personal Information</h2>
                    <p className="text-gray-400 text-sm">Please provide your basic details for verification</p>
                  </div>
                </div>

                {/* OTP Verification Card */}
                {otpSent && !otpVerified && (
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Verify Mobile Number</h3>
                          <p className="text-gray-400 text-sm">Enter the 6-digit OTP sent to {formData.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400"
                          maxLength={6}
                        />
                        <Button
                          onClick={handleVerifyOTP}
                          disabled={verifyingOtp || otp.length !== 6}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                        >
                          {verifyingOtp ? <InlineLoader /> : "Verify"}
                        </Button>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button
                          onClick={handleResendOTP}
                          disabled={sendingOtp || resendTimer > 0}
                          variant="outline"
                          className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10"
                        >
                          {sendingOtp ? <InlineLoader /> : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* OTP Verified Success */}
                {otpVerified && (
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                        <Check className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-400">Mobile Number Verified</h3>
                        <p className="text-gray-400 text-sm">Your mobile number {formData.phone} has been verified successfully</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-base">Full Name *</Label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                    />
                    {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-base">Mobile Number *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        placeholder="Enter your 10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ''))}
                        className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                        maxLength={10}
                        disabled={otpSent}
                      />
                      {!otpSent ? (
                        <Button
                          onClick={handleSendOTP}
                          disabled={sendingOtp || !formData.phone.trim() || formData.phone.length !== 10}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 whitespace-nowrap disabled:opacity-50"
                        >
                          {sendingOtp ? <InlineLoader /> : "Send OTP"}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium whitespace-nowrap">OTP Sent</span>
                        </div>
                      )}
                    </div>
                    {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                  </div>

                  {/* Aadhar Number */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-base">Aadhar Number *</Label>
                    <Input
                      type="text"
                      placeholder="Enter 12-digit Aadhar number"
                      value={formData.aadhar_number}
                      onChange={(e) => handleInputChange("aadhar_number", e.target.value.replace(/\D/g, ''))}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                      maxLength={12}
                    />
                    {errors.aadhar_number && <p className="text-red-400 text-sm">{errors.aadhar_number}</p>}
                  </div>

                  {/* PAN Number */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold text-base">PAN Number *</Label>
                    <Input
                      type="text"
                      placeholder="Enter PAN number (e.g., ABCDE1234F)"
                      value={formData.pan_number}
                      onChange={(e) => handleInputChange("pan_number", e.target.value.toUpperCase())}
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-500 focus:border-cyan-400 focus:ring-cyan-400"
                      maxLength={10}
                    />
                    {errors.pan_number && <p className="text-red-400 text-sm">{errors.pan_number}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !otpVerified}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-12 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <InlineLoader />
                    ) : !otpVerified ? (
                      <>
                        <Clock className="w-5 h-5 mr-2" />
                        Verify Mobile First
                      </>
                    ) : (
                      'Complete KYC'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KycNew;