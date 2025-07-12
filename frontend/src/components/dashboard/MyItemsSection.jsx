import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  Share2, 
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { useAuthStore } from '../../lib/store'
import toast from 'react-hot-toast'

const MyItemsSection = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Fetch dashboard data (includes only user's items)
        const res = await adminAPI.getDashboard()
        setItems(res.data?.items || [])
      } catch (err) {
        setError('Failed to load your items')
      } finally {
        setIsLoading(false)
      }
    }
    fetchItems()
  }, [])

  const handleDelete = (id) => {
    setItems(items.filter(item => item._id !== id))
  }

  const handleViewItem = (itemId) => {
    navigate(`/items/${itemId}`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'listed':
        return 'bg-green-100 text-green-800'
      case 'reserved':
        return 'bg-blue-100 text-blue-800'
      case 'swapped':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.status?.toLowerCase() === filter.toLowerCase()
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading your items...</div>
  }
  if (error) {
    return <div className="py-12 text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
          <p className="text-gray-600">Manage your listed items and track their performance</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          List New Item
        </Button>
      </div>
      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'listed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('listed')}
              >
                Listed
              </Button>
              <Button
                variant={filter === 'reserved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('reserved')}
              >
                Reserved
              </Button>
              <Button
                variant={filter === 'swapped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('swapped')}
              >
                Swapped
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleViewItem(item._id)}
              >
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-gray-400 text-4xl">{item.images && item.images[0] ? <img src={item.images[0]} alt={item.title} className="h-16 w-16 object-cover rounded" /> : <Package />}</div>
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/80 hover:bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/80 hover:bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>{item.status}</span>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.category}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Condition:</span>
                      <span className="font-medium">{item.condition}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Listed:</span>
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Views:</span>
                      <span>{item.views}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Likes:</span>
                      <span>{item.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewItem(item._id)
                        }}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item._id)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by listing your first item to swap'
                }
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                List Your First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MyItemsSection 