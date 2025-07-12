import React, { useState, useEffect } from 'react'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Toast } from '../components/ui/Toast'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

const AdminPanel = () => {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Show welcome toast when component mounts
  useEffect(() => {
    setToastMessage('Welcome to Admin Panel! You can manage all item listings here.')
    setShowToast(true)
  }, [])

  const [items, setItems] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  // Load items from API
  useEffect(() => {
    let isMounted = true;
    
    const loadItems = async () => {
      try {
        setIsLoading(true)
        console.log('Loading items...')
        const response = await adminAPI.getPendingItems()
        console.log('Items response:', response)
        
        if (isMounted) {
          setItems(response.data || [])
          
          // Calculate stats
          const total = response.data?.length || 0
          const pending = response.data?.filter(item => item.status === 'pending').length || 0
          const approved = response.data?.filter(item => item.status === 'approved').length || 0
          const rejected = response.data?.filter(item => item.status === 'rejected').length || 0
          
          setStats({ total, pending, approved, rejected })
        }
      } catch (error) {
        console.error('Failed to load items:', error)
        if (isMounted) {
          toast.error(error.response?.data?.message || 'Failed to load items')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    loadItems()
    
    return () => {
      isMounted = false;
    }
  }, [])

  const handleApprove = async (itemId) => {
    try {
      setIsLoading(true)
      console.log('Approving item:', itemId)
      const response = await adminAPI.approveItem(itemId, { status: 'approved' })
      console.log('Approve response:', response)
      
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'approved' } : item
      ))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }))
      
      toast.success('Item approved successfully!')
    } catch (error) {
      console.error('Failed to approve item:', error)
      toast.error(error.response?.data?.message || 'Failed to approve item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (itemId) => {
    try {
      setIsLoading(true)
      console.log('Rejecting item:', itemId)
      const response = await adminAPI.approveItem(itemId, { status: 'rejected' })
      console.log('Reject response:', response)
      
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'rejected' } : item
      ))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }))
      
      toast.success('Item rejected successfully!')
    } catch (error) {
      console.error('Failed to reject item:', error)
      toast.error(error.response?.data?.message || 'Failed to reject item')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (itemId) => {
    try {
      setIsLoading(true)
      console.log('Removing item:', itemId)
      const response = await adminAPI.removeItem(itemId)
      console.log('Remove response:', response)
      
      // Remove item from the list
      setItems(prev => prev.filter(item => item.id !== itemId))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        pending: prev.pending - (items.find(item => item.id === itemId)?.status === 'pending' ? 1 : 0),
        approved: prev.approved - (items.find(item => item.id === itemId)?.status === 'approved' ? 1 : 0),
        rejected: prev.rejected - (items.find(item => item.id === itemId)?.status === 'rejected' ? 1 : 0)
      }))
      
      toast.success('Item removed successfully!')
    } catch (error) {
      console.error('Failed to remove item:', error)
      toast.error(error.response?.data?.message || 'Failed to remove item')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status === filter
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.uploader?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage item listings and community content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search items, uploaders, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setFilter('all')}
                variant={filter === 'all' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                All ({stats.total})
              </Button>
              <Button
                onClick={() => setFilter('pending')}
                variant={filter === 'pending' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Pending ({stats.pending})
              </Button>
              <Button
                onClick={() => setFilter('approved')}
                variant={filter === 'approved' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approved ({stats.approved})
              </Button>
              <Button
                onClick={() => setFilter('rejected')}
                variant={filter === 'rejected' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Rejected ({stats.rejected})
              </Button>
            </div>
          </div>
        </Card>

        {/* Items Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={item.images?.[0] || "https://via.placeholder.com/48x48"}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500">ID: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.uploader?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.type === 'points' ? `${item.pointCost} points` : 'Swap'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={getStatusBadge(item.status)}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        
                        {item.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleApprove(item.id)}
                              disabled={isLoading}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(item.id)}
                              disabled={isLoading}
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {/* Remove button - available for all items */}
                        <Button
                          onClick={() => handleRemove(item.id)}
                          disabled={isLoading}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </Card>
      </div>

      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </div>
  )
}

export default AdminPanel 