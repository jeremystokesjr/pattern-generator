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
  removeBackground,
  zoom,
  onPatternTypeChange,
  onFrequencyChange,
  onRotationChange,
  onScaleChange,
  onTintChange,
  onZoomChange,
  onImageRemove
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
  }, [uploadedImage, tint, patternType, frequency, rotation, scale, zoom])

  // Generate pattern based on pattern type
  const generatePattern = async (ctx, width, height) => {
    // Set background
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    
    // Generate pattern based on type
    switch (patternType) {
      case 'wave':
        await generateWavePattern(ctx, width, height)
        break
      case 'bump':
        await generateBumpPattern(ctx, width, height)
        break
      case 'contour':
        await generateContourPattern(ctx, width, height)
        break
      default:
        generateWavePattern(ctx, width, height)
    }
  }

  // Sinusoidal Waves pattern generation using P5.js with metadata-driven shapes
  const generateWavePattern = async (ctx, width, height) => {
    // Set background to black
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    
    try {
      // Import P5.js dynamically
      const p5Module = await import('p5')
      const p5 = p5Module.default
      
      // Create P5.js sketch for wave pattern
      const sketch = (p) => {
        let time = 0
        let settings = {
          numWaves: 8,
          amplitude: 40,
          frequency: 0.02,
          shapeSpacing: 8,
          shapeSize: 3,
          waveSpacing: 40,
          animationSpeed: 0.01
        }

        p.setup = function() {
          // Create canvas at normal size
          const canvas = p.createCanvas(width, height)
          p.colorMode(p.RGB, 255, 255, 255, 255)
          p.background(0, 0, 0)
          
          // Set random seed for deterministic randomness
          p.randomSeed(42)
          
          // Map metadata to settings
          mapMetadataToWaveSettings()
        }

        p.draw = function() {
          // Clear background
          p.background(0, 0, 0)
          
          // Update time for animation (prepared for future use)
          time += settings.animationSpeed
          
          // Draw wave pattern
          drawWavePattern()
        }

        function mapMetadataToWaveSettings() {
          // Get shape from metadata
          let shape = 'circle' // default
          if (imageMetadata && imageMetadata.lensType) {
            const lens = imageMetadata.lensType.toLowerCase()
            if (lens.includes('front')) shape = 'circle'
            else if (lens.includes('wide')) shape = 'rectangle'
            else if (lens.includes('telephoto')) shape = 'triangle'
            else if (lens.includes('macro')) shape = 'rhombus'
            else if (lens.includes('zoom')) shape = 'star'
          }
          p.shapeType = shape
          
          // Map ISO to shape density/spacing
          const iso = imageMetadata?.iso || 200
          settings.shapeSpacing = Math.max(4, Math.min(12, 8 - (iso / 200)))
          
          // Map aperture to wave amplitude (if available)
          const aperture = imageMetadata?.aperture || 2.8
          settings.amplitude = Math.max(20, Math.min(80, 40 + (aperture * 5)))
          
          // Map shutter speed to wave frequency (if available)
          const shutterSpeed = imageMetadata?.shutterSpeed || 1/60
          settings.frequency = Math.max(0.01, Math.min(0.05, 0.02 + (shutterSpeed * 0.1)))
          
          // Map flash to shape size
          const flash = imageMetadata?.flash || false
          settings.shapeSize = flash ? 4 : 3
          
          // Map ISO to number of waves - more waves for denser pattern
          settings.numWaves = Math.max(10, Math.min(18, 12 + Math.floor(iso / 150)))
          
          // Dynamic wave spacing based on canvas height and number of waves
          settings.waveSpacing = Math.max(25, Math.min(50, p.height / settings.numWaves))
          
          // Map ISO to animation speed for future undulating movement
          settings.animationSpeed = Math.max(0.005, Math.min(0.02, 0.01 + (iso / 20000)))
        }

        function drawWavePattern() {
          // Save the current transformation matrix
          p.push()
          
          // Move to center of canvas for rotation and zoom
          p.translate(p.width / 2, p.height / 2)
          
          // Apply zoom transformation
          // Convert zoom (-1.0 to +1.0) to scale factor (0.5x to 2.0x)
          const zoomScale = zoom >= 0 ? 1 + zoom : 1 / (1 - zoom) // 0 = 1.0x, +1 = 2.0x, -1 = 0.5x
          p.scale(zoomScale)
          
          // Apply rotation to entire pattern
          p.rotate(rotation * Math.PI / 180)
          
          // Move back to original coordinate system
          p.translate(-p.width / 2, -p.height / 2)
          
          // Calculate wave spacing
          const totalWaveHeight = settings.numWaves * settings.waveSpacing
          const startY = (p.height - totalWaveHeight) / 2 + settings.waveSpacing / 2
          
          // Draw each wave
          for (let waveIndex = 0; waveIndex < settings.numWaves; waveIndex++) {
            const baseY = startY + waveIndex * settings.waveSpacing
            
            // Draw shapes along the sinusoidal wave path
            for (let x = 0; x < p.width; x += settings.shapeSpacing) {
              // Calculate sinusoidal wave position (no rotation in wave phase)
              const waveY = baseY + Math.sin(x * settings.frequency) * settings.amplitude
              
              // Apply tinting to white base color
              if (tint && tint !== '#FFFFFF') {
                // Convert tint color to RGB
                const tintR = parseInt(tint.slice(1, 3), 16)
                const tintG = parseInt(tint.slice(3, 5), 16)
                const tintB = parseInt(tint.slice(5, 7), 16)
                
                // Blend white (255,255,255) with tint color using multiplication
                const blendedR = Math.min(255, Math.floor(255 * tintR / 255))
                const blendedG = Math.min(255, Math.floor(255 * tintG / 255))
                const blendedB = Math.min(255, Math.floor(255 * tintB / 255))
                
                p.fill(blendedR, blendedG, blendedB)
              } else {
                // No tinting, use white
                p.fill(255, 255, 255)
              }
              p.noStroke()
              
              // Draw shape at wave position
              drawShape(x, waveY, settings.shapeSize)
            }
          }
          
          // Restore the transformation matrix
          p.pop()
        }

        function drawShape(x, y, size) {
          switch (p.shapeType) {
            case 'circle':
              p.ellipse(x, y, size)
              break
            case 'rectangle':
              p.rect(x - size/2, y - size/2, size, size)
              break
            case 'triangle':
              p.triangle(
                x, y - size,
                x - size, y + size,
                x + size, y + size
              )
              break
            case 'rhombus':
              p.beginShape()
              p.vertex(x, y - size)
              p.vertex(x - size, y)
              p.vertex(x, y + size)
              p.vertex(x + size, y)
              p.endShape(p.CLOSE)
              break
            case 'star':
              drawStar(x, y, size)
              break
          }
        }

        function drawStar(x, y, size) {
          const spikes = 5
          const outerRadius = size
          const innerRadius = size * 0.4
          
          p.beginShape()
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (i * p.PI) / spikes
            const px = x + p.cos(angle) * radius
            const py = y + p.sin(angle) * radius
            p.vertex(px, py)
          }
          p.endShape(p.CLOSE)
        }
      }
      
      // Create and run the P5.js sketch
      const p5Instance = new p5(sketch, canvasRef.current)
      
      // Wait for the sketch to render
      setTimeout(() => {
        // Copy P5.js canvas to our main canvas
        const p5Canvas = p5Instance.canvas
        
        // Draw the P5.js canvas to our display canvas
        ctx.drawImage(p5Canvas, 0, 0, width, height)
        
        // Clean up P5.js instance
        p5Instance.remove()
      }, 100)
      
    } catch (error) {
      console.error('Error loading P5.js:', error)
      // Fallback to simple pattern
      ctx.fillStyle = tint || '#ffffff'
      ctx.fillRect(width/2 - 10, height/2 - 10, 20, 20)
    }
  }

  // Bump pattern generation using P5.js for 3D undulating surface
  const generateBumpPattern = async (ctx, width, height) => {
    // Set background to black
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    
    try {
      // Import P5.js dynamically
      const p5Module = await import('p5')
      const p5 = p5Module.default
      
      // Create P5.js sketch for bump pattern
      const sketch = (p) => {
        let particles = []
        let time = 0
        let settings = {
          spacing: 20,
          dotMinSize: 1,
          dotMaxSize: 8,
          noiseScale: 0.02,
          animationSpeed: 0.01
        }

        p.setup = function() {
          // Create canvas at normal size
          const canvas = p.createCanvas(width, height)
          p.colorMode(p.RGB, 255, 255, 255, 255)
          p.background(0, 0, 0)
          
          // Set random seed for deterministic randomness
          p.randomSeed(42)
          p.noiseSeed(42)
          
          // Map metadata to settings
          mapMetadataToBumpSettings()
          
          // Initialize particles
          initializeParticles()
        }

        p.draw = function() {
          // Clear background
          p.background(0, 0, 0)
          
          // Update time for animation
          time += settings.animationSpeed
          
          // Draw bump pattern
          drawBumpPattern()
        }

        function mapMetadataToBumpSettings() {
          // Get shape from metadata
          let shape = 'circle' // default
          if (imageMetadata && imageMetadata.lensType) {
            const lens = imageMetadata.lensType.toLowerCase()
            if (lens.includes('front')) shape = 'circle'
            else if (lens.includes('wide')) shape = 'rectangle'
            else if (lens.includes('telephoto')) shape = 'triangle'
            else if (lens.includes('macro')) shape = 'rhombus'
            else if (lens.includes('zoom')) shape = 'star'
          }
          p.shapeType = shape
          
          // Map ISO to spacing (higher ISO = denser grid) - much denser for reference look
          const iso = imageMetadata?.iso || 200
          settings.spacing = Math.max(6, Math.min(12, 8 - (iso / 200)))
          
          // Progressive scaling for wave buildup - size varies with elevation
          settings.dotMinSize = 1.5 // Smaller base size
          settings.dotMaxSize = 4.5 // Larger size for peaks
          
          // Map ISO to noise scale for smooth undulation
          settings.noiseScale = Math.max(0.02, Math.min(0.04, 0.03 + (iso / 20000)))
          
          // Slower animation for more organic feel
          settings.animationSpeed = Math.max(0.002, Math.min(0.008, 0.005 + (iso / 20000)))
        }

        function initializeParticles() {
          particles = []
          const zoomFactor = zoom
          
          for (let x = 0; x < p.width; x += settings.spacing) {
            for (let y = 0; y < p.height; y += settings.spacing) {
              particles.push({
                x: x,
                y: y,
                baseX: x,
                baseY: y,
                size: p.random(settings.dotMinSize, settings.dotMaxSize), // Variable size for wave buildup
                color: p.color(255, 255, 255) // White color
              })
            }
          }
        }

        function drawBumpPattern() {
          // Save the current transformation matrix
          p.push()
          
          // Move to center of canvas for rotation and zoom
          p.translate(p.width / 2, p.height / 2)
          
          // Apply zoom transformation
          // Convert zoom (-1.0 to +1.0) to scale factor (0.5x to 2.0x)
          const zoomScale = zoom >= 0 ? 1 + zoom : 1 / (1 - zoom) // 0 = 1.0x, +1 = 2.0x, -1 = 0.5x
          p.scale(zoomScale)
          
          // Apply rotation to entire pattern
          p.rotate(rotation * Math.PI / 180)
          
          // Move back to original coordinate system
          p.translate(-p.width / 2, -p.height / 2)
          
          particles.forEach(particle => {
            // Apply Perlin noise displacement for 3D bump effect
            const noiseX = p.noise(particle.baseX * settings.noiseScale, particle.baseY * settings.noiseScale, time)
            const noiseY = p.noise(particle.baseX * settings.noiseScale + 1000, particle.baseY * settings.noiseScale + 1000, time)
            
            // Calculate displacement based on noise (creates peaks and valleys) - smaller displacement for smoother look
            const displacementX = p.map(noiseX, 0, 1, -15, 15)
            const displacementY = p.map(noiseY, 0, 1, -15, 15)
            
            particle.x = particle.baseX + displacementX
            particle.y = particle.baseY + displacementY
            
            // Calculate elevation for color variation (3D effect) - use same noise for consistency
            const elevation = p.noise(particle.baseX * settings.noiseScale * 0.7, particle.baseY * settings.noiseScale * 0.7, time * 0.3)
            
            // Progressive scaling for wave buildup - size varies with elevation
            const sizeMultiplier = p.map(elevation, 0, 1, 0.6, 1.4) // Smaller in valleys, larger on peaks
            particle.size = p.map(elevation, 0, 1, settings.dotMinSize, settings.dotMaxSize) * sizeMultiplier
            
            // Apply tinting to white base color
            if (tint && tint !== '#FFFFFF') {
              // Convert tint color to RGB
              const tintR = parseInt(tint.slice(1, 3), 16)
              const tintG = parseInt(tint.slice(3, 5), 16)
              const tintB = parseInt(tint.slice(5, 7), 16)
              
              // Blend white (255,255,255) with tint color using multiplication
              const blendedR = Math.min(255, Math.floor(255 * tintR / 255))
              const blendedG = Math.min(255, Math.floor(255 * tintG / 255))
              const blendedB = Math.min(255, Math.floor(255 * tintB / 255))
              
              particle.color = p.color(blendedR, blendedG, blendedB, 255)
            } else {
              // No tinting, use white
              particle.color = p.color(255, 255, 255, 255)
            }
            
            // Draw shape
            drawShape(particle)
          })
          
          // Restore the transformation matrix
          p.pop()
        }

        function drawShape(particle) {
          p.fill(particle.color)
          p.noStroke()
          
          switch (p.shapeType) {
            case 'circle':
              p.ellipse(particle.x, particle.y, particle.size)
              break
            case 'rectangle':
              p.rect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size)
              break
            case 'triangle':
              p.triangle(
                particle.x, particle.y - particle.size,
                particle.x - particle.size, particle.y + particle.size,
                particle.x + particle.size, particle.y + particle.size
              )
              break
            case 'rhombus':
              p.beginShape()
              p.vertex(particle.x, particle.y - particle.size)
              p.vertex(particle.x - particle.size, particle.y)
              p.vertex(particle.x, particle.y + particle.size)
              p.vertex(particle.x + particle.size, particle.y)
              p.endShape(p.CLOSE)
              break
            case 'star':
              drawStar(particle.x, particle.y, particle.size)
              break
          }
        }

        function drawStar(x, y, size) {
          const spikes = 5
          const outerRadius = size
          const innerRadius = size * 0.4
          
          p.beginShape()
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (i * p.PI) / spikes
            const px = x + p.cos(angle) * radius
            const py = y + p.sin(angle) * radius
            p.vertex(px, py)
          }
          p.endShape(p.CLOSE)
        }
      }
      
      // Create and run the P5.js sketch
      const p5Instance = new p5(sketch, canvasRef.current)
      
      // Wait for the sketch to render
      setTimeout(() => {
        // Copy P5.js canvas to our main canvas
        const p5Canvas = p5Instance.canvas
        
        // Draw the P5.js canvas to our display canvas
        ctx.drawImage(p5Canvas, 0, 0, width, height)
        
        // Clean up P5.js instance
        p5Instance.remove()
      }, 100)
      
    } catch (error) {
      console.error('Error loading P5.js:', error)
      // Fallback to simple pattern
      ctx.fillStyle = tint || '#ffffff'
      ctx.fillRect(width/2 - 10, height/2 - 10, 20, 20)
    }
  }

  // Static Contours pattern generation using P5.js (mirrored from generative_art)
  const generateStaticContoursPattern = async (ctx, width, height) => {
    // Set background to black
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    
    try {
      // Import P5.js dynamically
      const p5Module = await import('p5')
      const p5 = p5Module.default
      
      // Create P5.js sketch for static contours pattern
      const sketch = (p) => {
        let settings = {
          spacing: 8,
          dotMinSize: 1,
          dotMaxSize: 5,
          noiseScale: 0.05,
          colorMode: 'rainbow'
        }
        let time = 0
        let animationSpeed = 0.01

        p.setup = function() {
          // Create canvas at normal size
          const canvas = p.createCanvas(width, height)
          p.colorMode(p.HSB, 360, 100, 100, 100)
          p.background(0, 0, 0)
          
          // Set random seed for deterministic randomness
          p.randomSeed(42)
          p.noiseSeed(42)
          
          // Map metadata to settings
          mapMetadataToStaticSettings()
        }

        p.draw = function() {
          // Clear background with slight fade for motion blur effect
          p.fill(0, 0, 0, 20)
          p.noStroke()
          p.rect(0, 0, p.width, p.height)
          
          // Update time for animation
          time += animationSpeed
          
          // Always render the animated pattern
          renderAnimatedPattern()
        }

        function mapMetadataToStaticSettings() {
          // Map ISO to spacing (higher ISO = denser grid) - Larger scale for better visibility
          const iso = imageMetadata?.iso || 200
          settings.spacing = Math.max(4, Math.min(12, 10 - (iso / 300)))
          
          // Map ISO to dot size range (dramatic size variation)
          settings.dotMinSize = Math.max(0.5, Math.min(2.0, 1.0 - (iso / 1000)))
          settings.dotMaxSize = Math.max(4.0, Math.min(12.0, 8.0 + (iso / 200)))
          
          // Map ISO to noise scale (more detail for topographic contours)
          settings.noiseScale = Math.max(0.02, Math.min(0.08, 0.04 + (iso / 15000)))
          
          // Map ISO to animation speed
          animationSpeed = Math.max(0.003, Math.min(0.02, 0.008 + (iso / 12000)))
          
          // Color mode based on season (if available)
          if (imageMetadata?.season === 'winter' || imageMetadata?.season === 'spring') {
            settings.colorMode = 'monochrome'
        } else {
            settings.colorMode = 'rainbow'
          }
        }

        function renderAnimatedPattern() {
          // Ensure spacing is valid to prevent crashes
          if (!settings.spacing || settings.spacing < 1) {
            settings.spacing = 6 // Default fallback
          }
          
          const cols = Math.floor(p.width / settings.spacing)
          const rows = Math.floor(p.height / settings.spacing)
          
          for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
              const baseX = x * settings.spacing
              const baseY = y * settings.spacing
              
              // Calculate noise values for this position
              const noiseX = baseX * settings.noiseScale
              const noiseY = baseY * settings.noiseScale
              
              // Add subtle grid warping for organic topographic flow
              const warpX = p.noise(noiseX + 3000, noiseY + 3000, time * 0.2) * 6 - 3 // -3 to +3 pixel warp
              const warpY = p.noise(noiseX + 4000, noiseY + 4000, time * 0.2) * 6 - 3 // -3 to +3 pixel warp
              
              // Add subtle animated undulation on top of warping
              const undulationX = p.noise(noiseX + 5000, noiseY + 5000, time) * 2 - 1 // -1 to +1 pixel shift
              const undulationY = p.noise(noiseX + 6000, noiseY + 6000, time) * 2 - 1 // -1 to +1 pixel shift
              
              const screenX = baseX + warpX + undulationX
              const screenY = baseY + warpY + undulationY
              
              // Get noise value for size variation (also animated)
              const sizeNoise = p.noise(noiseX, noiseY, time * 0.5)
              const dotSize = p.map(sizeNoise, 0, 1, settings.dotMinSize, settings.dotMaxSize)
              
              // Get noise value for brightness variation (contour-like elevation effect)
              const brightnessNoise = p.noise(noiseX + 1000, noiseY + 1000, time * 0.3)
              // Create dramatic brightness contrast for topographic effect - bright peaks, dark valleys
              const brightness = p.map(brightnessNoise, 0, 1, 10, 100)
              
              // Apply tinting to white base color, then convert to HSB for topographic effect
              const baseColor = p.color(255, 255, 255, 255)
              const tintedColor = applyTintToColor(baseColor, tint)
              
              // Convert tinted color to HSB and apply brightness variation
              p.colorMode(p.RGB, 255, 255, 255, 255)
              const rgbColor = p.color(tintedColor.levels[0], tintedColor.levels[1], tintedColor.levels[2])
              p.colorMode(p.HSB, 360, 100, 100, 100)
              
              const hue = p.hue(rgbColor)
              const saturation = p.saturation(rgbColor)
              const finalBrightness = p.map(brightness, 10, 100, 20, 100) // Map brightness to visible range
              
              p.fill(hue, saturation, finalBrightness, 90)
              
              p.noStroke()
              
              // Draw the shape based on lens type
              drawShape(screenX, screenY, dotSize)
            }
          }
        }

        function drawShape(x, y, size) {
          // Get shape from metadata
          let shapeType = 'circle' // default
          if (imageMetadata && imageMetadata.lensType) {
            const lens = imageMetadata.lensType.toLowerCase()
            if (lens.includes('front')) shapeType = 'circle'
            else if (lens.includes('wide')) shapeType = 'rectangle'
            else if (lens.includes('telephoto')) shapeType = 'triangle'
            else if (lens.includes('macro')) shapeType = 'rhombus'
            else if (lens.includes('zoom')) shapeType = 'star'
          }
          
          switch (shapeType) {
            case 'circle':
              p.ellipse(x, y, size)
              break
            case 'rectangle':
              p.rect(x - size/2, y - size/2, size, size)
              break
            case 'triangle':
              p.triangle(
                x, y - size,
                x - size, y + size,
                x + size, y + size
              )
              break
            case 'rhombus':
              p.beginShape()
              p.vertex(x, y - size)
              p.vertex(x - size, y)
              p.vertex(x, y + size)
              p.vertex(x + size, y)
              p.endShape(p.CLOSE)
              break
            case 'star':
              drawStar(x, y, size)
              break
          }
        }

        function drawStar(x, y, size) {
          const spikes = 5
          const outerRadius = size
          const innerRadius = size * 0.4
          
          p.beginShape()
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (i * p.PI) / spikes
            const px = x + p.cos(angle) * radius
            const py = y + p.sin(angle) * radius
            p.vertex(px, py)
          }
          p.endShape(p.CLOSE)
        }
      }
      
      // Create and run the P5.js sketch
      const p5Instance = new p5(sketch, canvasRef.current)
      
      // Wait for the sketch to render
      setTimeout(() => {
        // Copy P5.js canvas to our main canvas
        const p5Canvas = p5Instance.canvas
        
        // Draw the P5.js canvas to our display canvas
        ctx.drawImage(p5Canvas, 0, 0, width, height)
        
        // Clean up P5.js instance
        p5Instance.remove()
      }, 100)
      
    } catch (error) {
      console.error('Error loading P5.js:', error)
      // Fallback to simple pattern
      ctx.fillStyle = tint || '#ffffff'
      ctx.fillRect(width/2 - 10, height/2 - 10, 20, 20)
    }
  }

  // Contour pattern generation using P5.js for authentic noise
  const generateContourPattern = async (ctx, width, height) => {
    // Set background to black
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    
    try {
      // Import P5.js dynamically
      const p5Module = await import('p5')
      const p5 = p5Module.default
      
      // Create P5.js sketch for contour pattern
      const sketch = (p) => {
        let settings = {
          spacing: 4,
          shapeSize: 1.2,
          noiseScale: 0.02,
          contourSpacing: 8
        }
        let time = 0
        let animationSpeed = 0.005

        p.setup = function() {
          // Create canvas at normal size
          const canvas = p.createCanvas(width, height)
          p.colorMode(p.HSB, 360, 100, 100, 100)
          p.background(0, 0, 0)
          
          // Set random seed for deterministic randomness
          p.randomSeed(42) // Fixed seed for consistency
          p.noiseSeed(42)
          
          // Map metadata to settings
          mapMetadataToShapeContourSettings()
        }

        p.draw = function() {
          // Clear background
          p.background(0, 0, 0)
          
          // Update time for animation
          time += animationSpeed
          
          // Draw contour lines made of shapes
          drawShapeContours()
        }

        function mapMetadataToShapeContourSettings() {
          // Get shape from metadata
          let shape = 'circle' // default
          if (imageMetadata && imageMetadata.lensType) {
            const lens = imageMetadata.lensType.toLowerCase()
            if (lens.includes('front')) shape = 'circle'
            else if (lens.includes('wide')) shape = 'rectangle'
            else if (lens.includes('telephoto')) shape = 'triangle'
          }
          
          // Map ISO to spacing (higher ISO = denser shapes)
          const iso = imageMetadata?.iso || 200
          settings.spacing = Math.max(2, Math.min(6, 4 - (iso / 400)))
          
          // Map ISO to shape size
          settings.shapeSize = Math.max(0.8, Math.min(2.0, 1.2 + (iso / 800)))
          
          // Map ISO to noise scale and other settings
          settings.noiseScale = Math.max(0.01, Math.min(0.04, 0.02 + (iso / 15000)))
          animationSpeed = Math.max(0.002, Math.min(0.008, 0.005 + (iso / 12000)))
          
          // Store shape for use in drawShapeContours
          p.shapeType = shape
        }

        function drawShapeContours() {
          // Save the current transformation matrix
          p.push()
          
          // Move to center of canvas for rotation and zoom
          p.translate(p.width / 2, p.height / 2)
          
          // Apply zoom transformation
          // Convert zoom (-1.0 to +1.0) to scale factor (0.5x to 2.0x)
          const zoomScale = zoom >= 0 ? 1 + zoom : 1 / (1 - zoom) // 0 = 1.0x, +1 = 2.0x, -1 = 0.5x
          p.scale(zoomScale)
          
          // Apply rotation to entire pattern
          p.rotate(rotation * Math.PI / 180)
          
          // Move back to original coordinate system
          p.translate(-p.width / 2, -p.height / 2)
          
          // Create proper contour lines using shapes at specific elevation levels
          for (let elevation = 0; elevation < 1; elevation += 0.2) {
            p.noStroke()
            
            // Apply tinting to white base color
            if (tint && tint !== '#FFFFFF') {
              // Convert tint color to RGB
              const tintR = parseInt(tint.slice(1, 3), 16)
              const tintG = parseInt(tint.slice(3, 5), 16)
              const tintB = parseInt(tint.slice(5, 7), 16)
              
              // Blend white (255,255,255) with tint color using multiplication
              const blendedR = Math.min(255, Math.floor(255 * tintR / 255))
              const blendedG = Math.min(255, Math.floor(255 * tintG / 255))
              const blendedB = Math.min(255, Math.floor(255 * tintB / 255))
              
              // Convert to HSB for p5.js
              p.colorMode(p.RGB, 255, 255, 255, 255)
              const rgbColor = p.color(blendedR, blendedG, blendedB)
              p.colorMode(p.HSB, 360, 100, 100, 100)
              
              const hue = p.hue(rgbColor)
              const saturation = p.saturation(rgbColor)
              const brightness = p.brightness(rgbColor)
              
              p.fill(hue, saturation, brightness, 90)
            } else {
              // No tinting, use white
              p.fill(0, 0, 100, 90) // White in HSB
            }
            
            // Create a grid to sample elevation data
            const gridSize = 6
            const cols = Math.floor(p.width / gridSize) + 1
            const rows = Math.floor(p.height / gridSize) + 1
            
            // Create elevation grid
            let elevationGrid = []
            for (let x = 0; x < cols; x++) {
              elevationGrid[x] = []
              for (let y = 0; y < rows; y++) {
                const baseX = x * gridSize
                const baseY = y * gridSize
                
                const noiseX = baseX * settings.noiseScale
                const noiseY = baseY * settings.noiseScale
                
                // Add warping
                const warpX = p.noise(noiseX + 2000, noiseY + 2000, time * 0.1) * 2 - 1
                const warpY = p.noise(noiseX + 3000, noiseY + 3000, time * 0.1) * 2 - 1
                
                elevationGrid[x][y] = {
                  x: baseX + warpX,
                  y: baseY + warpY,
                  elevation: p.noise(noiseX, noiseY, time * 0.3)
                }
              }
            }
            
            // Find contour line segments using marching squares approach
            for (let x = 0; x < cols - 1; x++) {
              for (let y = 0; y < rows - 1; y++) {
                const p1 = elevationGrid[x][y]
                const p2 = elevationGrid[x + 1][y]
                const p3 = elevationGrid[x + 1][y + 1]
                const p4 = elevationGrid[x][y + 1]
                
                // Check each edge of the square for contour intersections
                const edges = [
                  {p1: p1, p2: p2}, // top edge
                  {p1: p2, p2: p3}, // right edge
                  {p1: p3, p2: p4}, // bottom edge
                  {p1: p4, p2: p1}  // left edge
                ]
                
                edges.forEach(edge => {
                  const e1 = edge.p1.elevation
                  const e2 = edge.p2.elevation
                  
                  // Check if contour line crosses this edge
                  if ((e1 < elevation && e2 >= elevation) || (e1 >= elevation && e2 < elevation)) {
                    // Calculate intersection point
                    const t = (elevation - e1) / (e2 - e1)
                    const ix = edge.p1.x + t * (edge.p2.x - edge.p1.x)
                    const iy = edge.p1.y + t * (edge.p2.y - edge.p1.y)
                    
                    // Draw shape at the intersection point
                    drawShape(ix, iy, settings.shapeSize, p.shapeType)
                  }
                })
              }
            }
          }
          
          // Restore the transformation matrix
          p.pop()
        }

        function drawShape(x, y, size, shapeType) {
          switch (shapeType) {
            case 'circle':
              p.ellipse(x, y, size, size)
              break
            case 'rectangle':
              p.rect(x - size/2, y - size/2, size, size)
              break
            case 'triangle':
              p.triangle(x, y - size/2, x - size/2, y + size/2, x + size/2, y + size/2)
              break
          }
        }
      }
      
      // Create and run the P5.js sketch
      const p5Instance = new p5(sketch, canvasRef.current)
      
      // Wait for the sketch to render
      setTimeout(() => {
        // Copy P5.js canvas to our main canvas
        const p5Canvas = p5Instance.canvas
        
        // Draw the P5.js canvas to our display canvas
        ctx.drawImage(p5Canvas, 0, 0, width, height)
        
        // Clean up P5.js instance
        p5Instance.remove()
      }, 100)
      
    } catch (error) {
      console.error('Error loading P5.js:', error)
      // Fallback to simple pattern
      ctx.fillStyle = tint || '#ffffff'
      ctx.fillRect(width/2 - 10, height/2 - 10, 20, 20)
    }
  }


  // Helper function to draw shapes
  const drawShape = (ctx, x, y, size, shapeType) => {
    switch (shapeType) {
      case 'circle':
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'rectangle':
        ctx.fillRect(x - size/2, y - size/2, size, size)
        break
      case 'triangle':
        ctx.beginPath()
        ctx.moveTo(x, y - size/2)
        ctx.lineTo(x - size/2, y + size/2)
        ctx.lineTo(x + size/2, y + size/2)
        ctx.closePath()
        ctx.fill()
        break
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
            Zoom: <span className="text-yellow-300">{zoom}x</span>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={zoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
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
            zoom={zoom}
            onPatternTypeChange={onPatternTypeChange}
            onFrequencyChange={onFrequencyChange}
            onRotationChange={onRotationChange}
            onScaleChange={onScaleChange}
            onTintChange={onTintChange}
            onZoomChange={onZoomChange}
          />
        </div>
      </div>
    </div>
  )
}

export default ConsoleFrame
