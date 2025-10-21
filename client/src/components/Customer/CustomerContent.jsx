import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, CreditCard, Folder, AlertCircle, CheckCircle, Clock, Wallet, Users, Star, ArrowRight } from "lucide-react";
import { InlineLoader } from "@/components/ui/Loader";
import { formatFullWalletAddress } from "@/lib/utils";
import { getApprovedAgents } from "@/services/agentAPI";
import { useNavigate } from "react-router-dom";

const CustomerContent = forwardRef(({ customer, kycStatus, onPayEMIClick, currentView, onKYCSubmit, onCreatePolicy, onPolicySuccess }, ref) => {
  const navigate = useNavigate();
  const [showAgents, setShowAgents] = useState(false);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [hasPolicyRequest, setHasPolicyRequest] = useState(false);

  // Check if customer has no policies
  const hasNoPolicies = !customer?.policies || customer?.policies?.length === 0 || customer?.activePolicies === 0;

  // Function to handle policy form opening
  const handleCreatePolicy = (agent) => {
    console.log("Create Policy clicked for agent:", agent);
    onCreatePolicy(agent);
  };

  // Function to handle policy success
  const handlePolicySuccess = (policyData) => {
    setHasPolicyRequest(true); // Set this only when policy is successfully created
    onPolicySuccess?.(policyData);
  };

  // Expose handlePolicySuccess to parent component
  useImperativeHandle(ref, () => ({ handlePolicySuccess }));

  // Function to fetch verified agents
  const handleGetPolicy = async () => {
    // Check if customer already has a policy request
    if (hasPolicyRequest) {
      // Don't show alert, just return - the success message will be shown on dashboard
      return;
    }

    setLoadingAgents(true);
    try {
      const response = await getApprovedAgents();
      setAgents(response.data?.data || []);
      setShowAgents(true);
    } catch (error) {
      console.error("Error fetching approved agents:", error);
      // Fallback to empty array if API fails
      setAgents([]);
      setShowAgents(true);
    } finally {
      setLoadingAgents(false);
    }
  };

  //Handler to navigate to KYC route
  const handleKYCClick = () => {
    navigate("/customer/kyc");
  };

  // Stats dynamically from customer data
  const stats = [
    { title: "Active Policies", value: customer?.activePolicies || 0, icon: Shield, change: "Coverage Active", color: "from-emerald-500/20 to-emerald-400/20", iconColor: "text-emerald-400" },
    { title: "Total Claims", value: customer?.totalClaims || 0, icon: FileText, change: "Claims Submitted", color: "from-blue-500/20 to-blue-400/20", iconColor: "text-blue-400" },
    { title: "Premium Due", value: "₹2,500", icon: CreditCard, change: "Monthly Payment", color: "from-amber-500/20 to-amber-400/20", iconColor: "text-amber-400" },
  ];

  const planFeatures = [
    { icon: Shield, title: "Comprehensive Coverage", color: "text-green-400", desc: "Protect yourself and your loved ones with our comprehensive insurance coverage plans." },
    { icon: CheckCircle, title: "Flexible Premiums", color: "text-blue-400", desc: "Choose from monthly, quarterly, or annual premium payment options that fit your budget." },
    { icon: Users, title: "Expert Agents", color: "text-purple-400", desc: "Get personalized service from our verified and approved insurance agents." },
    { icon: Clock, title: "Quick Processing", color: "text-amber-400", desc: "Fast approval process with minimal documentation requirements." },
  ];

  // Utility functions for agent data extraction
  const getAgentInitials = (agent) => {
    const name = agent.agent_name || agent.name;
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';
  };

  const getAgentName = (agent, index) => agent.agent_name || agent.name || `Agent ${index + 1}`;
  const getAgentEmail = (agent) => agent.agent_email || agent.email || 'Verified Agent';

  return (
    <div className="text-white w-full relative bg-transparent">
      {/* REMOVED: showKYC state and KycNew component - now handled by route */}
      <div className="space-y-4 sm:space-y-6 px-3 xs:px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        {/* Header */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 xs:gap-3">
              <div className="p-1.5 xs:p-2 rounded-lg glass"><Shield className="w-5 h-5 xs:w-6 xs:h-6 text-cyan-400" /></div>
              <div>
                <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  Customer <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-sm xs:text-base text-gray-300">
                  Welcome back, {customer?.customer_name || "Customer"}!
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1 xs:py-1.5 rounded-full glass border border-cyan-500/30">
              <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4 text-cyan-400" />
              <span className="text-xs xs:text-sm text-cyan-400 font-medium">Verified</span>
            </div>
          </div>
        </div>

        {/* KYC Alert - Now navigates to /customer/kyc route */}
        {kycStatus !== "verified" && (
          <Card className="glass border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <CardContent className="p-4">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-cyan-400">Complete Your KYC</h3>
                  </div>
                  <p className="text-cyan-100 text-base mb-3">
                    Complete your Know Your Customer verification to access advanced features and higher claim limits.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button 
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 cursor-pointer z-10 relative"
                    onClick={handleKYCClick}
                    type="button"
                  >
                    Complete KYC
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xs:gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="glass hover:border-white/30 transition-all duration-300 hover:scale-105">
              <CardContent className="p-3 xs:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                  <span className="text-xs text-gray-400">{stat.change}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg xs:text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs xs:text-sm text-gray-400">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Policy Request Success Message */}
        {hasPolicyRequest && (
          <Card className="glass border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-400">Policy Request Submitted!</h3>
                </div>
                <p className="text-gray-300 text-lg mb-2">
                  Thank you for your policy request! Our agent will reach out to you soon.
                </p>
                <p className="text-gray-400 text-sm">
                  We're reviewing your application and will contact you within 24-48 hours.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Get Policy Section */}
        {!hasPolicyRequest && (
          <Card className="glass hover:border-green-400/50 transition-all duration-300 hover:scale-[1.01]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Insurance Endorsement Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Status Message */}
                <div className="text-center p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-400">No Policy Yet</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    You don't have any active insurance policies. Get started with our comprehensive endorsement plans.
                  </p>
                </div>

                {/* Plan Details */}
                <div className="space-y-4">
                  <h4 className="text-white font-semibold text-lg">What are Endorsement Plans?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planFeatures.map((feature, index) => (
                      <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <feature.icon className={`w-4 h-4 ${feature.color}`} />
                          <span className={`${feature.color} font-medium`}>{feature.title}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing and CTA */}
                <div className="space-y-4">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
                    <h3 className="text-2xl font-bold text-white mb-2">Starting from ₹2,500<span className="text-gray-400 text-lg font-normal">/month</span></h3>
                    <p className="text-gray-400 text-sm mb-3">Flexible premium options available</p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
                      <span>✓ Life Insurance</span>
                      <span>✓ Health Coverage</span>
                      <span>✓ Accident Protection</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleGetPolicy}
                      disabled={loadingAgents}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 cursor-pointer relative z-10 px-8 py-3 text-lg"
                      type="button"
                      style={{ pointerEvents: 'auto' }}
                    >
                      {loadingAgents ? <InlineLoader /> : (
                        <>
                          Get Endorsement Plan
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verified Agents List */}
        {showAgents && (
          <Card className="glass border border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <Users className="w-5 h-5" />
                Approved Agents ({agents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agents.length > 0 ? (
                  agents.map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{getAgentInitials(agent)}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{getAgentName(agent, index)}</p>
                          <p className="text-gray-400 text-sm">{getAgentEmail(agent)}</p>
                          <p className="text-gray-500 text-xs">Wallet: {formatFullWalletAddress(agent.wallet_address)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-yellow-400 text-sm font-medium">4.8</span>
                        </div>
                        <Button 
                          onClick={() => handleCreatePolicy(agent)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 cursor-pointer relative z-10 px-6 py-2 text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 border-0"
                          type="button"
                          style={{ pointerEvents: 'auto' }}
                        >
                          Create Policy
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No approved agents available at the moment</p>
                    <p className="text-gray-500 text-sm mt-2">
                      All agents need to be approved by the company before they can help customers.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Policy Overview */}
        {hasNoPolicies && (
          <div className="col-span-full">
            <Card className="glass border border-blue-500/30">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Active Policy Overview</h3>
                <p className="text-gray-400">Policy details will be displayed here when customer has active policies.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
});

export default CustomerContent;