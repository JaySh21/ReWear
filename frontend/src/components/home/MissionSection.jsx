import React from 'react'
import { motion } from 'framer-motion'
import { Leaf, Users, Globe, TrendingUp, Heart, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../lib/store'
import toast from 'react-hot-toast'

const MissionSection = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const stats = [
    { icon: Leaf, value: "92%", label: "Reduced Carbon Footprint", description: "Compared to buying new" },
    { icon: Users, value: "10K+", label: "Community Members", description: "Active swappers worldwide" },
    { icon: Globe, value: "50K+", label: "Items Swapped", description: "Keeping clothes in circulation" },
    { icon: TrendingUp, value: "85%", label: "Cost Savings", description: "Average savings per swap" }
  ]

  const benefits = [
    {
      icon: Heart,
      title: "Environmental Impact",
      description: "Every swapped item reduces textile waste and the demand for new clothing production, helping protect our planet."
    },
    {
      icon: Zap,
      title: "Economic Benefits",
      description: "Save money while getting quality clothing. No need to buy new when you can swap for what you need."
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Connect with like-minded individuals who share your values for sustainable living and fashion."
    },
    {
      icon: Leaf,
      title: "Circular Economy",
      description: "Participate in a circular fashion economy where clothes get multiple lives instead of ending up in landfills."
    }
  ]

  const handleStartSwapping = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleLearnMore = () => {
    navigate('/about')
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why Sustainable Fashion Matters
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            The fashion industry is one of the largest polluters globally. By participating in clothing swaps, 
            you're not just getting new-to-you clothes—you're making a positive impact on the environment 
            and building a more sustainable future for everyone.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <stat.icon className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Make a Difference?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of people who are already swapping clothes and making sustainable choices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleStartSwapping}
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Swapping Today'}
              </button>
              <button 
                onClick={handleLearnMore}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default MissionSection 