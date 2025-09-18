import React from 'react'

const UploadSlot = () => {
  return (
    <div className="bg-gradient-to-b from-orange-800 to-orange-900 border-2 border-dashed border-orange-400 rounded-lg p-6 shadow-lg w-64">
      <div className="text-center">
        <svg className="w-12 h-12 text-orange-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-orange-200 text-sm font-medium">
          Upload or drag an image
        </p>
      </div>
    </div>
  )
}

export default UploadSlot
