import React from 'react'

const SwapStatusBadge = ({ status }) => {
  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'swapped':
        return 'bg-blue-100 text-blue-800'
      case 'redeemed':
        return 'bg-purple-100 text-purple-800'
      case 'unavailable':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(status)}`}>
      {status || 'Unknown'}
    </span>
  )
}

export default SwapStatusBadge 