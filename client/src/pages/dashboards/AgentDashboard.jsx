import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import AgentContent from "@/components/Agent/AgentContent";
import DocVault from "@/components/DocVault";
import { FullPageLoader } from "@/components/ui/Loader";
import { Home, Users, FileText, Folder } from "lucide-react";
import { useAccount } from "wagmi";

import {
  getAgentDetails,
  getAllAgentPolicies,
} from "../../services/agentAPI"; 

import { getCustomer } from "../../services/customerAPI";
import { checkAgentKYCStatus } from "../../services/kycAPI";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();

  const [currentView, setCurrentView] = useState('overview');
  const [agent, setAgent] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      if (!isConnected || !address) {
        navigate("/");
        return;
      }

      try {
        // Get agent profile
        const agentRes = await getAgentDetails(address.toLowerCase());
        const agentData = agentRes.data?.data;

        console.log("Agent Dashboard Debug:");
        console.log("  - Full response:", agentRes);
        console.log("  - Agent data:", agentData);
        console.log("  - Agent name:", agentData?.agent_name);

        setAgent(agentData);

        // Check agent KYC status
        const kycRes = await checkAgentKYCStatus(address.toLowerCase());
        const kycStatusValue = kycRes.data?.kyc_status;
        setKycStatus(kycStatusValue);

        // // Navigate to /agent/kyc if KYC is pending
        // if (kycStatusValue === "pending") {
        //   navigate("/agent/kyc");
        //   return;
        // }

        // Fetch all customers for agent dashboard
        const customerRes = await getCustomer();
        setCustomers(customerRes.data?.data || []);

      } catch (err) {
        console.error("Error fetching agent data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [isConnected, address, navigate]);

  // Handle URL query for direct DocVault navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const view = urlParams.get('view');
    if (view === 'docvault') {
      setCurrentView('docvault');
    }
  }, [location.search]);

  if (loading) return <FullPageLoader message="Loading your agent dashboard..." />;

  // Dynamic user object
  const user = {
    name: agent?.agent_name || agent?.name || "Agent",
    role: "Agent",
    email: agent?.agent_email || agent?.email || "agent@example.com",
    wallet: address,
    company: agent?.company || "EthSure",
  };

  const sidebarItems = [
    { id: 'overview', icon: Home, label: 'Overview', onClick: () => setCurrentView('overview') },
    { id: 'policy-management', icon: FileText, label: 'Policy Management', onClick: () => setCurrentView('policy-management') },
    { id: 'docvault', icon: Folder, label: 'DocVault', onClick: () => setCurrentView('docvault') },
  ];

  const getCurrentView = () => {
    const path = location.pathname;
    if (path.includes('/policy-management')) return 'policy-management';
    return currentView;
  };

  const renderContent = () => {
    switch (currentView) {
      // REMOVED: KYC case - now handled by separate route /agent/kyc
      case 'docvault':
        return <DocVault user={user} />;
      case 'policy-management':
        return (
          <div className="text-white w-full relative bg-transparent">
            <div className="space-y-6 px-3 xs:px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg glass">
                      <FileText className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                        Policy <span className="gradient-text">Management</span>
                      </h1>
                      <p className="text-xl text-gray-300">
                        Manage your active policies and claim settlements
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Placeholder content for policy management */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass border border-blue-500/30 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Active Policies</h3>
                  <p className="text-gray-400">Your active policies will be displayed here.</p>
                </div>
                <div className="glass border border-green-500/30 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-white mb-4">Claim Settlements</h3>
                  <p className="text-gray-400">Claim settlement information will be displayed here.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <AgentContent 
          agent={agent} 
          onNavigateToCustomers={() => navigate('/agent/customers')} 
          customers={customers} 
        />;
    }
  };

  return (
    <DashboardLayout 
      sidebarItems={sidebarItems}
      user={user}
      currentView={getCurrentView()}
      fullPageView={false}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default AgentDashboard;