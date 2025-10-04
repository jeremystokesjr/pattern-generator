import React, { useState } from 'react'
import ConsoleFrame from './ConsoleFrame'
import UploadArea from './UploadArea'
import { extractRealMetadata } from './utils/metadataExtractor'

function App() {
  console.log('App component is rendering')
  
  // State for uploaded image
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imageMetadata, setImageMetadata] = useState(null)
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false)
  
  // State for control values
  const [patternType, setPatternType] = useState('wave') // 'wave', 'bump', 'contour'
  const [frequency, setFrequency] = useState(3)
  const [rotation, setRotation] = useState(0) // Test: 0° = normal, -90° = left, +90° = right, -180°/+180° = full rotation
  const [scale, setScale] = useState(1)
  const [tint, setTint] = useState('#FFFFFF') // white for no tint, or color value
  const [removeBackground, setRemoveBackground] = useState(false) // background removal toggle
  const [zoom, setZoom] = useState(0) // zoom level: 0 = no zoom, positive = zoom in, negative = zoom out
  const [animationSpeed, setAnimationSpeed] = useState(0) // animation speed: 1.0 = normal speed, 0.1 = slow, 3.0 = fast

  // Remove background from image
  const removeImageBackground = (image) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      canvas.width = image.width
      canvas.height = image.height
      
      // Draw the original image
      ctx.drawImage(image, 0, 0)
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // Simple background removal algorithm
      // This assumes the background is white or very light
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        // Calculate brightness
        const brightness = (r + g + b) / 3
        
        // If pixel is very bright (likely background), make it transparent
        if (brightness > 240) {
          data[i + 3] = 0 // Set alpha to 0 (transparent)
        }
        // Optional: also remove very light colors
        else if (brightness > 220 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30) {
          data[i + 3] = 0
        }
      }
      
      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0)
      
      // Create new image from processed canvas
      const processedImg = new Image()
      processedImg.onload = () => resolve(processedImg)
      processedImg.src = canvas.toDataURL()
    })
  }

  // Handle image upload
  const handleImageUpload = async (imageFile) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const img = new Image()
      img.onload = async () => {
        try {
          // Extract metadata from the uploaded image
          console.log('Extracting metadata from uploaded image...')
          setIsExtractingMetadata(true)
          const metadata = await extractRealMetadata(imageFile, img)
          setImageMetadata(metadata)
          console.log('Metadata extracted:', metadata)
        } catch (error) {
          console.error('Error extracting metadata:', error)
          setImageMetadata(null)
        } finally {
          setIsExtractingMetadata(false)
        }

        // Process the image (with or without background removal)
        if (removeBackground) {
          const processedImg = await removeImageBackground(img)
          setUploadedImage(processedImg)
        } else {
          setUploadedImage(img)
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(imageFile)
  }

  // Handle control changes
  const handlePatternTypeChange = (type) => {
    setPatternType(type)
    console.log('Pattern Type:', type)
  }

  const handleFrequencyChange = (value) => {
    setFrequency(value)
    console.log('Frequency:', value)
  }

  const handleRotationChange = (value) => {
    setRotation(value)
    console.log('Rotation:', value)
  }

  const handleScaleChange = (value) => {
    setScale(value)
    console.log('Scale:', value)
  }


  const handleTintChange = (color) => {
    setTint(color)
    console.log('Tint:', color)
  }

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom)
    console.log('Zoom:', newZoom)
  }

  const handleAnimationSpeedChange = (newAnimationSpeed) => {
    setAnimationSpeed(newAnimationSpeed)
    console.log('Animation Speed:', newAnimationSpeed)
  }

  // Handle image removal
  const handleImageRemove = () => {
    setUploadedImage(null)
    setImageMetadata(null)
    console.log('Image removed')
  }

  // Handle background removal toggle
  const handleRemoveBackgroundChange = (value) => {
    setRemoveBackground(value)
    console.log('Remove Background:', value)
  }

  return (
    <div className="min-h-screen bg-[#222222] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Layout - Console and Upload Area */}
        <div className="flex justify-center items-start gap-8">
          <ConsoleFrame 
            uploadedImage={uploadedImage}
            imageMetadata={imageMetadata}
            isExtractingMetadata={isExtractingMetadata}
            patternType={patternType}
            frequency={frequency}
            rotation={rotation}
            scale={scale}
            tint={tint}
            removeBackground={removeBackground}
            zoom={zoom}
            animationSpeed={animationSpeed}
            onPatternTypeChange={handlePatternTypeChange}
            onFrequencyChange={handleFrequencyChange}
            onRotationChange={handleRotationChange}
            onScaleChange={handleScaleChange}
            onTintChange={handleTintChange}
            onZoomChange={handleZoomChange}
            onAnimationSpeedChange={handleAnimationSpeedChange}
            onImageRemove={handleImageRemove}
            onRemoveBackgroundChange={handleRemoveBackgroundChange}
          />
          <UploadArea uploadedImage={uploadedImage} onImageUpload={handleImageUpload} />
        </div>
        
        {/* Footer */}
        
      </div>
    </div>
  )
}

export default App
