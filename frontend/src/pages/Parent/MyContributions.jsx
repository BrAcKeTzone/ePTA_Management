import React, { useState, useEffect } from "react";
import { contributionsApi } from "../../api/contributionsApi";
import Table from "../../components/Table";
import LoadingSpinner from "../../components/LoadingSpinner";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import { formatDate } from "../../utils/formatDate";

const MyContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [balance, setBalance] = useState({});
  const [paymentBasis, setPaymentBasis] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    paymentMethod: "cash",
    projectName: "",
    description: "",
    receiptNumber: "",
  });

  useEffect(() => {
    fetchContributionData();
  }, []);

  const fetchContributionData = async () => {
    try {
      setLoading(true);

      const [contributionsResponse, balanceResponse, paymentBasisResponse] =
        await Promise.all([
          contributionsApi.getMyContributions(),
          contributionsApi.getMyBalance(),
          contributionsApi.getPaymentBasis(),
        ]);

      setContributions(contributionsResponse.data?.contributions || []);
      setBalance(balanceResponse.data || {});
      setPaymentBasis(paymentBasisResponse.data || {});
    } catch (error) {
      console.error("Error fetching contribution data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    try {
      await contributionsApi.recordPayment({
        amount: parseFloat(newPayment.amount),
        paymentMethod: newPayment.paymentMethod,
        projectName: newPayment.projectName || null,
        description: newPayment.description,
        receiptNumber: newPayment.receiptNumber || null,
      });
      setShowPaymentModal(false);
      setNewPayment({
        amount: "",
        paymentMethod: "cash",
        projectName: "",
        description: "",
        receiptNumber: "",
      });
      fetchContributionData(); // Refresh data
    } catch (error) {
      console.error("Error recording payment:", error);
    }
  };

  const contributionColumns = [
    {
      key: "project",
      header: "Project/Purpose",
      render: (contribution) => (
        <div>
          <div className="font-medium">
            {contribution.projectName || "General Fund"}
          </div>
          <div className="text-sm text-gray-600">
            {contribution.description}
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (contribution) => (
        <span className="font-medium text-green-600">
          ₱{contribution.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      render: (contribution) => (
        <div>
          <div className="capitalize">{contribution.paymentMethod}</div>
          {contribution.receiptNumber && (
            <div className="text-sm text-gray-600">
              #{contribution.receiptNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (contribution) => formatDate(contribution.createdAt),
    },
    {
      key: "status",
      header: "Status",
      render: (contribution) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            contribution.isVerified
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {contribution.isVerified ? "Verified" : "Pending Verification"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Contributions
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            View your payment history and outstanding balance
          </p>
        </div>
        <Button onClick={() => setShowPaymentModal(true)}>
          Record Payment
        </Button>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Paid
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₱{balance.totalPaid?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Outstanding Balance
          </h3>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            ₱{balance.outstanding?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending Verification
          </h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            ₱{balance.pendingVerification?.toLocaleString() || "0"}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Required
          </h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ₱{balance.totalRequired?.toLocaleString() || "0"}
          </p>
        </div>
      </div>

      {/* Payment Basis Information */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Payment Basis Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Current Settings
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Payment Basis:
                </span>
                <span className="font-medium dark:text-white">
                  {paymentBasis.isPerStudent ? "Per Student" : "Per Parent"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Base Amount:
                </span>
                <span className="font-medium dark:text-white">
                  ₱{paymentBasis.baseAmount?.toLocaleString() || "0"}
                </span>
              </div>
              {paymentBasis.isPerStudent &&
                paymentBasis.multipleChildrenDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Multiple Children Discount:
                    </span>
                    <span className="font-medium dark:text-white">
                      {paymentBasis.multipleChildrenDiscount}%
                    </span>
                  </div>
                )}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Your Children
            </h3>
            <div className="space-y-2 text-sm">
              {balance.children?.map((child, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    {child.name}:
                  </span>
                  <span className="font-medium dark:text-white">
                    ₱{child.requiredAmount?.toLocaleString() || "0"}
                  </span>
                </div>
              )) || (
                <span className="text-gray-500 dark:text-gray-400">
                  No children linked
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Payment Progress
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="dark:text-gray-300">Payment Completion</span>
              <span className="dark:text-gray-300">
                {balance.totalRequired > 0
                  ? Math.round(
                      (balance.totalPaid / balance.totalRequired) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  balance.outstanding === 0 ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{
                  width: `${
                    balance.totalRequired > 0
                      ? Math.min(
                          100,
                          (balance.totalPaid / balance.totalRequired) * 100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {balance.outstanding === 0
              ? "All contributions are up to date!"
              : `You have ₱${balance.outstanding.toLocaleString()} remaining to complete your contributions.`}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">
            Payment History
          </h2>
        </div>
        <Table
          data={contributions}
          columns={contributionColumns}
          emptyMessage="No payments found"
        />
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment"
      >
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          <Input
            label="Amount (₱)"
            type="number"
            step="0.01"
            min="0"
            value={newPayment.amount}
            onChange={(e) =>
              setNewPayment({ ...newPayment, amount: e.target.value })
            }
            placeholder="Enter payment amount"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method
            </label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              value={newPayment.paymentMethod}
              onChange={(e) =>
                setNewPayment({ ...newPayment, paymentMethod: e.target.value })
              }
              required
            >
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="gcash">GCash</option>
              <option value="maya">Maya</option>
            </select>
          </div>

          <Input
            label="Project/Purpose (Optional)"
            value={newPayment.projectName}
            onChange={(e) =>
              setNewPayment({ ...newPayment, projectName: e.target.value })
            }
            placeholder="e.g., School building fund, General contribution"
          />

          <Input
            label="Description"
            value={newPayment.description}
            onChange={(e) =>
              setNewPayment({ ...newPayment, description: e.target.value })
            }
            placeholder="Brief description of the payment"
            required
          />

          <Input
            label="Receipt Number (Optional)"
            value={newPayment.receiptNumber}
            onChange={(e) =>
              setNewPayment({ ...newPayment, receiptNumber: e.target.value })
            }
            placeholder="Receipt or reference number"
          />

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Note:</strong> This payment will be marked as "Pending
              Verification" until confirmed by the PTA treasurer. Please bring
              your receipt to the PTA office for verification.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </Modal>

      {/* Payment Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Payment Instructions
        </h3>
        <div className="text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            • Payments can be made through cash, check, bank transfer, or GCash
          </p>
          <p>• Please bring your receipt to the PTA office for verification</p>
          <p>
            • All payments will be verified before being reflected in your
            account
          </p>
          <p>• Contact the PTA treasurer for any payment-related questions</p>
          <p>
            • Outstanding balances must be settled before clearance can be
            issued
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyContributions;
