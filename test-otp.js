// Test script to verify OTP email sending
const fetch = require("node-fetch");

async function testOTPSending() {
  try {
    console.log("🧪 Testing OTP sending...");

    const response = await fetch("http://localhost:3000/api/auth/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com", // Replace with a real email for testing
      }),
    });

    const data = await response.json();

    console.log("📊 Response Status:", response.status);
    console.log("📄 Response Data:", data);

    if (response.ok) {
      console.log("✅ OTP sending test PASSED");
    } else {
      console.log("❌ OTP sending test FAILED");
    }
  } catch (error) {
    console.error("💥 Test Error:", error.message);
  }
}

testOTPSending();
