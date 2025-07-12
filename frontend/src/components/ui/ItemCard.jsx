import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Share2, Eye, Package, User, MapPin, Coins } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { itemsAPI } from '../../services/api'
import { useAuthStore } from '../../lib/store'
import toast from 'react-hot-toast'
import SwapStatusBadge from './SwapStatusBadge'

const ItemCard = ({ 
  item, 
  onSwap, 
  onRedeem, 
  onShare,
  showActions = true,
  className = "",
  onLikeUpdate
}) => {
  const { isAuthenticated } = useAuthStore()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(item.likes || 0)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  const {
    id,
    title,
    category,
    type,
    size,
    condition,
    pointCost,
    views = 0,
    status = "approved",
    images,
    tags = []
  } = item

  // Debug logging
  console.log('ItemCard received item:', item);
  console.log('ItemCard id:', id);

  const handleSwap = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSwap?.(id)
  }

  const handleRedeem = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onRedeem?.(id)
  }

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Please login to like items')
      return
    }

    try {
      setIsLikeLoading(true)
      const response = await itemsAPI.toggleLike(id)
      setIsLiked(response.data.isLiked)
      setLikeCount(response.data.likes)
      onLikeUpdate?.(id, response.data.likes)
      toast.success(response.data.isLiked ? 'Added to likes' : 'Removed from likes')
    } catch (error) {
      toast.error('Failed to update like')
      console.error('Like error:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onShare?.(id)
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${className}`}>
      <Link to={`/items/${id}`} className="block">
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {images && images.length > 0 && images[0].startsWith('http') ? (
              <img 
                src={images[0]} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-4xl">No Image</div>
            )}
          </div>
          
          <div className="absolute top-3 right-3 flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 bg-white/80 hover:bg-white transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-600'
              }`}
              onClick={handleLike}
              disabled={isLikeLoading}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white/80 hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-3 left-3">
            <SwapStatusBadge status={status} />
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="flex items-center space-x-2">
            <span>{category}</span>
            <span>•</span>
            <span>{type}</span>
            <span>•</span>
            <span>{size}</span>
          </CardDescription>
        </CardHeader>
      </Link>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Condition:</span>
            <span className="font-medium">{condition}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Points:</span>
            <span className="font-medium text-green-600">{pointCost || 0} pts</span>
          </div>
          
          {/* Owner and location info removed as not provided by backend */}
          
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Heart className={`h-3 w-3 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{views}</span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleSwap}
              >
                <Package className="mr-1 h-3 w-3" />
                Swap
              </Button>
              <Button 
                size="sm"
                onClick={handleRedeem}
                className="flex items-center"
              >
                <Coins className="mr-1 h-3 w-3" />
                {pointCost || 0}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ItemCard 