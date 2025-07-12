import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { 
  Repeat, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  Eye,
  Package
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SwapsSection = () => {
  const [activeTab, setActiveTab] = useState('ongoing')

  const ongoingSwaps = [
    {
      id: 1,
      type: 'outgoing',
      item: {
        title: "Vintage Denim Jacket",
        category: "Outerwear",
        image: "👕"
      },
      swapWith: {
        title: "Summer Floral Dress",
        category: "Dresses",
        image: "👗",
        owner: "Emma L."
      },
      status: "requested",
      createdAt: "2024-01-20",
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      type: 'incoming',
      item: {
        title: "Classic White Sneakers",
        category: "Footwear",
        image: "👟"
      },
      swapWith: {
        title: "Cozy Knit Sweater",
        category: "Sweaters",
        image: "🧥",
        owner: "Mike R."
      },
      status: "accepted",
      createdAt: "2024-01-18",
      lastActivity: "1 day ago"
    },
    {
      id: 3,
      type: 'outgoing',
      item: {
        title: "Leather Crossbody Bag",
        category: "Accessories",
        image: "👜"
      },
      swapWith: {
        title: "High-Waist Jeans",
        category: "Bottoms",
        image: "👖",
        owner: "Anna S."
      },
      status: "rejected",
      createdAt: "2024-01-15",
      lastActivity: "3 days ago"
    }
  ]

  const completedSwaps = [
    {
      id: 4,
      type: 'outgoing',
      item: {
        title: "Vintage Denim Jacket",
        category: "Outerwear",
        image: "👕"
      },
      swapWith: {
        title: "Summer Floral Dress",
        category: "Dresses",
        image: "👗",
        owner: "Emma L."
      },
      completedAt: "2024-01-10",
      pointsEarned: 50
    },
    {
      id: 5,
      type: 'incoming',
      item: {
        title: "Classic White Sneakers",
        category: "Footwear",
        image: "👟"
      },
      swapWith: {
        title: "Cozy Knit Sweater",
        category: "Sweaters",
        image: "🧥",
        owner: "Mike R."
      },
      completedAt: "2024-01-05",
      pointsEarned: 45
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'requested':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'requested':
        return 'Pending Response'
      case 'accepted':
        return 'Swap Accepted'
      case 'rejected':
        return 'Swap Rejected'
      default:
        return status
    }
  }

  const handleSwapAction = (swapId, action) => {
    // Handle swap actions (accept, reject, etc.)
    console.log(`${action} swap ${swapId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Swaps</h1>
          <p className="text-gray-600">Track your ongoing and completed clothing swaps</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'ongoing'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Ongoing Swaps ({ongoingSwaps.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed Swaps ({completedSwaps.length})
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'ongoing' ? (
          <motion.div
            key="ongoing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {ongoingSwaps.map((swap, index) => (
              <motion.div
                key={swap.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-2xl">{swap.item.image}</div>
                          </div>
                          <div className="text-center">
                            <Repeat className="h-4 w-4 text-gray-400 mx-auto" />
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mt-2">
                              <div className="text-2xl">{swap.swapWith.image}</div>
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-2xl">{swap.swapWith.image}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {swap.item.title}
                            </span>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="text-sm font-medium text-gray-900">
                              {swap.swapWith.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{swap.item.category}</span>
                            <span>•</span>
                            <span>{swap.swapWith.category}</span>
                            {swap.type === 'incoming' && (
                              <>
                                <span>•</span>
                                <span>from {swap.swapWith.owner}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            {getStatusIcon(swap.status)}
                            <span className={getStatusColor(swap.status)}>
                              {getStatusText(swap.status)}
                            </span>
                            <span>•</span>
                            <span>{swap.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        {swap.status === 'requested' && swap.type === 'incoming' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleSwapAction(swap.id, 'accept')}
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSwapAction(swap.id, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {ongoingSwaps.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ongoing swaps</h3>
                    <p className="text-gray-500 mb-4">
                      Start browsing items to find something you'd like to swap for
                    </p>
                    <Button>
                      <Package className="mr-2 h-4 w-4" />
                      Browse Items
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {completedSwaps.map((swap, index) => (
              <motion.div
                key={swap.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-2xl">{swap.item.image}</div>
                          </div>
                          <div className="text-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mt-2">
                              <div className="text-2xl">{swap.swapWith.image}</div>
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-2xl">{swap.swapWith.image}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {swap.item.title}
                            </span>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="text-sm font-medium text-gray-900">
                              {swap.swapWith.title}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{swap.item.category}</span>
                            <span>•</span>
                            <span>{swap.swapWith.category}</span>
                            {swap.type === 'incoming' && (
                              <>
                                <span>•</span>
                                <span>from {swap.swapWith.owner}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>Completed {new Date(swap.completedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-green-600">+{swap.pointsEarned} points earned</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {completedSwaps.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed swaps</h3>
                    <p className="text-gray-500 mb-4">
                      Complete your first swap to see it here
                    </p>
                    <Button>
                      <Package className="mr-2 h-4 w-4" />
                      Browse Items
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SwapsSection 