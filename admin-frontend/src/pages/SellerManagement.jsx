import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMail, FiPhone, FiMapPin, FiCalendar, FiTag, FiLink, FiDollarSign, FiShoppingCart, FiSmartphone, FiDownload, FiEdit, FiTrash2, FiEye, FiTrendingUp, FiFilter, FiArrowUp, FiArrowDown, FiX, FiCheck, FiXCircle, FiClock, FiImage, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader.jsx';
import RikoCraftPoster from '../components/RikoCraftPoster.jsx';
import RikoCraftcert from '../components/RikoCraftcert.jsx';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';

const SellerManagement = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQRCode, setCurrentQRCode] = useState('/qr.jpg');
  const posterRef = useRef();
  const certRef = useRef();
  const [editingSeller, setEditingSeller] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showWithdrawals, setShowWithdrawals] = useState(false);
  const [sortBy, setSortBy] = useState('joinedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterBlocked, setFilterBlocked] = useState('all');
  const [withdrawalActionLoading, setWithdrawalActionLoading] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showAllApprovals, setShowAllApprovals] = useState(false);
  const [sellerWithdrawals, setSellerWithdrawals] = useState([]);
  const [sellerWithdrawalsLoading, setSellerWithdrawalsLoading] = useState(false);
  const [sellerCommissions, setSellerCommissions] = useState([]);
  const [sellerCommissionsLoading, setSellerCommissionsLoading] = useState(false);
  const [showCommissions, setShowCommissions] = useState(false);
  const [commissionActionLoading, setCommissionActionLoading] = useState(null);

  useEffect(() => {
    fetchSellers();
    fetchAllWithdrawals();
  }, []);

  const fetchSellers = async () => {
    try {
      console.log('Fetching sellers from:', `${config.API_URLS.SELLER}/all`);
      
      const response = await fetch(`${config.API_URLS.SELLER}/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch sellers');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch sellers');
      }

      // Check each seller object and their withdrawals
      data.sellers.forEach(seller => {

        

      });

      setSellers(data.sellers || []);
    } catch (error) {
      console.error('Error fetching sellers:', error);
     
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWithdrawals = async () => {
    try {

      const response = await fetch(`${config.API_URLS.WITHDRAWAL}/admin/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch withdrawals');
      setWithdrawals(data.withdrawals || []);

    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error(error.message || 'Error fetching withdrawals');
    }
  };

  const fetchSellerCommissions = async (sellerId) => {
    try {

      const response = await fetch(`${config.API_URLS.COMMISSION}/admin/all?sellerId=${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch commissions');
      setSellerCommissions(data.commissionHistory || []);

    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast.error(error.message || 'Error fetching commissions');
    }
  };

  const downloadQRCode = async (seller) => {
    if (!seller.qrCode) {
      toast.error('QR code not available for this seller');
      return;
    }
    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      import('../components/RikoCraftPoster.jsx').then(({ default: RikoCraftPoster }) => {
        const root = createRoot(tempDiv);
        root.render(<RikoCraftPoster qrSrc={seller.qrCode} />);
        setTimeout(async () => {
          const canvas = await html2canvas(tempDiv, { backgroundColor: null, useCORS: true });
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = url;
          link.download = `${seller.businessName}-poster.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          root.unmount();
          document.body.removeChild(tempDiv);
          toast.success('Poster downloaded successfully!');
        }, 200);
      });
    } catch (error) {
      console.error('Error downloading poster:', error);
      toast.error('Failed to download poster');
    }
  };

  const downloadcert = async (seller) => {
    if (!seller.qrCode) {
      toast.error('QR code not available for this seller');
      return;
    }
    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      import('../components/RikoCraftcert.jsx').then(({ default: RikoCraftcert }) => {
        const root = createRoot(tempDiv);
        root.render(<RikoCraftcert qrSrc={seller.qrCode} />);
        setTimeout(async () => {
          const canvas = await html2canvas(tempDiv, { backgroundColor: null, useCORS: true });
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = url;
          link.download = `${seller.businessName}-poster.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          root.unmount();
          document.body.removeChild(tempDiv);
          toast.success('certificate downloaded successfully!');
        }, 200);
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };


  const handleDeleteSeller = async (sellerId) => {
    if (!window.confirm('Are you sure you want to delete this seller?')) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URLS.SELLER}/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete seller');
      toast.success('Seller deleted successfully');
      fetchSellers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete seller');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (seller) => {
    setEditingSeller(seller);
    setEditForm({
      businessName: seller.businessName || '',
      phone: seller.phone || '',
      address: seller.address || '',
      businessType: seller.businessType || '',
      location: seller.location || '',
      startingPrice: seller.startingPrice || 0,
      description: seller.description || '',
      maxPersonsAllowed: seller.maxPersonsAllowed || 50,
      amenity: seller.amenity ? (Array.isArray(seller.amenity) ? seller.amenity.join(', ') : seller.amenity) : '',
      totalHalls: seller.totalHalls || 1,
      enquiryDetails: seller.enquiryDetails || '',
      bookingOpens: seller.bookingOpens || '',
      workingTimes: seller.workingTimes || '',
      workingDates: seller.workingDates || '',
      foodType: seller.foodType ? (Array.isArray(seller.foodType) ? seller.foodType.join(', ') : seller.foodType) : '',
      roomsAvailable: seller.roomsAvailable || 1,
      bookingPolicy: seller.bookingPolicy || '',
      additionalFeatures: seller.additionalFeatures ? (Array.isArray(seller.additionalFeatures) ? seller.additionalFeatures.join(', ') : seller.additionalFeatures) : '',
      included: seller.included ? (Array.isArray(seller.included) ? seller.included.join('\n') : seller.included) : '',
      excluded: seller.excluded ? (Array.isArray(seller.excluded) ? seller.excluded.join('\n') : seller.excluded) : '',
      faq: seller.faq ? JSON.stringify(seller.faq) : '[]',
      blocked: !!seller.blocked,
      approved: !!seller.approved
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({ ...editForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      
      // Prepare the data for submission
      const updateData = {
        businessName: editForm.businessName,
        phone: editForm.phone,
        address: editForm.address,
        businessType: editForm.businessType,
        location: editForm.location,
        startingPrice: Number(editForm.startingPrice) || 0,
        description: editForm.description,
        maxPersonsAllowed: Number(editForm.maxPersonsAllowed) || 50,
        amenity: editForm.amenity ? editForm.amenity.split(',').map(item => item.trim()).filter(item => item) : [],
        totalHalls: Number(editForm.totalHalls) || 1,
        enquiryDetails: editForm.enquiryDetails,
        bookingOpens: editForm.bookingOpens,
        workingTimes: editForm.workingTimes,
        workingDates: editForm.workingDates,
        foodType: editForm.foodType ? editForm.foodType.split(',').map(item => item.trim()).filter(item => item) : [],
        roomsAvailable: Number(editForm.roomsAvailable) || 1,
        bookingPolicy: editForm.bookingPolicy,
        additionalFeatures: editForm.additionalFeatures ? editForm.additionalFeatures.split(',').map(item => item.trim()).filter(item => item) : [],
        included: editForm.included ? editForm.included.split(/[\n,]/).map(item => item.trim()).filter(item => item) : [],
        excluded: editForm.excluded ? editForm.excluded.split(/[\n,]/).map(item => item.trim()).filter(item => item) : [],
        faq: editForm.faq ? JSON.parse(editForm.faq) : [],
        email: editingSeller.email
      };

      // Update profile fields
      const response = await fetch(`${config.API_URLS.SELLER}/${editingSeller._id}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to update seller');
      
      // Update blocked status if changed
      if (editingSeller.blocked !== editForm.blocked) {
        const blockRes = await fetch(`${config.API_URLS.SELLER}/${editingSeller._id}/block`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ blocked: editForm.blocked }),
        });
        const blockData = await blockRes.json();
        if (!blockRes.ok || !blockData.success) throw new Error(blockData.message || 'Failed to update block status');
      }
      
      // Update approval status if changed
      if (editingSeller.approved !== editForm.approved) {
        const approvalRes = await fetch(`${config.API_URLS.SELLER}/${editingSeller._id}/approve`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ approved: editForm.approved }),
        });
        const approvalData = await approvalRes.json();
        if (!approvalRes.ok || !approvalData.success) throw new Error(approvalData.message || 'Failed to update approval status');
      }
      
      toast.success('Seller updated successfully');
      setEditingSeller(null);
      fetchSellers();
    } catch (err) {
      toast.error(err.message || 'Failed to update seller');
    } finally {
      setEditLoading(false);
    }
  };

  const getTotalWithdrawalAmount = (seller) => {
    if (!seller.withdrawals || seller.withdrawals.length === 0) return 0;
    return seller.withdrawals.reduce((total, withdrawal) => total + (withdrawal.amount || 0), 0);
  };

  const getWithdrawalRequestsCount = (seller) => {
    if (!seller.withdrawals) return 0;
    return seller.withdrawals.filter(w => w.status === 'pending').length;
  };

  // Helper function to get bank details from seller
  const getBankDetails = (seller) => {
    // Check if bankDetails object exists
    if (seller.bankDetails) {
      return {
        accountHolderName: seller.bankDetails.accountName || seller.accountHolderName || '',
        accountNumber: seller.bankDetails.accountNumber || seller.bankAccountNumber || '',
        ifscCode: seller.bankDetails.ifsc || seller.ifscCode || '',
        bankName: seller.bankDetails.bankName || seller.bankName || '',
        upi: seller.bankDetails.upi || seller.upi || ''
      };
    }
    
    // Fallback to individual fields
    return {
      accountHolderName: seller.accountHolderName || '',
      accountNumber: seller.bankAccountNumber || '',
      ifscCode: seller.ifscCode || '',
      bankName: seller.bankName || '',
      upi: seller.upi || ''
    };
  };

  // Handle withdrawal status updates
  const handleWithdrawalAction = async (withdrawalId, action, additionalData = {}) => {
    try {
      setWithdrawalActionLoading(withdrawalId);
      
      let url = '';
      let method = 'PATCH';
      let body = {};

      // Ensure withdrawalId is a string
      const withdrawalIdStr = withdrawalId?.toString();

      if (!withdrawalIdStr) {
        throw new Error('Invalid withdrawal ID');
      }

      switch (action) {
        case 'approve':
          url = `${config.API_URLS.WITHDRAWAL}/admin/approve/${withdrawalIdStr}`;
          break;
        case 'reject':
          url = `${config.API_URLS.WITHDRAWAL}/admin/reject/${withdrawalIdStr}`;
          body = { rejectionReason: additionalData.rejectionReason || 'Withdrawal request rejected' };
          break;
        case 'complete':
          url = `${config.API_URLS.WITHDRAWAL}/admin/complete/${withdrawalIdStr}`;
          break;
        default:
          throw new Error('Invalid action');
      }

      console.log('Making withdrawal action request:', {
        url,
        method,
        action,
        withdrawalId: withdrawalIdStr,
        body
      });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} withdrawal`);
      }

      if (!data.success) {
        throw new Error(data.message || `Failed to ${action} withdrawal`);
      }

      toast.success(`Withdrawal ${action}d successfully`);
      
      // Refresh sellers data to get updated withdrawal status
      await fetchSellers();
      
      // Update selected seller if viewing details
      if (selectedSeller) {
        try {
          const updatedSellersResponse = await fetch(`${config.API_URLS.SELLER}/all`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (updatedSellersResponse.ok) {
            const updatedSellersData = await updatedSellersResponse.json();
            if (updatedSellersData.success) {
              const updatedSeller = updatedSellersData.sellers.find(s => s._id === selectedSeller._id);
              if (updatedSeller) {
                setSelectedSeller(updatedSeller);
                console.log('Updated selected seller with new withdrawal status');
              }
            }
          }
        } catch (error) {
          console.error('Error updating selected seller:', error);
        }
      }
      
    } catch (error) {
      console.error(`Error ${action} withdrawal:`, error);
      toast.error(error.message || `Failed to ${action} withdrawal`);
    } finally {
      setWithdrawalActionLoading(null);
    }
  };

  const handleApprovalAction = async (sellerId, approved) => {
    try {
      const response = await fetch(`${config.API_URLS.SELLER}/${sellerId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ approved })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to ${approved ? 'approve' : 'disapprove'} seller`);
      }

      toast.success(`Seller ${approved ? 'approved' : 'disapproved'} successfully`);
      
      // Refresh sellers data
      await fetchSellers();
      
      // Update selected seller if viewing details
      if (selectedSeller && selectedSeller._id === sellerId) {
        try {
          const updatedSellersResponse = await fetch(`${config.API_URLS.SELLER}/all`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (updatedSellersResponse.ok) {
            const updatedSellersData = await updatedSellersResponse.json();
            if (updatedSellersData.success) {
              const updatedSeller = updatedSellersData.sellers.find(s => s._id === selectedSeller._id);
              if (updatedSeller) {
                setSelectedSeller(updatedSeller);
              }
            }
          }
        } catch (error) {
          console.error('Error updating selected seller:', error);
        }
      }
      
    } catch (error) {
      console.error(`Error updating approval status:`, error);
      toast.error(error.message || `Failed to update approval status`);
    }
  };

  const handleCommissionAction = async (commissionId, action, additionalData = {}) => {
    try {
      setCommissionActionLoading(commissionId);
      console.log(`Performing ${action} action on commission:`, commissionId);
      
      let url = '';
      let method = 'PUT';
      let body = {};
      
      switch (action) {
        case 'confirm':
          url = `${config.API_URLS.COMMISSION}/admin/confirm/${commissionId}`;
          break;
        case 'cancel':
          url = `${config.API_URLS.COMMISSION}/admin/cancel/${commissionId}`;
          body = { reason: additionalData.reason || 'No reason provided' };
          break;
        default:
          throw new Error('Invalid action');
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
      });
      
      const data = await response.json();
      console.log('Commission action response:', data);
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to ${action} commission`);
      }
      
      toast.success(`Commission ${action}ed successfully`);
      
      // Refresh the commissions list
      if (selectedSeller) {
        await fetchSellerCommissions(selectedSeller._id);
      }
      
    } catch (error) {
      console.error(`Error ${action}ing commission:`, error);
      toast.error(error.message || `Failed to ${action} commission`);
    } finally {
      setCommissionActionLoading(null);
    }
  };

  const sortSellers = (sellers) => {
    return [...sellers].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'joinedDate':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'withdrawalRequests':
          aValue = getWithdrawalRequestsCount(a);
          bValue = getWithdrawalRequestsCount(b);
          break;
        case 'totalWithdrawal':
          aValue = getTotalWithdrawalAmount(a);
          bValue = getTotalWithdrawalAmount(b);
          break;
        case 'businessName':
          aValue = a.businessName?.toLowerCase();
          bValue = b.businessName?.toLowerCase();
          break;
        case 'totalOrders':
          aValue = a.totalOrders || 0;
          bValue = b.totalOrders || 0;
          break;
        case 'totalCommission':
          aValue = a.totalCommission || 0;
          bValue = b.totalCommission || 0;
          break;
        case 'views':
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filterSellers = (sellers) => {
    if (filterBlocked === 'all') return sellers;
    return sellers.filter(seller => 
      filterBlocked === 'blocked' ? seller.blocked : !seller.blocked
    );
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const SortButton = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
    >
      {label}
      {sortBy === field && (
        sortOrder === 'asc' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />
      )}
    </button>
  );

  const filteredAndSortedSellers = sortSellers(filterSellers(sellers));

  // Fetch withdrawals for selected seller when modal opens
  useEffect(() => {
    if (showDetails && selectedSeller) {
      setSellerWithdrawalsLoading(true);
      fetch(`${config.API_URLS.WITHDRAWAL}/admin/by-seller/${selectedSeller._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          setSellerWithdrawals(data.withdrawals || []);
          setSellerWithdrawalsLoading(false);
        })
        .catch(() => setSellerWithdrawalsLoading(false));
    }
  }, [showDetails, selectedSeller]);

  // Fetch commissions for selected seller when modal opens
  useEffect(() => {
    if (showDetails && selectedSeller) {
      setSellerCommissionsLoading(true);
      fetchSellerCommissions(selectedSeller._id).finally(() => {
        setSellerCommissionsLoading(false);
      });
    }
  }, [showDetails, selectedSeller]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Hidden poster for download */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={posterRef}>
          <RikoCraftPoster qrSrc={currentQRCode} />
        </div>

        <div ref={certRef}>
          <RikoCraftcert qrSrc={currentQRCode} />
        </div>


        
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Venue Management</h1>
            <p className="mt-2 text-gray-600">View and manage all registered venues</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/seller/new')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add New Venue
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Sort Controls */}
      <div className="mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filterBlocked}
              onChange={(e) => setFilterBlocked(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Venues</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex gap-2">
              <SortButton field="joinedDate" label="Join Date" />
              <SortButton field="views" label="Views" />
           
            </div>
          </div>
          
       
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
               <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedSellers.map((seller) => (
                <motion.tr
            key={seller._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Seller Info */}
                  <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <FiUsers className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                        <div className="text-sm font-semibold text-gray-900">{seller.businessName}</div>
                        <div className="text-xs text-gray-500">ID: {seller._id.slice(-8)}</div>
                        <div className="text-xs text-gray-500">Joined: {new Date(seller.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <FiMail className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-900">{seller.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiPhone className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-900">{seller.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiMapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-900 truncate max-w-xs">{seller.address}</span>
                      </div>
                    </div>
                  </td>

                


                  {/* Status */}
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      {/* Approval Status */}
                      {seller.approved ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending Approval
                        </span>
                      )}
                      
                      {/* Block Status */}
                      {seller.blocked ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Active
                        </span>
                      )}
                      
                      {/* Approval Button */}
                      {!seller.approved && (
                        <button
                          onClick={() => handleApprovalAction(seller._id, true)}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                            title="Approve Venue"
                        >
                          <FiCheck className="w-3 h-3" />
                          Approve
                        </button>
                      )}
                      
                      


                </div>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <FiTrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {seller.views ? Math.floor(seller.views / 2) : 0}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSeller(seller);
                          setShowDetails(true);
                        }}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/seller/edit/${seller._id}`)}
                        className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
                        title="Edit Venue"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSeller(seller._id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                        title="Delete Venue"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
                </div>
                </div>

      {filteredAndSortedSellers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-gray-500 text-lg">No venues found</p>
                </div>
      )}

      {/* Seller Details Modal */}
      {showDetails && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Venue  Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
                </div>
            
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FiTag className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Business Name:</span>
                      <span className="text-gray-900">{selectedSeller.businessName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-900">{selectedSeller.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Phone:</span>
                      <span className="text-gray-900">{selectedSeller.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Address:</span>
                      <span className="text-gray-900">{selectedSeller.address || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-700">Joined:</span>
                      <span className="text-gray-900">{new Date(selectedSeller.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Business Type:</span>
                      <span className="text-gray-900">{selectedSeller.businessType || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Approval Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedSeller.approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedSeller.approved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Account Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedSeller.blocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedSeller.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-green-600" />
                  Venue Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Starting Price:</span>
                      <p className="text-gray-900 mt-1">₹{selectedSeller.startingPrice || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Max Persons Allowed:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.maxPersonsAllowed || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Halls:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.totalHalls || 1}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Rooms Available:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.roomsAvailable || 1}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Enquiry Details:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.enquiryDetails || 'No enquiry details provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities & Features */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiTag className="w-5 h-5 text-purple-600" />
                  Amenities & Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Amenities</h4>
                    {selectedSeller.amenity && selectedSeller.amenity.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSeller.amenity.map((amenity, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No amenities listed</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Additional Features</h4>
                    {selectedSeller.additionalFeatures && selectedSeller.additionalFeatures.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSeller.additionalFeatures.map((feature, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No additional features listed</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-orange-600" />
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Working Times:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.workingTimes || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Working Dates:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.workingDates || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Booking Opens:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.bookingOpens || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Booking Policy:</span>
                      <p className="text-gray-900 mt-1">{selectedSeller.bookingPolicy || 'No policy specified'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Food Type */}
              {selectedSeller.foodType && selectedSeller.foodType.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiTag className="w-5 h-5 text-red-600" />
                    Food Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeller.foodType.map((food, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Included Items */}
              {selectedSeller.included && selectedSeller.included.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiCheck className="w-5 h-5 text-green-600" />
                    What's Included
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeller.included.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Excluded Items */}
              {selectedSeller.excluded && selectedSeller.excluded.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiXCircle className="w-5 h-5 text-red-600" />
                    What's Not Included
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeller.excluded.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                        ✗ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {selectedSeller.faq && selectedSeller.faq.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiTag className="w-5 h-5 text-indigo-600" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {selectedSeller.faq.map((faqItem, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Q: {faqItem.question}</h4>
                        <p className="text-gray-700">A: {faqItem.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

         

              {/* Business Images */}
              {Array.isArray(selectedSeller.images) && selectedSeller.images.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiImage className="w-5 h-5 text-indigo-600" />
                    Business Images ({selectedSeller.images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedSeller.images.map((image, index) => {
                      // Support both string and object formats
                      const imageUrl = typeof image === 'string' ? image : image?.url;
                      const imageAlt = typeof image === 'object' && image?.alt ? image.alt : `Business image ${index + 1}`;
                      if (!imageUrl) return null;
                      return (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={imageAlt}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <button
                              onClick={() => window.open(imageUrl, '_blank')}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-80 p-2 rounded-full"
                              title="View full size"
                            >
                              <FiEye className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>
                          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">Click on any image to view it in full size</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiImage className="w-5 h-5 text-indigo-600" />
                    Business Images
                  </h3>
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No images uploaded yet</p>
                    <p className="text-sm text-gray-400">This seller hasn't uploaded any business images</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Seller Modal */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Venue Details</h2>
              <button
                onClick={() => setEditingSeller(null)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={editForm.businessName}
                      onChange={handleEditChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                    <input
                      type="text"
                      name="businessType"
                      value={editForm.businessType}
                      onChange={handleEditChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-green-600" />
                  Venue Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleEditChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Starting Price (₹)</label>
                    <input
                      type="number"
                      name="startingPrice"
                      value={editForm.startingPrice}
                      onChange={handleEditChange}
                      min="0"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Persons Allowed</label>
                    <input
                      type="number"
                      name="maxPersonsAllowed"
                      value={editForm.maxPersonsAllowed}
                      onChange={handleEditChange}
                      min="1"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Halls</label>
                    <input
                      type="number"
                      name="totalHalls"
                      value={editForm.totalHalls}
                      onChange={handleEditChange}
                      min="1"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rooms Available</label>
                    <input
                      type="number"
                      name="roomsAvailable"
                      value={editForm.roomsAvailable}
                      onChange={handleEditChange}
                      min="1"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enquiry Details</label>
                    <textarea
                      name="enquiryDetails"
                      value={editForm.enquiryDetails}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities & Features */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiTag className="w-5 h-5 text-purple-600" />
                  Amenities & Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma-separated)</label>
                    <textarea
                      name="amenity"
                      value={editForm.amenity}
                      onChange={handleEditChange}
                      rows="3"
                      placeholder="e.g., Parking, AC, WiFi, Catering"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Features (comma-separated)</label>
                    <textarea
                      name="additionalFeatures"
                      value={editForm.additionalFeatures}
                      onChange={handleEditChange}
                      rows="3"
                      placeholder="e.g., Stage, Sound System, Lighting"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-orange-600" />
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Times</label>
                    <input
                      type="text"
                      name="workingTimes"
                      value={editForm.workingTimes}
                      onChange={handleEditChange}
                      placeholder="e.g., 9:00 AM - 11:00 PM"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Working Dates</label>
                    <input
                      type="text"
                      name="workingDates"
                      value={editForm.workingDates}
                      onChange={handleEditChange}
                      placeholder="e.g., Monday to Sunday"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking Opens</label>
                    <input
                      type="text"
                      name="bookingOpens"
                      value={editForm.bookingOpens}
                      onChange={handleEditChange}
                      placeholder="e.g., 3 months in advance"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking Policy</label>
                    <textarea
                      name="bookingPolicy"
                      value={editForm.bookingPolicy}
                      onChange={handleEditChange}
                      rows="3"
                      placeholder="Enter booking terms and conditions"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Food Options */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiTag className="w-5 h-5 text-red-600" />
                  Food Options
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Food Types (comma-separated)</label>
                  <textarea
                    name="foodType"
                    value={editForm.foodType}
                    onChange={handleEditChange}
                    rows="3"
                    placeholder="e.g., Vegetarian, Non-Vegetarian, Jain, Continental"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Included/Excluded/FAQ Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiTag className="w-5 h-5 text-indigo-600" />
                  Package Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Included Items (comma or line separated)</label>
                    <textarea
                      name="included"
                      value={editForm.included}
                      onChange={handleEditChange}
                      rows="4"
                      placeholder="Welcome Drink, Decorations, Music System&#10;or&#10;Welcome Drink&#10;Decorations&#10;Music System"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate items with commas or press Enter for new line. Each item will be shown on a separate line.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excluded Items (comma or line separated)</label>
                    <textarea
                      name="excluded"
                      value={editForm.excluded}
                      onChange={handleEditChange}
                      rows="4"
                      placeholder="Catering, Photography, Transport&#10;or&#10;Catering&#10;Photography&#10;Transport"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate items with commas or press Enter for new line. Each item will be shown on a separate line.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      FAQ (JSON format: [{`{"question": "Q1", "answer": "A1"}`}])
                    </label>
                    <textarea
                      name="faq"
                      value={editForm.faq}
                      onChange={handleEditChange}
                      rows="5"
                      placeholder='[{"question": "What is the cancellation policy?", "answer": "Full refund if cancelled 7 days before"}]'
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Status Controls */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCheck className="w-5 h-5 text-green-600" />
                  Status Controls
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="approved"
                      checked={editForm.approved}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">Approved</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="blocked"
                      checked={editForm.blocked}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700">Blocked</label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingSeller(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Venue'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     
    </div>
  );
};

export default SellerManagement; 