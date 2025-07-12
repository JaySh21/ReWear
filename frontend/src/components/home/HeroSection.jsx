import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { ArrowRight, ShoppingBag, Search, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../lib/store'

const HeroSection = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const handleStartSwapping = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              >
                Sustainable Fashion
                <span className="text-green-600 block">for Everyone</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-600 max-w-lg"
              >
                Join our community clothing exchange platform. Swap, share, and discover 
                sustainable fashion while reducing waste and building connections.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-4 rounded-r-lg"
              >
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Ready to Make a Difference?
                </p>
                <p className="text-gray-600">
                  Join thousands of people who are already swapping clothes and making sustainable choices.
                </p>
              </motion.div>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                onClick={handleStartSwapping}
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {isAuthenticated ? 'Go to Dashboard' : 'Start Swapping'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Link to="/browse">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-gray-300 hover:border-green-600 text-gray-700 hover:text-green-600 px-8 py-3 text-lg font-semibold"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Browse Items
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center space-x-6 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free to join</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Eco-friendly</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Community-driven</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                {/* Placeholder for clothing items */}
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 h-32 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-green-600" />
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 h-32 flex items-center justify-center">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 h-32 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-purple-600" />
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 h-32 flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-3">
                <span className="text-sm font-bold">♻️</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white rounded-full p-3">
                <span className="text-sm font-bold">💚</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection 