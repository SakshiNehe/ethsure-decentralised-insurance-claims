import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Users, FileText, AlertCircle, CheckCircle, Clock, Wallet, TrendingUp, Eye, Plus, UserPlus, X, UserCheck, Calendar } from "lucide-react";
import { getStatusColor, getPriorityColor } from "@/constants/agentConstants";
import CustomerDetailsModal from "./CustomerDetailsModal";
import PolicyRequestDetailsModal from "./PolicyRequestDetailsModal";
import { getAgentPolicyRequests } from "@/services/agentAPI";
import { InlineLoader } from "@/components/ui/Loader";

const AgentContent = ({ 
  onNavigateToCustomers, 
  onViewCustomer, 
  customers = [],
  agent = null,
  onCreatePolicy,
  onAddCustomer,
  onKYCSubmit
}) => {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [policyRequests, setPolicyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedPolicyRequest, setSelectedPolicyRequest] = useState(null);
  const [showPolicyDetailsModal, setShowPolicyDetailsModal] = useState(false);

  // Fetch policy requests for the agent
  useEffect(() => {
    const fetchPolicyRequests = async () => {
      if (!agent?.wallet_address) return;
      
      setLoadingRequests(true);
      try {
        const response = await getAgentPolicyRequests(agent.wallet_address);
        console.log("Policy requests response:", response);
        setPolicyRequests(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching policy requests:", error);
        setPolicyRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchPolicyRequests();
  }, [agent?.wallet_address]);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
    if (onViewCustomer) {
      onViewCustomer(customer);
    }
  };

  const handleCreatePolicy = () => {
    if (onCreatePolicy) {
      onCreatePolicy();
    } else {
      navigate('/agent/create-policy');
    }
  };

  // CHANGED: Navigate to /agent/kyc route instead of calling onKYCSubmit
  const handleKYCSubmit = () => {
    navigate('/agent/kyc');
  };

  const handleReviewDetails = (policyRequest) => {
    setSelectedPolicyRequest(policyRequest);
    setShowPolicyDetailsModal(true);
  };

  const handleClosePolicyDetailsModal = () => {
    setShowPolicyDetailsModal(false);
    setSelectedPolicyRequest(null);
  };

  const handleApproveRequest = (policyRequest) => {
    console.log("Approving policy request:", policyRequest);
    // TODO: Implement approve API call
    handleClosePolicyDetailsModal();
  };

  const handleRejectRequest = (policyRequest) => {
    console.log("Rejecting policy request:", policyRequest);
    // TODO: Implement reject API call
    handleClosePolicyDetailsModal();
  };

  const stats = [
    { title: "Policy Requests", value: policyRequests.length.toString(), icon: FileText, change: "New requests from customers", color: "from-blue-500/20 to-blue-400/20", iconColor: "text-blue-400" },
    { title: "Pending Reviews", value: policyRequests.filter(req => req.status === 'pending').length.toString(), icon: Clock, change: "Awaiting your review", color: "from-amber-500/20 to-amber-400/20", iconColor: "text-amber-400" },
    { title: "Approved Policies", value: policyRequests.filter(req => req.status === 'approved').length.toString(), icon: CheckCircle, change: "Successfully processed", color: "from-emerald-500/20 to-emerald-400/20", iconColor: "text-emerald-400" },
  ];

  return (
    <div className="text-white w-full relative bg-transparent">
      <div className="space-y-6 pt-12 sm:pt-16">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg glass">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                  Agent <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-xl text-gray-300">
                  Welcome back, {agent?.agent_name || agent?.name || "Agent"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">Verified Agent</span>
            </div>
          </div>
        </div>

      {/* KYC Alert - CHANGED: Now navigates to /agent/kyc route */}
      <Card className="glass shine hover:border-blue-400/50 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-300 shadow-lg">
              <AlertCircle className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-cyan-300 text-lg mb-2">KYC Verification Pending</h3>
              <p className="text-cyan-100 text-base mb-3">
                Complete your Know Your Customer verification to access advanced claim management features and higher approval limits.
              </p>
            </div>
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300"
                onClick={handleKYCSubmit}
              >
                Complete KYC
              </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass shine hover:border-blue-400/50 transition-all duration-300 group hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-white/70 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Policy Requests Management - Takes 2 columns */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="glass shine hover:border-blue-400/50 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-bold">
                  <UserCheck className="w-5 h-5 font-bold" />
                  Policy Requests from Customers
                </CardTitle>
                <Button variant="secondary" size="sm">
                  View All Requests
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <InlineLoader />
                </div>
              ) : (
                <div className="space-y-4">
                  {policyRequests.length > 0 ? (
                    policyRequests.map((request, index) => (
                      <div key={request.id || index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm text-gray-300">#{request.id || `PR-${index + 1}`}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                request.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                request.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}>
                                {request.status || 'Pending'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium text-white">{request.fullName || request.customer_name || 'Customer'}</span>
                              <span className="text-sm text-white/60">{request.coverage_amount ? `₹${request.coverage_amount.toLocaleString()}` : 'Coverage Amount'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-cyan-400">₹{request.premium_amount?.toLocaleString() || 'Premium'}</span>
                              <span className="text-sm text-white/60">{request.premium_frequency || 'Annual'}</span>
                              <span className="text-sm text-white/60">{request.policy_duration ? `${request.policy_duration} years` : 'Duration'}</span>
                            </div>
                            {request.createdAt && (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleReviewDetails(request)}
                              className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                            >
                              Review Details
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveRequest(request)}
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 border-0"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleRejectRequest(request)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 border-0"
                            >
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">No policy requests from customers yet</p>
                      <p className="text-gray-500 text-sm mt-1">Customer requests will appear here when they create policy requests</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-6">
          {/* Placeholder for future sidebar content */}
        </div>
      </div>
      </div>

      {/* Modals */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />
      
      {/* Policy Request Details Modal */}
      <PolicyRequestDetailsModal
        policyRequest={selectedPolicyRequest}
        isOpen={showPolicyDetailsModal}
        onClose={handleClosePolicyDetailsModal}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />
      
    </div>
  );
};
export default AgentContent;