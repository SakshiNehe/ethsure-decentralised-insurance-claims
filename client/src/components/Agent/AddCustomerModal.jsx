import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, UserPlus, Shield, Phone } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { defaultAgentUser, getAgentSidebarItems, getAgentCurrentView, commonClasses } from '@/constants/agentConstants';
import { InlineLoader } from '@/components/ui/Loader';

const AddCustomerModal = ({ isOpen, onClose, onCustomerAdded, withLayout = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', occupation: '', 
    annualIncome: '', emergencyContact: '', emergencyPhone: '', preferredContact: 'email', riskProfile: 'low'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const newCustomer = {
      id: Date.now(), name: `${formData.firstName} ${formData.lastName}`, email: formData.email, phone: formData.phone,
      address: formData.address, dateOfBirth: formData.dateOfBirth, occupation: formData.occupation, annualIncome: formData.annualIncome,
      emergencyContact: formData.emergencyContact, emergencyPhone: formData.emergencyPhone, preferredContact: formData.preferredContact,
      riskProfile: formData.riskProfile, status: 'Pending', policy: 'No Policy', premium: 'N/A',
      joinDate: new Date().toISOString().split('T')[0], lastContact: new Date().toISOString().split('T')[0]
    };
    if (onCustomerAdded) onCustomerAdded(newCustomer);
    setIsSubmitting(false);
    onClose();
    setFormData({ firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '', occupation: '', 
      annualIncome: '', emergencyContact: '', emergencyPhone: '', preferredContact: 'email', riskProfile: 'low' });
  };

  if (!isOpen) return null;

  const user = defaultAgentUser;
  const sidebarItems = getAgentSidebarItems(navigate);
  const getCurrentView = () => 'customers';

  const content = (
    <div className="text-white w-full space-y-8 px-3 xs:px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg glass"><UserPlus className="w-6 h-6 text-cyan-400" /></div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">Add New <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Customer</span></h1>
              <p className="text-xl text-gray-300 mt-2">Enter customer information to create a new profile</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onClose} className="text-gray-300 hover:text-white hover:bg-white/10 border-white/20">← Back to Dashboard</Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 p-3 rounded-xl transition-all duration-200"><X className="w-6 h-6" /></Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={commonClasses.cardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white"><UserPlus className="w-5 h-5" />Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="firstName" className="text-white">First Name</Label>
                <Input id="firstName" type="text" placeholder="Enter first name" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={commonClasses.inputClass} required /></div>
              <div><Label htmlFor="lastName" className="text-white">Last Name</Label>
                <Input id="lastName" type="text" placeholder="Enter last name" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={commonClasses.inputClass} required /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div><Label htmlFor="email" className="text-white">Email Address</Label>
                <Input id="email" type="email" placeholder="customer@email.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className={commonClasses.inputClass} required /></div>
              <div><Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={commonClasses.inputClass} required /></div>
            </div>
            <div className="mt-4"><Label htmlFor="address" className="text-white">Address</Label>
              <Input id="address" type="text" placeholder="123 Main Street, City, State, ZIP" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className={commonClasses.inputClass} required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div><Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} className={commonClasses.inputClass} required /></div>
              <div><Label htmlFor="occupation" className="text-white">Occupation</Label>
                <Input id="occupation" type="text" placeholder="Software Engineer" value={formData.occupation} onChange={(e) => handleInputChange('occupation', e.target.value)} className={commonClasses.inputClass} required /></div>
            </div>
          </CardContent>
        </Card>

        <Card className={commonClasses.cardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white"><Shield className="w-5 h-5" />Financial Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="annualIncome" className="text-white">Annual Income</Label>
                <Input id="annualIncome" type="text" placeholder="$50,000" value={formData.annualIncome} onChange={(e) => handleInputChange('annualIncome', e.target.value)} className={commonClasses.inputClass} required /></div>
              <div><Label htmlFor="riskProfile" className="text-white">Risk Profile</Label>
                <select id="riskProfile" value={formData.riskProfile} onChange={(e) => handleInputChange('riskProfile', e.target.value)} className={commonClasses.selectClass}>
                  <option value="low">Low Risk</option><option value="medium">Medium Risk</option><option value="high">High Risk</option>
                </select></div>
            </div>
          </CardContent>
        </Card>

        <Card className={commonClasses.cardClass}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white"><Phone className="w-5 h-5" />Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="emergencyContact" className="text-white">Emergency Contact Name</Label>
                <Input id="emergencyContact" type="text" placeholder="John Doe" value={formData.emergencyContact} onChange={(e) => handleInputChange('emergencyContact', e.target.value)} className={commonClasses.inputClass} required /></div>
              <div><Label htmlFor="emergencyPhone" className="text-white">Emergency Contact Phone</Label>
                <Input id="emergencyPhone" type="tel" placeholder="+1 (555) 987-6543" value={formData.emergencyPhone} onChange={(e) => handleInputChange('emergencyPhone', e.target.value)} className={commonClasses.inputClass} required /></div>
            </div>
            <div className="mt-4"><Label htmlFor="preferredContact" className="text-white">Preferred Contact Method</Label>
              <select id="preferredContact" value={formData.preferredContact} onChange={(e) => handleInputChange('preferredContact', e.target.value)} className={commonClasses.selectClass}>
                <option value="email">Email</option><option value="phone">Phone</option><option value="sms">SMS</option>
              </select></div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className={commonClasses.buttonClass}>{isSubmitting ? <InlineLoader /> : 'Add Customer'}</Button>
        </div>
      </form>
    </div>
  );

  if (withLayout) {
    return (<DashboardLayout sidebarItems={sidebarItems} user={user} currentView={getCurrentView()} fullPageView={false}>{content}</DashboardLayout>);
  }
  return content;
};
export default AddCustomerModal;