import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Card } from "../../components/UI/Card";

export default function Register() {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Complete Registration
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { sendOtp, verifyOtp, register } = useAuthStore();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await sendOtp(formData.email);
      setMessage("OTP sent to your email address");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await verifyOtp(formData.email, formData.otp);
      setMessage("Email verified successfully");
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            JHCSC Dumingag Campus
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            PTA Management System
          </p>
          <h3 className="mt-4 text-center text-xl font-bold text-gray-700">
            Create your account
          </h3>
        </div>

        <Card className="mt-8 space-y-6">
          {/* Step 1: Send OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="text-sm text-gray-600 text-center">
                Step 1 of 3: Email Verification
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={!formData.email}
              >
                Send OTP
              </Button>
            </form>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-sm text-gray-600 text-center">
                Step 2 of 3: Verify OTP
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                  {message}
                </div>
              )}

              <div className="text-sm text-gray-600">
                Please enter the 6-digit OTP sent to {formData.email}
              </div>

              <Input
                id="otp"
                name="otp"
                type="text"
                required
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                value={formData.otp}
                onChange={handleChange}
              />

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isLoading}
                  disabled={!formData.otp || formData.otp.length !== 6}
                >
                  Verify OTP
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Complete Registration */}
          {step === 3 && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="text-sm text-gray-600 text-center">
                Step 3 of 3: Complete Registration
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                  {message}
                </div>
              )}

              <div className="space-y-4">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />

                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password (minimum 8 characters)"
                  minLength="8"
                  value={formData.password}
                  onChange={handleChange}
                />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isLoading}
                  disabled={
                    !formData.name ||
                    !formData.password ||
                    !formData.confirmPassword
                  }
                >
                  Register
                </Button>
              </div>
            </form>
          )}

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </Link>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
