import React, { useRef, useEffect } from 'react'
import Switchboard from './Switchboard'

const ConsoleFrame = ({ 
  uploadedImage, 
  patternType, 
  frequency, 
  rotation, 
  scale, 
  tint,
  onPatternTypeChange,
  onFrequencyChange,
  onRotationChange,
  onScaleChange,
  onTintChange
}) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // If we have an uploaded image, draw it centered
    if (uploadedImage) {
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      const imageWidth = uploadedImage.width
      const imageHeight = uploadedImage.height
      
      // Calculate scaling to fit image in canvas while maintaining aspect ratio
      const scaleX = canvasWidth / imageWidth
      const scaleY = canvasHeight / imageHeight
      const scale = Math.min(scaleX, scaleY) * 0.8 // 0.8 to leave some padding
      
      const scaledWidth = imageWidth * scale
      const scaledHeight = imageHeight * scale
      
      // Center the image
      const x = (canvasWidth - scaledWidth) / 2
      const y = (canvasHeight - scaledHeight) / 2
      
      // Apply tint if specified
      if (tint) {
        ctx.fillStyle = tint
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        ctx.globalCompositeOperation = 'source-over'
      }
      
      // Draw the image
      ctx.drawImage(uploadedImage, x, y, scaledWidth, scaledHeight)
    } else {
      // Draw placeholder text
      ctx.fillStyle = '#666666'
      ctx.font = '18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Upload an image to see it here', canvas.width / 2, canvas.height / 2)
    }
  }, [uploadedImage, tint])

  // Handle download functionality
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a temporary canvas with higher resolution for better quality
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    
    // Set higher resolution (2x for better quality)
    const scale = 2
    tempCanvas.width = canvas.width * scale
    tempCanvas.height = canvas.height * scale
    
    // Scale the context to match the higher resolution
    tempCtx.scale(scale, scale)
    
    // Draw the original canvas content to the temporary canvas
    tempCtx.drawImage(canvas, 0, 0)
    
    // Convert to PNG and trigger download
    tempCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'pattern.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <div className="flex gap-4">
      {/* Debug Area - Left Side */}
      <div className="w-48 p-3 bg-gray-800 rounded-lg text-white text-sm h-fit">
        <div className="font-bold mb-2">Debug Info:</div>
        <div>Pattern Type: <span className="text-yellow-300">{patternType}</span></div>
        <div>Frequency: <span className="text-yellow-300">{frequency}</span></div>
        <div>Rotation: <span className="text-yellow-300">{rotation}°</span></div>
        <div>Scale: <span className="text-yellow-300">{scale}x</span></div>
        <div className="flex items-center gap-2">
          Tint: 
          <span className="text-yellow-300">{tint || 'none'}</span>
          {tint && (
            <div 
              className="w-6 h-6 rounded border border-gray-400"
              style={{ backgroundColor: tint }}
            ></div>
          )}
        </div>
      </div>

      {/* Main Device */}
      <div className="relative bg-[#F1F1F1] rounded-xl shadow-lg p-6 w-[626px] h-[800px] flex-shrink-0 border-b-[10px] border-b-[#676767]">
        {/* Canvas Area - Centered */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#232323] rounded-md h-[417px] w-[590px] flex-shrink-0 relative">
            {/* Screen - Left justified in canvas area */}
            <div className="absolute top-2 left-2 bg-black rounded-md h-[403px] w-[535px]">
              {/* Canvas for pattern rendering */}
              <canvas
                ref={canvasRef}
                width={535}
                height={403}
                className="w-full h-full rounded-md"
              />
            </div>
            
            {/* Icons on the right side */}
            <div className="absolute top-[70px] right-2 flex flex-col justify-between h-[277px]">
              {/* Eject Icon */}
              <div className="w-6 h-6 flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="19" viewBox="0 0 26 19" fill="none">
                  <path d="M0 16H26V19H0V16Z" fill="#FFFFFF" fillOpacity="0.3"/>
                  <path d="M13 0L25.9904 11.25H0.00961876L13 0Z" fill="#FFFFFF" fillOpacity="0.3"/>
                </svg>
              </div>
              
              {/* Download Icon */}
              <div className="w-8 h-9 flex items-center justify-center cursor-pointer" onClick={handleDownload}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="35" viewBox="0 0 32 35" fill="none">
                  <path d="M1 25V34H31V25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3"/>
                  <path d="M16 1V26.5M16 26.5L10 19M16 26.5L22.5 19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.3"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Switchboard - Centered with proper spacing */}
        <div className="flex justify-center">
          <Switchboard 
            patternType={patternType}
            frequency={frequency}
            rotation={rotation}
            scale={scale}
            tint={tint}
            onPatternTypeChange={onPatternTypeChange}
            onFrequencyChange={onFrequencyChange}
            onRotationChange={onRotationChange}
            onScaleChange={onScaleChange}
            onTintChange={onTintChange}
          />
        </div>
      </div>
    </div>
  )
}

export default ConsoleFrame
