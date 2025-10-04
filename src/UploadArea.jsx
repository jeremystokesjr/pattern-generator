import React, { useRef, useState, useEffect } from 'react'
import ImagePlaceholder from './ImagePlaceholder'

const UploadArea = ({ uploadedImage, onImageUpload, isExtractingMetadata }) => {
  const fileInputRef = useRef(null)
  const [showCartridge, setShowCartridge] = useState(false)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      await onImageUpload(file)
    } else {
      alert('Please select an image file')
    }
  }

  // Handle showing cartridge after loading animation completes one cycle
  useEffect(() => {
    if (uploadedImage && !isExtractingMetadata) {
      // Wait for one animation cycle (1 second) before showing cartridge
      const timer = setTimeout(() => {
        setShowCartridge(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else if (!uploadedImage) {
      // Reset when no image is uploaded
      setShowCartridge(false)
    }
  }, [uploadedImage, isExtractingMetadata])

  return (
    <div 
      className="w-[212px] h-[255px] bg-[#3A2F2A] border-2 border-dashed border-[#FF9966] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {isExtractingMetadata ? (
        <div className="flex flex-col items-center justify-center">
          {/* Dot-matrix style loading animation */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '800ms' }}></div>
          </div>
        </div>
      ) : uploadedImage && showCartridge ? (
        <ImagePlaceholder uploadedImage={uploadedImage} />
      ) : uploadedImage && !showCartridge ? (
        <div className="flex flex-col items-center justify-center">
          {/* Continue showing loading animation for one more cycle */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '800ms' }}></div>
          </div>
        </div>
      ) : (
        <span className="text-white text-lg font-medium">Upload an image</span>
      )}
    </div>
  )
}

export default UploadArea
