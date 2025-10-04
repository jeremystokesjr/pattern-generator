import React, { useState, useRef, useEffect } from 'react'

const Controls = ({ 
  patternType, 
  frequency, 
  rotation, 
  scale, 
  tint,
  zoom,
  onPatternTypeChange,
  onFrequencyChange,
  onRotationChange,
  onScaleChange,
  onTintChange,
  onZoomChange
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragStartValue, setDragStartValue] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(0)

  // Pattern type slider positions
  const patternTypes = ['wave', 'bump', 'contour']
  const currentPatternIndex = patternTypes.indexOf(patternType)
  // Calculate position within the track boundaries (accounting for knob width)
  const trackWidth = 521 // Width of the horizontal line
  const knobWidth = 65 // Width of the knob
  const leftMargin = 8 // Left margin from the track start
  const rightMargin = 8 // Right margin from the track end
  const availableWidth = trackWidth - knobWidth
  const knobPosition = leftMargin + (currentPatternIndex / (patternTypes.length - 1)) * availableWidth

  // Handle pattern type slider click (on white area)
  const handlePatternTypeClick = (e) => {
    // Only handle click if we're not dragging
    if (isDragging) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const position = x / width
    
    let newIndex
    if (position < 0.33) {
      newIndex = 0
    } else if (position < 0.66) {
      newIndex = 1
    } else {
      newIndex = 2
    }
    
    onPatternTypeChange(patternTypes[newIndex])
  }

  // Handle pattern type slider drag interaction (on knob)
  const handlePatternTypeMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation() // Prevent click event on white area
    setIsDragging(true)
    setDragType('patternType')
    setDragStart({ x: e.clientX, y: e.clientY })
    
    // Get current pattern type index
    const currentIndex = patternTypes.indexOf(patternType)
    setDragStartValue(currentIndex)
  }

  // Handle knob dragging
  const handleKnobMouseDown = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    setDragType(type)
    setDragStart({ x: e.clientX, y: e.clientY })
    
    // Change cursor to grabbing
    document.body.style.cursor = 'grabbing'
    
    switch (type) {
      case 'frequency':
        setDragStartValue(scale) // Now controlling scale instead of frequency
        break
      case 'rotation':
        setDragStartValue(rotation)
        break
      case 'scale':
        setDragStartValue(scale)
        break
      case 'zoom':
        setDragStartValue(zoom)
        break
      default:
        break
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    e.preventDefault() // Prevent browser interference

    // Throttle updates to improve precision (max 60fps for better responsiveness)
    const now = Date.now()
    if (now - lastUpdateTime < 16) return // ~60fps for better responsiveness
    setLastUpdateTime(now)

    const deltaX = e.clientX - dragStart.x
    const deltaY = dragStart.y - e.clientY // Invert Y for intuitive control
    const sensitivity = 0.3 // Increased sensitivity for easier rotation

    let newValue = dragStartValue

    switch (dragType) {
      case 'patternType':
        // Simple drag logic: drag left/right to change pattern
        const dragThreshold = 50 // Increased threshold for more deliberate changes
        const dragDistance = Math.abs(deltaX)
        
        
        if (dragDistance > dragThreshold) {
          let newIndex = dragStartValue
          
          if (deltaX > 0) {
            // Drag right - go to next pattern
            newIndex = Math.min(2, dragStartValue + 1)
          } else {
            // Drag left - go to previous pattern
            newIndex = Math.max(0, dragStartValue - 1)
          }
          
          if (newIndex !== dragStartValue) {
            onPatternTypeChange(patternTypes[newIndex])
            setDragStartValue(newIndex)
            setDragStart({ x: e.clientX, y: e.clientY }) // Reset drag start
          }
        }
        break
      case 'frequency':
        newValue = Math.max(0.1, Math.min(3.0, dragStartValue + deltaX * sensitivity))
        onScaleChange(Math.round(newValue * 10) / 10) // Round to 1 decimal, now controlling scale
        break
      case 'rotation':
        // Add small dead zone to prevent accidental tiny movements
        const deadZone = 3
        if (Math.abs(deltaX) < deadZone) return
        
        // Reduced sensitivity for more precise control
        const rotationSensitivity = 0.15
        newValue = dragStartValue + deltaX * rotationSensitivity
        // Clamp to -180° to +180° range
        newValue = Math.max(-180, Math.min(180, newValue))
        onRotationChange(Math.round(newValue))
        break
      case 'scale':
        newValue = Math.max(0.1, Math.min(3, dragStartValue + deltaY * sensitivity * 0.05)) // Reduced sensitivity
        onScaleChange(Math.round(newValue * 100) / 100) // Round to 2 decimals
        break
      case 'zoom':
        newValue = Math.max(1.0, Math.min(5.0, dragStartValue + deltaY * sensitivity * 0.1)) // Zoom range 1.0 to 5.0
        onZoomChange(Math.round(newValue * 100) / 100) // Round to 2 decimals
        break
      case 'colorSlider':
        // Color slider drag logic: drag up/down to change color
        const colorDragThreshold = 30 // Increased threshold for more deliberate changes
        const colorDragDistance = Math.abs(deltaY)
        
        
        if (colorDragDistance > colorDragThreshold) {
          let newColorIndex = dragStartValue
          
          if (deltaY < 0) {
            // Drag up - go to previous color (higher in array)
            newColorIndex = Math.min(6, dragStartValue + 1)
          } else {
            // Drag down - go to next color (lower in array)
            newColorIndex = Math.max(0, dragStartValue - 1)
          }
          
          if (newColorIndex !== dragStartValue) {
            const newColor = getColorFromIndex(newColorIndex)
            onTintChange(newColor)
            setDragStartValue(newColorIndex)
            setDragStart({ x: e.clientX, y: e.clientY }) // Reset drag start
          }
        }
        break
      default:
        break
    }
  }

  const handleMouseUp = (e) => {
    e.preventDefault() // Prevent browser interference
    setIsDragging(false)
    setDragType(null)
    
    // Reset cursor
    document.body.style.cursor = 'default'
  }


  // Handle color slider drag interaction
  const handleColorSliderMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragType('colorSlider')
    setDragStart({ x: e.clientX, y: e.clientY })
    
    // Get current color position based on current tint
    const currentColorIndex = getColorIndexFromTint(tint)
    setDragStartValue(currentColorIndex)
  }

  // Color values in reverse order (top to bottom)
  const colorValues = [
    '#FD0004', // 0% - Red
    '#E86615', // 16.67% - Orange  
    '#FFFF00', // 33.33% - Yellow
    '#FFFFFF', // 50% - White (no tint)
    '#00FF1E', // 66.67% - Green
    '#002AFF', // 83.33% - Blue
    '#8015E8'  // 100% - Purple
  ]

  // Get color index from tint value
  const getColorIndexFromTint = (tint) => {
    if (!tint) return 3 // Default to white (middle)
    
    // Normalize the tint value
    const normalizedTint = tint.toUpperCase().replace('#', '')
    
    // Check against normalized color values
    const normalizedColorValues = colorValues.map(color => color.replace('#', ''))
    const index = normalizedColorValues.indexOf(normalizedTint)
    
    
    return index >= 0 ? index : 3
  }

  // Get color from position (0-6)
  const getColorFromIndex = (index) => {
    return colorValues[Math.max(0, Math.min(6, index))]
  }

  // Calculate dial position based on current color
  const currentColorIndex = getColorIndexFromTint(tint)
  // Account for dial height (35px) - position so center of dial aligns with color
  const dialPosition = (currentColorIndex / 6) * 100 // 0% to 100%
  

  // Calculate dial rotations based on current values
  const frequencyRotation = ((scale - 0.1) / 2.9) * 270 - 135 // -135° to +135° (270° range) - now using scale
  const rotationDialRotation = rotation // -180° to +180°, where 0° is at 12 o'clock

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, dragStartValue, dragType])

  return (
    <div className="w-[590px] h-[311px] bg-[#232323] border-2 border-gray-600 rounded-lg p-[2px] shadow-xl flex-shrink-0 overflow-hidden">
      {/* Pattern Type Slider */}
      <div className="mb-[2px] flex gap-[2px] h-[109px]">
        {/* Pattern Type Slider */}
        <div 
          className="relative w-[540px] h-[109px] bg-white rounded-[6.86px] shadow-inner cursor-pointer flex-shrink-0"
          onClick={handlePatternTypeClick}
        >
          {/* Slider Indicator */}
          <div 
            className={`absolute top-[58px] transform -translate-y-1/2 z-10 cursor-pointer ${!isDragging ? 'transition-all duration-200' : ''}`}
            style={{ left: `${knobPosition}px` }}
            onMouseDown={handlePatternTypeMouseDown}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="65" height="68" viewBox="0 0 65 68" fill="none">
              <g filter="url(#filter0_d_16_588)">
                <g filter="url(#filter1_d_16_588)">
                  <rect x="10" y="6" width="45" height="46" rx="2" fill="url(#paint0_linear_16_588)"/>
                </g>
                <g filter="url(#filter2_f_16_588)">
                  <rect x="32" y="8" width="3" height="42" fill="#F1F1F1" fillOpacity="0.4"/>
                </g>
                <rect x="32" y="8" width="3" height="42" rx="1.5" fill="url(#paint1_linear_16_588)" fillOpacity="0.5"/>
              </g>
              <defs>
                <filter id="filter0_d_16_588" x="0" y="2" width="65" height="66" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy="6"/>
                  <feGaussianBlur stdDeviation="5"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_16_588"/>
                  <feBlend mode="normal" in2="SourceGraphic" result="shape"/>
                </filter>
                <filter id="filter1_d_16_588" x="0" y="0" width="65" height="66" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy="4"/>
                  <feGaussianBlur stdDeviation="5"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_16_588"/>
                  <feBlend mode="normal" in2="SourceGraphic" result="shape"/>
                </filter>
                <filter id="filter2_f_16_588" x="28" y="4" width="11" height="50" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="shape"/>
                  <feGaussianBlur stdDeviation="2" result="effect1_foregroundBlur_16_588"/>
                </filter>
                <linearGradient id="paint0_linear_16_588" x1="55" y1="29" x2="10" y2="29" gradientUnits="userSpaceOnUse">
                  <stop offset="0.0480769" stopColor="#1F1F1F"/>
                  <stop offset="0.442308" stopColor="#888888"/>
                  <stop offset="0.538462" stopColor="#888888"/>
                  <stop offset="0.951923" stopColor="#1F1F1F"/>
                </linearGradient>
                <linearGradient id="paint1_linear_16_588" x1="33.5" y1="8" x2="33.5" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F1F1F1" stopOpacity="0"/>
                  <stop offset="0.235577" stopColor="#F1F1F1"/>
                  <stop offset="0.759615" stopColor="#F1F1F1"/>
                  <stop offset="1" stopColor="#F1F1F1" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Horizontal Line */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[521px] h-[1px] bg-[#222] rounded-[99999px] pointer-events-none"></div>
          
          {/* Groups - Vertical Lines and Titles */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-[521px] flex justify-between px-8 pointer-events-none">
            <div className="relative">
              <div className="absolute top-[41px] left-1/2 transform -translate-x-1/2 w-[1px] h-[27px] bg-[#222] rounded-[999px]"></div>
              <div className="absolute top-[75px] left-1/2 transform -translate-x-1/2 text-gray-700 text-sm font-medium">wave</div>
            </div>
            
            <div className="relative">
              <div className="absolute top-[41px] left-1/2 transform -translate-x-1/2 w-[1px] h-[27px] bg-[#222] rounded-[999px]"></div>
              <div className="absolute top-[75px] left-1/2 transform -translate-x-1/2 text-gray-700 text-sm font-medium">bump</div>
            </div>
            
            <div className="relative">
              <div className="absolute top-[41px] left-1/2 transform -translate-x-1/2 w-[1px] h-[27px] bg-[#222] rounded-[999px]"></div>
              <div className="absolute top-[75px] left-1/2 transform -translate-x-1/2 text-gray-700 text-sm font-medium">contour</div>
            </div>
          </div>
        </div>

        {/* Color Slider */}
        <div className="relative flex-shrink-0">
          <div 
            className="w-[43px] h-[109px] rounded-[6px] shadow-inner cursor-pointer flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, #FD0004 0%, #E86615 16.67%, #FFFF00 33.33%, #FFFFFF 50%, #00FF1E 66.67%, #002AFF 83.33%, #8015E8 100%)'
            }}
            onMouseDown={handleColorSliderMouseDown}
          >
            {/* Color Slider Dial */}
            <div 
              className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer ${!isDragging ? 'transition-all duration-200' : ''}`}
              style={{ top: `${dialPosition}%` }}
              onMouseDown={handleColorSliderMouseDown}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 35 35" fill="none">
                <circle cx="17.5" cy="17.5" r="17" transform="rotate(-90 17.5 17.5)" fill="white" fillOpacity="0.1" stroke="black"/>
                <path d="M0.999999 17.5C0.999999 8.3873 8.3873 1 17.5 0.999999C26.6127 0.999999 34 8.3873 34 17.5C34 26.6127 26.6127 34 17.5 34C8.3873 34 0.999999 26.6127 0.999999 17.5ZM2 17.5C2 26.0604 8.93959 33 17.5 33C26.0604 33 33 26.0604 33 17.5C33 8.93959 26.0604 2 17.5 2C8.93959 2 2 8.93959 2 17.5Z" fill="url(#paint0_linear_16_594)"/>
                <defs>
                  <linearGradient id="paint0_linear_16_594" x1="17.5" y1="1" x2="17.5" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white"/>
                    <stop offset="0.150598" stopColor="white" stopOpacity="0.446187"/>
                    <stop offset="0.515042" stopColor="white" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Knobs Row */}
      <div className="flex gap-[2px] h-[190px] flex-shrink-0">
        {/* Frequency Knob Frame */}
        <div className="w-[195px] h-[190px] bg-white rounded-[6px] relative flex items-center justify-center flex-shrink-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="164" 
            height="149" 
            viewBox="0 0 164 149" 
            fill="none" 
            className="absolute top-4 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleKnobMouseDown(e, 'frequency')}
          >
            <path d="M36.1233 148.689C22.0689 139.036 11.4209 125.193 5.69747 109.132C-0.0259142 93.0712 -0.532447 75.6135 4.2501 59.248C9.03264 42.8824 18.8601 28.4447 32.3312 17.9933C45.8023 7.54184 62.2293 1.61037 79.2699 1.0446C96.3105 0.478831 113.095 5.30764 127.229 14.8425C141.364 24.3774 152.128 38.1315 157.985 54.1438C163.843 70.156 164.495 87.6089 159.85 104.014C155.204 120.419 145.498 134.938 132.115 145.502" stroke="#222" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="84" cy="82" r="65" fill="#222" filter="drop-shadow(0 18.3px 22.875px rgba(0, 0, 0, 0.40))" className="knob-padding"/>
            {/* Rotating inner dial group */}
            <g transform={`rotate(${frequencyRotation} 84 82)`} className="transition-transform duration-150">
              <circle cx="84" cy="82" r="51.4688" fill="url(#paint0_linear_35_318_1)"/>
              <circle cx="84" cy="82" r="52.0406" stroke="url(#paint1_radial_35_318_1)" strokeOpacity="0.8" strokeWidth="1.14375"/>
              <g filter="url(#filter0_f_35_318)">
                <rect x="80.5684" y="40.6813" width="6.8625" height="18.3" rx="3.43125" fill="white" fillOpacity="0.5"/>
              </g>
              <rect x="82.8555" y="40.6813" width="2.2875" height="18.3" rx="1.14375" fill="#F77949"/>
            </g>
            <defs>
              <filter id="filter0_f_35_318" x="69.1308" y="29.2438" width="29.7373" height="41.1751" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="5.71875" result="effect1_foregroundBlur_35_318"/>
              </filter>
              <linearGradient id="paint0_linear_35_318_1" x1="84" y1="30.5312" x2="84" y2="133.4688" gradientUnits="userSpaceOnUse">
                <stop stopColor="#888888"/>
                <stop offset="0.205376" stopColor="#606060"/>
                <stop offset="1" stopColor="#1F1F1F"/>
              </linearGradient>
              <radialGradient id="paint1_radial_35_318_1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(85.1438 32.8188) rotate(90.6511) scale(100.657)">
                <stop stopColor="white"/>
                <stop offset="1" stopColor="white" stopOpacity="0"/>
              </radialGradient>
            </defs>
          </svg>
          {/* Scale Label */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-700 text-sm font-medium">scale</div>
        </div>

        {/* Rotation Knob Frame */}
        <div className="w-[195px] h-[190px] bg-white rounded-[6px] relative flex items-center justify-center flex-shrink-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="164" 
            height="149" 
            viewBox="0 0 164 149" 
            fill="none" 
            className="absolute top-4 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleKnobMouseDown(e, 'rotation')}
          >
            <path d="M36.1233 148.689C22.0689 139.036 11.4209 125.193 5.69747 109.132C-0.0259142 93.0712 -0.532447 75.6135 4.2501 59.248C9.03264 42.8824 18.8601 28.4447 32.3312 17.9933C45.8023 7.54184 62.2293 1.61037 79.2699 1.0446C96.3105 0.478831 113.095 5.30764 127.229 14.8425C141.364 24.3774 152.128 38.1315 157.985 54.1438C163.843 70.156 164.495 87.6089 159.85 104.014C155.204 120.419 145.498 134.938 132.115 145.502" stroke="#222" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="84" cy="82" r="65" fill="#222" filter="drop-shadow(0 18.3px 22.875px rgba(0, 0, 0, 0.40))" className="knob-padding"/>
            {/* Rotating inner dial group */}
            <g transform={`rotate(${rotationDialRotation} 84 82)`} className="transition-transform duration-50">
              <circle cx="84" cy="82" r="51.4688" fill="url(#paint0_linear_35_318_2)"/>
              <circle cx="84" cy="82" r="52.0406" stroke="url(#paint1_radial_35_318_2)" strokeOpacity="0.8" strokeWidth="1.14375"/>
              <g filter="url(#filter0_f_35_318_2)">
                <rect x="80.5684" y="40.6813" width="6.8625" height="18.3" rx="3.43125" fill="white" fillOpacity="0.5"/>
              </g>
              <rect x="82.8555" y="40.6813" width="2.2875" height="18.3" rx="1.14375" fill="#F77949"/>
            </g>
            <defs>
              <filter id="filter0_f_35_318_2" x="69.1308" y="29.2438" width="29.7373" height="41.1751" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="5.71875" result="effect1_foregroundBlur_35_318_2"/>
              </filter>
              <linearGradient id="paint0_linear_35_318_2" x1="84" y1="30.5312" x2="84" y2="133.4688" gradientUnits="userSpaceOnUse">
                <stop stopColor="#888888"/>
                <stop offset="0.205376" stopColor="#606060"/>
                <stop offset="1" stopColor="#1F1F1F"/>
              </linearGradient>
              <radialGradient id="paint1_radial_35_318_2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(85.1438 32.8188) rotate(90.6511) scale(100.657)">
                <stop stopColor="white"/>
                <stop offset="1" stopColor="white" stopOpacity="0"/>
              </radialGradient>
            </defs>
          </svg>
          {/* Rotation Label */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-700 text-sm font-medium">rotation</div>
        </div>

        {/* Scale Knob Frame */}
        <div className="w-[195px] h-[190px] bg-white rounded-[6px] relative flex items-center justify-center flex-shrink-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="164" 
            height="149" 
            viewBox="0 0 164 149" 
            fill="none" 
            className="absolute top-4 cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => handleKnobMouseDown(e, 'scale')}
          >
            <path d="M36.1233 148.689C22.0689 139.036 11.4209 125.193 5.69747 109.132C-0.0259142 93.0712 -0.532447 75.6135 4.2501 59.248C9.03264 42.8824 18.8601 28.4447 32.3312 17.9933C45.8023 7.54184 62.2293 1.61037 79.2699 1.0446C96.3105 0.478831 113.095 5.30764 127.229 14.8425C141.364 24.3774 152.128 38.1315 157.985 54.1438C163.843 70.156 164.495 87.6089 159.85 104.014C155.204 120.419 145.498 134.938 132.115 145.502" stroke="black" strokeWidth="1" strokeLinecap="round"/>
            <circle cx="84" cy="82" r="65" fill="#222" filter="drop-shadow(0 18.3px 22.875px rgba(0, 0, 0, 0.40))" className="knob-padding"/>
            {/* Rotating inner dial group */}
            <g transform={`rotate(${frequencyRotation} 84 82)`} className="transition-transform duration-150">
              <circle cx="84" cy="82" r="51.4688" fill="url(#paint0_linear_35_318_3)"/>
              <circle cx="84" cy="82" r="52.0406" stroke="url(#paint1_radial_35_318_3)" strokeOpacity="0.8" strokeWidth="1.14375"/>
              <g filter="url(#filter0_f_35_318_3)">
                <rect x="80.5684" y="40.6813" width="6.8625" height="18.3" rx="3.43125" fill="white" fillOpacity="0.5"/>
              </g>
              <rect x="82.8555" y="40.6813" width="2.2875" height="18.3" rx="1.14375" fill="#F77949"/>
            </g>
            <defs>
              <filter id="filter0_f_35_318_3" x="69.1308" y="29.2438" width="29.7373" height="41.1751" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="5.71875" result="effect1_foregroundBlur_35_318_3"/>
              </filter>
              <linearGradient id="paint0_linear_35_318_3" x1="84" y1="30.5312" x2="84" y2="133.4688" gradientUnits="userSpaceOnUse">
                <stop stopColor="#888888"/>
                <stop offset="0.205376" stopColor="#606060"/>
                <stop offset="1" stopColor="#1F1F1F"/>
              </linearGradient>
              <radialGradient id="paint1_radial_35_318_3" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(85.1438 32.8188) rotate(90.6511) scale(100.657)">
                <stop stopColor="white"/>
                <stop offset="1" stopColor="white" stopOpacity="0"/>
              </radialGradient>
            </defs>
          </svg>
          {/* Scale Label */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-gray-700 text-sm font-medium">scale</div>
        </div>

      </div>
    </div>
  )
}

export default Controls
