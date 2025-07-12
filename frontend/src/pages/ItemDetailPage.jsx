import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Share2, ArrowLeft, Star, MapPin, Calendar, Tag } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { itemsAPI } from '../services/api'
import { useAuthStore } from '../lib/store'
import toast from 'react-hot-toast'

const ItemDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  
  // Debug logging
  console.log('ItemDetailPage received id:', id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  // Fetch item details from backend
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check if id is valid
        if (!id || id === 'undefined') {
          setError('Invalid item ID')
          setLoading(false)
          return
        }
        
        const response = await itemsAPI.getItem(id)
        setItem(response.data)
        setLikeCount(response.data.likes || 0)
        // Check if current user has liked this item
        if (isAuthenticated && response.data.likes && Array.isArray(response.data.likes)) {
          const userLiked = response.data.likes.some(like => 
            typeof like === 'string' ? like === user?._id : like._id === user?._id
          )
          setIsLiked(userLiked)
        }
      } catch (err) {
        console.error('Error fetching item:', err)
        setError(err.response?.data?.message || 'Failed to load item details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchItem()
    }
  }, [id, isAuthenticated, user?._id])

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like items')
      navigate('/login')
      return
    }

    try {
      setIsLoading(true)
      const response = await itemsAPI.toggleLike(id)
      setIsLiked(response.data.isLiked)
      setLikeCount(response.data.likes)
      toast.success(response.data.isLiked ? 'Added to likes' : 'Removed from likes')
    } catch (error) {
      toast.error('Failed to update like')
      console.error('Like error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwapRequest = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to request a swap')
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      // This would be implemented when swap functionality is ready
      toast.success('Swap request sent successfully!')
    } catch (error) {
      toast.error('Failed to send swap request')
      console.error('Swap request error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRedeemPoints = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to redeem with points')
      navigate('/login')
      return
    }

    setIsLoading(true)
    try {
      // This would be implemented when points redemption is ready
      toast.success('Item redeemed with points successfully!')
    } catch (error) {
      toast.error('Failed to redeem item')
      console.error('Redemption error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextImage = () => {
    if (item && item.images) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
    }
  }

  const prevImage = () => {
    if (item && item.images) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/browse" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading item details...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/browse" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
          <div className="bg-white rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Item</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Item not found
  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/browse" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
          <div className="bg-white rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h1>
            <p className="text-gray-600">The item you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    )
  }

  // Item not available (only show approved items)
  if (item.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/browse" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
          <div className="bg-white rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Item Not Available</h1>
            <p className="text-gray-600">
              {item.status === 'pending' && 'This item is pending approval.'}
              {item.status === 'rejected' && 'This item has been rejected.'}
              {item.status === 'swapped' && 'This item has been swapped.'}
              {!['pending', 'rejected', 'swapped'].includes(item.status) && 'This item is not available.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link to="/browse" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={item.images?.[currentImageIndex] || '/placeholder-image.jpg'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {item.images && item.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={handleLike}
                  disabled={isLoading}
                  className={`bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors ${
                    isLiked ? 'text-red-500' : 'text-gray-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button className="bg-white/80 hover:bg-white p-2 rounded-full shadow-lg">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                {item.type === 'points' ? (
                  <span className="text-2xl font-bold text-green-600">{item.pointCost} points</span>
                ) : (
                  <span className="text-2xl font-bold text-green-600">Swap Available</span>
                )}
              </div>
            </div>

            {/* Uploader Info */}
            {item.uploader && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.uploader.avatarUrl || '/default-avatar.jpg'}
                    alt={item.uploader.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.uploader.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Member since {new Date(item.uploader.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Item Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Tag className="w-4 h-4" />
                <span>Category: {item.category}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>Size: {item.size}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>Condition: {item.condition}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span>Type: {item.type}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Listed {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Heart className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                <span>{likeCount} likes</span>
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSwapRequest}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Sending Request...' : 'Swap Request'}
              </Button>
              {item.type === 'points' && (
                <Button
                  onClick={handleRedeemPoints}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? 'Processing...' : 'Redeem via Points'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetailPage 