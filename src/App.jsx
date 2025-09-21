import React, { useState } from 'react'
import ConsoleFrame from './ConsoleFrame'
import UploadArea from './UploadArea'

function App() {
  // State for uploaded image
  const [uploadedImage, setUploadedImage] = useState(null)
  
  // State for control values
  const [patternType, setPatternType] = useState('radial') // 'radial', 'grid', 'tile'
  const [frequency, setFrequency] = useState(3)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [tint, setTint] = useState(null) // null for no tint, or color value

  // Handle image upload
  const handleImageUpload = (imageFile) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setUploadedImage(img)
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

  return (
    <div className="min-h-screen bg-[#222222] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        
        
        {/* Main Layout - Console and Upload Area */}
        <div className="flex justify-center items-start gap-8">
          <ConsoleFrame 
            uploadedImage={uploadedImage}
            patternType={patternType}
            frequency={frequency}
            rotation={rotation}
            scale={scale}
            tint={tint}
            onPatternTypeChange={handlePatternTypeChange}
            onFrequencyChange={handleFrequencyChange}
            onRotationChange={handleRotationChange}
            onScaleChange={handleScaleChange}
            onTintChange={handleTintChange}
          />
          <UploadArea uploadedImage={uploadedImage} onImageUpload={handleImageUpload} />
        </div>
        
        {/* Footer */}
        
      </div>
    </div>
  )
}

export default App
