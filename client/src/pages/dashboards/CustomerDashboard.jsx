import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import CustomerContent from "@/components/Customer/CustomerContent";
import PayEMIContent from "@/components/Customer/PayEMIContent";
import PoliciesContent from "@/components/Customer/PoliciesContent";
import PolicyForm from "@/components/PolicyForm";
import DocVault from "@/components/DocVault";
import { FullPageLoader } from "@/components/ui/Loader";
import { Users, FileText, Folder, CreditCard } from "lucide-react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { getCustomer } from "../../services/customerAPI";
import { checkCustomerKYCStatus } from "../../services/kycAPI";

const CustomerDashboard = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [currentView, setCurrentView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const customerContentRef = useRef(null);

  // Handler for opening PolicyForm
  const handleCreatePolicy = (agent) => {
    setSelectedAgent(agent);
    setCurrentView("policy-form");
  };

  // Handler for PolicyForm success
  const handlePolicySuccess = (policyData) => {
    console.log("Policy created successfully:", policyData);
    setCurrentView("overview");
    setSelectedAgent(null);
    // Call CustomerContent's handlePolicySuccess to update the state
    if (customerContentRef.current?.handlePolicySuccess) {
      customerContentRef.current.handlePolicySuccess(policyData);
    }
  };

  // Handler for closing PolicyForm
  const handleClosePolicyForm = () => {
    setCurrentView("overview");
    setSelectedAgent(null);
  };

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!isConnected || !address) {
        navigate("/");
        return;
      }
      setLoading(true);
      try {
        const response = await getCustomer(address.toLowerCase());
        const customerData = response.data?.data?.customer || response.data?.data;

        console.log("Customer Dashboard Debug:");
        console.log("  - Full response:", response);
        console.log("  - Customer data:", customerData);
        console.log("  - Customer name:", customerData?.customer_name);

        setCustomer(customerData);

        const kycRes = await checkCustomerKYCStatus(address.toLowerCase());
        const kycStatusValue = kycRes.data?.kyc_status;
        setKycStatus(kycStatusValue);

        // Navigate to /customer/kyc if KYC is pending (commented out for testing)
        // if (kycStatusValue === "pending") {
        //   navigate("/customer/kyc");
        //   return;
        // }
      } catch (err) {
        console.error("Error fetching customer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [isConnected, address, navigate]);

  if (loading) return <FullPageLoader message="Loading your customer dashboard..." />;

  // Dynamic user object for sidebar/profile
  const user = {
    name: customer?.customer_name || "Customer",
    role: "Customer",
    email: customer?.customer_email || "N/A",
    wallet: address,
    company: customer?.company || "EthSure Insurance",
  };

  const sidebarItems = [
    { id: "overview", icon: Users, label: "Overview", onClick: () => setCurrentView("overview") },
    { id: "policies", icon: FileText, label: "Policies", onClick: () => setCurrentView("policies") },
    { id: "pay-emi", icon: CreditCard, label: "Pay EMI", onClick: () => setCurrentView("pay-emi") },
    { id: "docvault", icon: Folder, label: "DocVault", onClick: () => setCurrentView("docvault") },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "pay-emi":
        return <PayEMIContent customer={customer} />;
      case "policies":
        return <PoliciesContent customer={customer} />;
      case "docvault":
        return <DocVault user={user} />;
      // REMOVED: KYC case - now handled by separate route /customer/kyc
      case "policy-form":
        return (
          <PolicyForm 
            agent={selectedAgent}
            customer={customer}
            onClose={handleClosePolicyForm}
            onSuccess={handlePolicySuccess}
          />
        );
      default:
        console.log({customer});
        return (
          <CustomerContent
            ref={customerContentRef}
            customer={customer}
            kycStatus={kycStatus}
            onPayEMIClick={() => setCurrentView("pay-emi")}
            currentView={currentView}
            setCurrentView={setCurrentView}
            // CHANGED: Navigate to /customer/kyc route instead of switching view
            onKYCSubmit={() => navigate("/customer/kyc")}
            onCreatePolicy={handleCreatePolicy}
            onPolicySuccess={handlePolicySuccess}
          />
        );
    }
  };
  
  // CHANGED: Remove 'kyc' from fullPageView array since it's now a separate route
  const isFullPageView = ["policy-form"].includes(currentView);

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      user={user}
      currentView={currentView}
      fullPageView={isFullPageView}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default CustomerDashboard;