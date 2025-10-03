import React, { useRef, useEffect } from 'react'
import Switchboard from './Switchboard'

const ConsoleFrame = ({ 
  uploadedImage, 
  imageMetadata,
  isExtractingMetadata,
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
    
    // Generate pattern based on pattern type
    generatePattern(ctx, canvas.width, canvas.height)
    
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
    }
  }, [uploadedImage, tint, patternType, frequency, rotation, scale])

  // Generate pattern based on pattern type
  const generatePattern = (ctx, width, height) => {
    // Set background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    
    // Generate pattern based on type
    switch (patternType) {
      case 'wave':
        generateWavePattern(ctx, width, height)
        break
      case 'bump':
        generateBumpPattern(ctx, width, height)
        break
      case 'contour':
        generateContourPattern(ctx, width, height)
        break
      default:
        generateWavePattern(ctx, width, height)
    }
  }

  // Sinusoidal Waves pattern generation
  const generateWavePattern = (ctx, width, height) => {
    const numLayers = Math.max(1, Math.floor(scale * 3))
    const layerSpacing = height / numLayers
    
    for (let layer = 0; layer < numLayers; layer++) {
      const baseY = layer * layerSpacing + layerSpacing / 2
      const amplitude = 30 + layer * 10
      const frequency = 0.01 + layer * 0.005
      const phase = rotation * Math.PI / 180 + layer * 0.8
      
      // Create multiple sine waves for complexity
      ctx.strokeStyle = tint || `hsl(${(200 + layer * 40) % 360}, 70%, 80%)`
      ctx.lineWidth = 1 + layer * 0.5
      ctx.beginPath()
      
      for (let x = 0; x < width; x += 1) {
        let waveY = baseY
        
        // Primary wave
        waveY += Math.sin(x * frequency + phase) * amplitude
        
        // Secondary wave for organic curves
        waveY += Math.sin(x * frequency * 2.3 + phase * 1.7) * amplitude * 0.3
        
        // Tertiary wave for fine detail
        waveY += Math.sin(x * frequency * 4.7 + phase * 0.5) * amplitude * 0.1
        
        // Add noise-based variation
        const noiseVariation = (Math.random() - 0.5) * 10
        waveY += noiseVariation
        
        if (x === 0) {
          ctx.moveTo(x, waveY)
        } else {
          ctx.lineTo(x, waveY)
        }
      }
      ctx.stroke()
    }
  }

  // Bump pattern generation
  const generateBumpPattern = (ctx, width, height) => {
    const spacing = 30 * scale
    const bumpSize = 20 * scale
    
    ctx.fillStyle = tint || '#ffffff'
    
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        const offsetX = Math.sin(x * 0.01 + rotation * Math.PI / 180) * 10
        const offsetY = Math.cos(y * 0.01 + rotation * Math.PI / 180) * 10
        
        ctx.beginPath()
        ctx.arc(x + offsetX, y + offsetY, bumpSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  // Contour pattern generation
  const generateContourPattern = (ctx, width, height) => {
    const spacing = 25 * scale
    const lineWidth = 1
    
    ctx.strokeStyle = tint || '#ffffff'
    ctx.lineWidth = lineWidth
    
    // Draw contour lines
    for (let y = spacing; y < height; y += spacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      
      for (let x = 0; x < width; x += 5) {
        const offset = Math.sin(x * frequency * 0.01 + rotation * Math.PI / 180) * 15
        ctx.lineTo(x, y + offset)
      }
      ctx.stroke()
    }
  }

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
      <div className="w-64 p-3 bg-gray-800 rounded-lg text-white text-sm h-fit max-h-[800px] overflow-y-auto">
        <div className="font-bold mb-2">Debug Info:</div>
        
        {/* Pattern Controls */}
        <div className="mb-4">
          <div className="font-semibold text-blue-300 mb-1">Pattern Controls:</div>
          <div>Type: <span className="text-yellow-300">{patternType}</span></div>
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

        {/* Image Metadata */}
        {(imageMetadata || isExtractingMetadata) && (
          <div className="mb-4">
            <div className="font-semibold text-green-300 mb-1 flex items-center gap-2">
              Image Metadata:
              {isExtractingMetadata && (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-green-300"></div>
              )}
            </div>
            
            {/* Camera Information */}
            {imageMetadata && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">Camera:</div>
                {imageMetadata.phoneType && (
                  <div className="text-sm">Phone: <span className="text-yellow-300">{imageMetadata.phoneType}</span></div>
                )}
                {imageMetadata.lensType && (
                  <div className="text-sm">Lens: <span className="text-yellow-300">{imageMetadata.lensType}</span></div>
                )}
                {imageMetadata.lens && !imageMetadata.phoneType && (
                  <div className="text-sm">Camera: <span className="text-yellow-300">{imageMetadata.lens}</span></div>
                )}
              </div>
            )}

            {/* Technical Settings */}
            {imageMetadata && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">Settings:</div>
                {imageMetadata.iso && (
                  <div className="text-sm">ISO: <span className="text-yellow-300">{imageMetadata.iso}</span></div>
                )}
                {imageMetadata.aperture && (
                  <div className="text-sm">Aperture: <span className="text-yellow-300">f/{imageMetadata.aperture}</span></div>
                )}
                {imageMetadata.flash !== undefined && (
                  <div className="text-sm">Flash: <span className="text-yellow-300">{imageMetadata.flash ? 'Yes' : 'No'}</span></div>
                )}
                {imageMetadata.orientation && (
                  <div className="text-sm">Orientation: <span className="text-yellow-300">{imageMetadata.orientation}</span></div>
                )}
              </div>
            )}

            {/* Temporal Information */}
            {imageMetadata && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">Time:</div>
                {imageMetadata.timeOfDay && (
                  <div className="text-sm">Period: <span className="text-yellow-300 capitalize">{imageMetadata.timeOfDay}</span></div>
                )}
                {imageMetadata.date && (
                  <div className="text-sm">Date: <span className="text-yellow-300">{imageMetadata.date}</span></div>
                )}
                {imageMetadata.time && (
                  <div className="text-sm">Time: <span className="text-yellow-300">{imageMetadata.time}</span></div>
                )}
                {imageMetadata.season && (
                  <div className="text-sm">Season: <span className="text-yellow-300 capitalize">{imageMetadata.season}</span></div>
                )}
              </div>
            )}

            {/* Image Properties */}
            {imageMetadata && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">Properties:</div>
                {imageMetadata.width && imageMetadata.height && (
                  <div className="text-sm">Size: <span className="text-yellow-300">{imageMetadata.width} × {imageMetadata.height}</span></div>
                )}
              </div>
            )}

            {/* GPS Information */}
            {imageMetadata && imageMetadata.gps && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">Location:</div>
                {imageMetadata.gps.latitude && (
                  <div className="text-sm">Lat: <span className="text-yellow-300">{imageMetadata.gps.latitude.toFixed(6)}</span></div>
                )}
                {imageMetadata.gps.longitude && (
                  <div className="text-sm">Lng: <span className="text-yellow-300">{imageMetadata.gps.longitude.toFixed(6)}</span></div>
                )}
              </div>
            )}

            {/* Metadata Source Indicator */}
            {imageMetadata && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="text-xs text-gray-400">
                  Source: <span className="text-blue-300">ExifTool API</span>
                </div>
              </div>
            )}
            
            {/* Extraction Status */}
            {isExtractingMetadata && !imageMetadata && (
              <div className="mt-2 pt-2 border-t border-gray-600">
                <div className="text-xs text-gray-400">
                  Status: <span className="text-yellow-300">Extracting metadata...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Status */}
        <div>
          <div className="font-semibold text-purple-300 mb-1">Image Status:</div>
          <div>Uploaded: <span className="text-yellow-300">{uploadedImage ? 'Yes' : 'No'}</span></div>
          {uploadedImage && (
            <div>Size: <span className="text-yellow-300">{uploadedImage.width} × {uploadedImage.height}</span></div>
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
