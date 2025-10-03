import { ImageMetadata } from './metadataExtractor';
import seedrandom from 'seedrandom';

export interface P5PatternParams {
  // Basic parameters
  shape: 'circle' | 'rectangle' | 'triangle' | 'rhombus' | 'star';
  density: number;
  alignment: 'vertical' | 'horizontal' | 'both';
  sharpness: 'sharp' | 'blurred';
  seed: number;
  
  // P5.js specific parameters
  flowIntensity: number;
  organicCurves: boolean;
  depthLayers: number;
  colorGradient: boolean;
  iridescentEffect: boolean;
  centralGlow: boolean;
  particleSize: number;
  motionBlur: number;
  
  // Advanced P5.js parameters
  noiseScale: number; // Controls noise detail
  noiseSpeed: number; // Controls animation speed
  particleCount: number; // Number of particles
  streamCount: number; // Number of flowing streams
  turbulence: number; // Turbulence in the flow
  colorShift: number; // Color shifting over time
  glowIntensity: number; // Intensity of glow effects
  
  // Pattern type for special handling
  patternType?: string;
  
  // Additional parameters for original pattern functions
  iso?: number;
  season?: string;
  // Color tinting
  tintColor?: string | null; // Hex color for tinting
}

/**
 * Creates a P5.js sketch for advanced flowing patterns
 */
export const createP5Sketch = async (
  container: HTMLElement,
  getParams: () => P5PatternParams,
  metadata: ImageMetadata | null
): Promise<any> => {
  const p5Module = await import('p5');
  const p5 = p5Module.default;
  
  // Get initial parameters
  let currentParams: P5PatternParams;
  try {
    currentParams = getParams();
  } catch (error) {
    console.error('Error getting initial params:', error);
    return null;
  }
  
  return new p5((p: any) => {
    let particles: Particle[] = [];
    let streams: Stream[] = [];
    let time = 0;
    let colorPalette: p5.Color[] = [];
    
    // Store params in a way that's accessible to all functions
    let params = currentParams;
    
    p.setup = () => {
      console.log('P5 setup called, container size:', container.clientWidth, container.clientHeight);
      
      // Set frame rate for better performance
      p.frameRate(30); // Limit to 30 FPS for better performance
      
      // Get container dimensions with multiple fallback strategies
      let width = 0;
      let height = 0;
      
      // Strategy 1: Try clientWidth/clientHeight
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        width = container.clientWidth;
        height = container.clientHeight;
        console.log('Using clientWidth/clientHeight:', width, height);
      }
      // Strategy 2: Try offsetWidth/offsetHeight
      else if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        width = container.offsetWidth;
        height = container.offsetHeight;
        console.log('Using offsetWidth/offsetHeight:', width, height);
      }
      // Strategy 3: Try getBoundingClientRect
      else {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          width = rect.width;
          height = rect.height;
          console.log('Using getBoundingClientRect:', width, height);
        }
      }
      
      // Strategy 4: Use hardcoded fallback if all else fails
      if (width <= 0 || height <= 0) {
        console.warn('All dimension strategies failed, using hardcoded fallback');
        width = 500;
        height = 400;
      }
      
      // Final safety check - ensure dimensions are reasonable
      width = Math.max(Math.min(width, 2000), 100); // Between 100 and 2000
      height = Math.max(Math.min(height, 2000), 100); // Between 100 and 2000
      
      console.log('Creating canvas with final dimensions:', width, height);
      
      // Create canvas with explicit dimensions
      const canvas = p.createCanvas(width, height);
      canvas.parent(container);
      
      // Set color mode
      p.colorMode(p.HSB, 360, 100, 100, 100);
      p.background(0, 0, 0);
      
      console.log('P5 canvas created successfully with size:', p.width, p.height);
      
      // Initialize color palette
      initializeColorPalette(p);
      
      // Initialize particles and streams
      initializeParticles(p);
      initializeStreams(p);
      
      console.log('Canvas setup complete');
      
      // Add a delay to ensure canvas is fully ready before starting draw loop
      setTimeout(() => {
        console.log('Canvas should be fully ready now');
      }, 100);
    };

    p.draw = () => {
      // Check if canvas and renderer are ready
      if (!p.canvas || !p.canvas.getContext('2d') || !p._renderer || !p._renderer.pixels) {
        return;
      }
      
      try {
        // Update params from the getParams function
        try {
          params = getParams();
        } catch (error) {
          console.error('Error getting params:', error);
          return;
        }
        
        if (!params) {
          console.error('Params is null or undefined');
          return;
        }
        
        // Clear background with slight fade for motion blur effect
        if (params.motionBlur > 0) {
          p.fill(0, 0, 0, 100 - params.motionBlur * 50);
          p.noStroke();
          p.rect(0, 0, p.width, p.height);
        } else {
          p.background(0, 0, 0);
        }
        
        time += params.noiseSpeed * 0.01;
        
        // Draw central glow if enabled
        if (params.centralGlow) {
          drawCentralGlow(p);
        }
        
        // Special handling for different pattern types
        console.log('p5.js draw function - patternType:', params.patternType);
        
        if (params.patternType === 'wave') {
          console.log('Drawing sinusoidal waves');
          drawSinusoidalWaves(p, time, params);
        } else if (params.patternType === 'bump') {
          console.log('Drawing flowing dot field');
          drawFlowingDotField(p, time, params);
        } else if (params.patternType === 'contour') {
          console.log('Drawing shape contours');
          drawShapeContours(p, time, params);
        } else if (params.patternType === 'bouncing') {
          console.log('Drawing bouncing animation');
          drawBouncingAnimation(p, time, params);
        } else if (params.patternType === 'static') {
          console.log('Drawing static contours');
          drawStaticContours(p, time, params);
        } else if (params.patternType === 'topographic') {
          console.log('Drawing topographic lines');
          drawTopographicLines(p, time, params);
        } else {
          console.log('Drawing default streams and particles - patternType was:', params.patternType);
          // Default behavior for other patterns - draw streams and particles
          streams.forEach(stream => {
            stream.update(p, time, params);
            stream.draw(p, params);
          });
          
          particles.forEach(particle => {
            particle.update(p, time, params);
            particle.draw(p, params);
          });
        }
      } catch (error) {
        console.error('Error in p5.js draw function:', error);
        // Draw a simple fallback pattern
        p.background(0, 0, 0);
        p.fill(255, 0, 100);
        p.noStroke();
        p.ellipse(p.width/2, p.height/2, 50, 50);
      }
    };

    p.windowResized = () => {
      console.log('Window resized, container size:', container.clientWidth, container.clientHeight);
      
      // Get container dimensions with multiple fallback strategies
      let width = 0;
      let height = 0;
      
      // Strategy 1: Try clientWidth/clientHeight
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        width = container.clientWidth;
        height = container.clientHeight;
        console.log('Using clientWidth/clientHeight for resize:', width, height);
      }
      // Strategy 2: Try offsetWidth/offsetHeight
      else if (container.offsetWidth > 0 && container.offsetHeight > 0) {
        width = container.offsetWidth;
        height = container.offsetHeight;
        console.log('Using offsetWidth/offsetHeight for resize:', width, height);
      }
      // Strategy 3: Try getBoundingClientRect
      else {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          width = rect.width;
          height = rect.height;
          console.log('Using getBoundingClientRect for resize:', width, height);
        }
      }
      
      // Strategy 4: Use hardcoded fallback if all else fails
      if (width <= 0 || height <= 0) {
        console.warn('All dimension strategies failed on resize, using hardcoded fallback');
        width = 500;
        height = 400;
      }
      
      // Final safety check - ensure dimensions are reasonable
      width = Math.max(Math.min(width, 2000), 100); // Between 100 and 2000
      height = Math.max(Math.min(height, 2000), 100); // Between 100 and 2000
      
      console.log('Resizing canvas to:', width, height);
      p.resizeCanvas(width, height);
    };
    
    // Helper functions
    function initializeColorPalette(p: p5) {
      colorPalette = [];
      
      // Base colors
      const baseColors = [
        p.color(200, 80, 100), // White-blue
        p.color(220, 60, 90),  // Light blue
        p.color(40, 70, 100),  // Gold
        p.color(30, 80, 90),   // Orange
        p.color(0, 0, 100),    // White
        p.color(180, 50, 80)   // Light purple
      ];
      
      // Add iridescent colors if enabled
      if (params.iridescentEffect) {
        for (let i = 0; i < 360; i += 30) {
          colorPalette.push(p.color(i, 80, 90));
        }
      }
      
      // Add base colors
      colorPalette.push(...baseColors);
    }
    
    function initializeParticles(p: p5) {
      particles = [];
      for (let i = 0; i < params.particleCount; i++) {
        particles.push(new Particle(p, i % params.streamCount, params));
      }
    }
    
    function initializeStreams(p: p5) {
      streams = [];
      for (let i = 0; i < params.streamCount; i++) {
        streams.push(new Stream(p, i, params));
      }
    }
    
    function drawCentralGlow(p: p5) {
      const centerX = p.width / 2;
      const centerY = p.height / 2;
      
      // Create radial gradient
      for (let i = 0; i < 5; i++) {
        const radius = 50 + i * 20;
        const alpha = 20 - i * 3;
        
        p.fill(40, 60, 100, alpha);
        p.noStroke();
        p.ellipse(centerX, centerY, radius * 2);
      }
    }
    
    // Shape Contours Pattern (Option 6) - Original Flowing Style
    function drawShapeContours(p: p5, time: number, params: P5PatternParams) {
      console.log('drawShapeContours called with params:', params);
      
      // Clear background with motion blur effect like original
      if (params.motionBlur > 0) {
        p.fill(0, 0, 0, 100 - params.motionBlur * 50);
        p.noStroke();
        p.rect(0, 0, p.width, p.height);
      } else {
        p.background(0, 0, 0);
      }
      
      time += params.noiseSpeed * 0.01;
      
      // Create flowing shape streams like the original particle system
      const numStreams = Math.max(4, Math.floor(params.streamCount));
      const centerX = p.width / 2;
      const centerY = p.height / 2;
      
      for (let stream = 0; stream < numStreams; stream++) {
        drawFlowingShapeStream(p, time, params, stream, numStreams, centerX, centerY);
      }
    }
    
    // Draw a single flowing shape stream (similar to original Stream class)
    function drawFlowingShapeStream(p: p5, time: number, params: P5PatternParams, streamIndex: number, totalStreams: number, centerX: number, centerY: number) {
      const maxPoints = 70;
      const points: Array<{x: number, y: number, size: number, color: p5.Color}> = [];
      
      // Generate flowing shape path with shape-based variations
      for (let i = 0; i < maxPoints; i++) {
        const t = i / maxPoints;
        const angle = t * p.TWO_PI * 2.5 + streamIndex * (p.TWO_PI / totalStreams);
        
        // Create flowing, organic shape curves
        const radius = 70 + p.noise(streamIndex, t * 4) * 110;
        const x = centerX + p.cos(angle) * radius + p.sin(t * p.PI * 5) * 35;
        const y = centerY + p.sin(angle) * radius + p.cos(t * p.PI * 4) * 25;
        
        // Add shape flow intensity
        const flowX = p.sin(t * p.PI * 7 + streamIndex) * params.flowIntensity * 35;
        const flowY = p.cos(t * p.PI * 6 + streamIndex) * params.flowIntensity * 25;
        
        const finalX = x + flowX;
        const finalY = y + flowY;
        
        // Calculate size based on position and flow
        const size = (4 + p.random(10)) * params.particleSize;
        
        // Generate color with original color palette (shape-based colors)
        const colors = [
          p.color(200, 80, 100), // White-blue
          p.color(220, 60, 90),  // Light blue
          p.color(40, 70, 100),  // Gold
          p.color(30, 80, 90),   // Orange
          p.color(0, 0, 100),    // White
          p.color(180, 50, 80)   // Light purple
        ];
        const color = p.random(colors);
        
        points.push({ x: finalX, y: finalY, size, color });
      }
      
      // Draw the flowing shape stream
      points.forEach((point, index) => {
        if (point.x >= 0 && point.x < p.width && point.y >= 0 && point.y < p.height) {
          // Apply motion blur effect like original
          if (params.motionBlur > 0) {
            p.drawingContext.globalAlpha = 0.7;
            drawShapeWithBlur(p, point.x, point.y, point.size, params.shape, params.motionBlur);
            p.drawingContext.globalAlpha = 1.0;
          } else {
            drawShapeAtPoint(p, point.x, point.y, point.size, params.shape);
          }
          
          // Apply glow effect like original
          if (params.glowIntensity > 0) {
            p.drawingContext.shadowColor = p.color(p.hue(point.color), p.saturation(point.color), p.brightness(point.color), 50);
            p.drawingContext.shadowBlur = params.glowIntensity * 20;
          }
          
          p.fill(point.color);
          p.noStroke();
          drawShapeAtPoint(p, point.x, point.y, point.size, params.shape);
          
          // Reset glow
          p.drawingContext.shadowBlur = 0;
        }
      });
    }
    
    function drawShapeAtPoint(p: p5, x: number, y: number, size: number, shapeType: P5PatternParams['shape']) {
      switch (shapeType) {
        case 'circle':
          p.ellipse(x, y, size, size);
          break;
        case 'rectangle':
          p.rect(x - size/2, y - size/2, size, size);
          break;
        case 'triangle':
          p.triangle(x, y - size/2, x - size/2, y + size/2, x + size/2, y + size/2);
          break;
        case 'rhombus':
          p.quad(x, y - size/2, x + size/2, y, x, y + size/2, x - size/2, y);
          break;
        case 'star':
          drawStarAtPoint(p, x, y, size);
          break;
      }
    }
    
    function drawStarAtPoint(p: p5, x: number, y: number, size: number) {
      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size * 0.4;
      
      p.beginShape();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * p.PI) / spikes;
        const px = x + p.cos(angle) * radius;
        const py = y + p.sin(angle) * radius;
        p.vertex(px, py);
      }
      p.endShape(p.CLOSE);
    }
    
    // Bouncing Animation Pattern (Option 1)
    function drawBouncingAnimation(p: p5, time: number, params: P5PatternParams) {
      const spacing = Math.max(10, 50 * (1 - params.density));
      
      for (let x = 0; x < p.width; x += spacing) {
        for (let y = 0; y < p.height; y += spacing) {
          // Apply Perlin noise displacement
          const noiseX = p.noise(x * params.noiseScale, y * params.noiseScale, time);
          const noiseY = p.noise(x * params.noiseScale + 1000, y * params.noiseScale + 1000, time);
          
          // Calculate displacement based on alignment
          let displacementX = 0;
          let displacementY = 0;
          
          if (params.alignment === 'horizontal') {
            displacementX = p.map(noiseX, 0, 1, -30, 30);
          } else if (params.alignment === 'vertical') {
            displacementY = p.map(noiseY, 0, 1, -30, 30);
          } else {
            displacementX = p.map(noiseX, 0, 1, -20, 20);
            displacementY = p.map(noiseY, 0, 1, -20, 20);
          }
          
          const finalX = x + displacementX;
          const finalY = y + displacementY;
          const size = p.random(2, 8) * params.particleSize;
          
          // Draw shape
          p.fill(200, 80, 100, 90);
          p.noStroke();
          drawShapeAtPoint(p, finalX, finalY, size, params.shape);
        }
      }
    }
    
    // Sinusoidal Waves Pattern (Option 2) - Original Flowing Style
    function drawSinusoidalWaves(p: p5, time: number, params: P5PatternParams) {
      console.log('drawSinusoidalWaves called with params:', params);
      
      // Clear background with motion blur effect like original
      if (params.motionBlur > 0) {
        p.fill(0, 0, 0, 100 - params.motionBlur * 50);
        p.noStroke();
        p.rect(0, 0, p.width, p.height);
      } else {
        p.background(0, 0, 0);
      }
      
      time += params.noiseSpeed * 0.01;
      
      // Create flowing wave streams like the original particle system
      const numStreams = Math.max(2, Math.floor(params.streamCount));
      const centerX = p.width / 2;
      const centerY = p.height / 2;
      
      for (let stream = 0; stream < numStreams; stream++) {
        drawFlowingWaveStream(p, time, params, stream, numStreams, centerX, centerY);
      }
    }
    
    // Draw a single flowing wave stream (similar to original Stream class)
    function drawFlowingWaveStream(p: p5, time: number, params: P5PatternParams, streamIndex: number, totalStreams: number, centerX: number, centerY: number) {
      const maxPoints = 50;
      const points: Array<{x: number, y: number, size: number, color: p5.Color}> = [];
      
      // Generate flowing wave path
      for (let i = 0; i < maxPoints; i++) {
        const t = i / maxPoints;
        const angle = t * p.TWO_PI * 2 + streamIndex * (p.TWO_PI / totalStreams);
        
        // Create flowing, organic wave curves
        const radius = 80 + p.noise(streamIndex, t * 5) * 120;
        const x = centerX + p.cos(angle) * radius + p.sin(t * p.PI * 6) * 40;
        const y = centerY + p.sin(angle) * radius + p.cos(t * p.PI * 4) * 25;
        
        // Add wave flow intensity
        const flowX = p.sin(t * p.PI * 8 + streamIndex) * params.flowIntensity * 30;
        const flowY = p.cos(t * p.PI * 6 + streamIndex) * params.flowIntensity * 20;
        
        const finalX = x + flowX;
        const finalY = y + flowY;
        
        // Calculate size based on position and flow
        const size = (3 + p.random(8)) * params.particleSize;
        
        // Generate color with original color palette
        const colors = [
          p.color(200, 80, 100), // White-blue
          p.color(220, 60, 90),  // Light blue
          p.color(40, 70, 100),  // Gold
          p.color(30, 80, 90),   // Orange
          p.color(0, 0, 100),    // White
          p.color(180, 50, 80)   // Light purple
        ];
        const color = p.random(colors);
        
        points.push({ x: finalX, y: finalY, size, color });
      }
      
      // Draw the flowing wave stream
      points.forEach((point, index) => {
        if (point.x >= 0 && point.x < p.width && point.y >= 0 && point.y < p.height) {
          // Apply motion blur effect like original
          if (params.motionBlur > 0) {
            p.drawingContext.globalAlpha = 0.7;
            drawShapeWithBlur(p, point.x, point.y, point.size, params.shape, params.motionBlur);
            p.drawingContext.globalAlpha = 1.0;
          } else {
            drawShapeAtPoint(p, point.x, point.y, point.size, params.shape);
          }
          
          // Apply glow effect like original
          if (params.glowIntensity > 0) {
            p.drawingContext.shadowColor = p.color(p.hue(point.color), p.saturation(point.color), p.brightness(point.color), 50);
            p.drawingContext.shadowBlur = params.glowIntensity * 20;
          }
          
          p.fill(point.color);
          p.noStroke();
          drawShapeAtPoint(p, point.x, point.y, point.size, params.shape);
          
          // Reset glow
          p.drawingContext.shadowBlur = 0;
        }
      });
    }
    
    // Draw shape with motion blur effect (from original)
    function drawShapeWithBlur(p: p5, x: number, y: number, size: number, shape: P5PatternParams['shape'], blurIntensity: number) {
      const blurSteps = Math.floor(blurIntensity * 5) + 1;
      
      for (let i = 0; i < blurSteps; i++) {
        const offset = (i - blurSteps / 2) * blurIntensity * 3;
        const alpha = 1 - (i / blurSteps) * 0.5;
        
        p.drawingContext.globalAlpha = alpha;
        drawShapeAtPoint(p, x + offset, y + offset, size * (1 - i * 0.1), shape);
      }
      
      p.drawingContext.globalAlpha = 1.0;
    }
    
    // Flowing Dot Field Pattern (Option 3) - Original Implementation
    function drawFlowingDotField(p: p5, time: number, params: P5PatternParams) {
      // Set HSB color mode like the original
      p.colorMode(p.HSB, 360, 100, 100, 100);
      
      // Clear background completely each frame
      p.background(0, 0, 0);
      
      // Settings from original implementation
      const settings = {
        spacing: 20,
        dotMinSize: 1,
        dotMaxSize: 6,
        noiseScale: 0.02,
        speed: 0.01,
        colorMode: 'rainbow'
      };
      
      // Map metadata to settings (simplified for our context)
      const iso = params.iso || 200;
      settings.spacing = Math.max(5, Math.min(60, 30 - (iso / 100)));
      settings.dotMinSize = Math.max(0.5, Math.min(5, 2 - (iso / 1000)));
      settings.dotMaxSize = Math.max(3, Math.min(15, 8 + (iso / 200)));
      settings.noiseScale = Math.max(0.005, Math.min(0.05, 0.01 + (iso / 10000)));
      settings.speed = Math.max(0.005, Math.min(0.05, 0.01 + (iso / 2000)));
      
      // Color mode based on season (simplified)
      if (params.season === 'winter' || params.season === 'spring') {
        settings.colorMode = 'monochrome';
      } else {
        settings.colorMode = 'rainbow';
      }
      
      // Draw flowing dot field
      const cols = Math.floor(p.width / settings.spacing);
      const rows = Math.floor(p.height / settings.spacing);
      
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const screenX = x * settings.spacing;
          const screenY = y * settings.spacing;
          
          // Calculate noise values for this position
          const noiseX = screenX * settings.noiseScale;
          const noiseY = screenY * settings.noiseScale;
          const noiseZ = time * settings.speed; // Use speed multiplier
          
          // Get noise value for size variation
          const sizeNoise = p.noise(noiseX, noiseY, noiseZ);
          const dotSize = p.map(sizeNoise, 0, 1, settings.dotMinSize, settings.dotMaxSize);
          
          // Get noise value for brightness variation
          const brightnessNoise = p.noise(noiseX + 1000, noiseY + 1000, noiseZ);
          const brightness = p.map(brightnessNoise, 0, 1, 30, 100);
          
          // Get noise value for color variation
          const colorNoise = p.noise(noiseX + 2000, noiseY + 2000, noiseZ);
          
          // Set color based on mode
          let originalColor;
          if (settings.colorMode === 'rainbow') {
            const hue = p.map(colorNoise, 0, 1, 0, 360);
            originalColor = p.color(hue, 80, brightness, 90);
          } else {
            // Monochrome mode - use season-based colors
            const baseHue = getSeasonBaseHue(params.season);
            const hueVariation = p.map(colorNoise, 0, 1, baseHue - 30, baseHue + 30);
            originalColor = p.color(hueVariation, 60, brightness, 90);
          }
          
          // Apply tinting
          const tintedColor = applyTint(p, originalColor, params.tintColor);
          p.fill(tintedColor);
          
          p.noStroke();
          
          // Draw the dot
          p.ellipse(screenX, screenY, dotSize);
        }
      }
    }
    
    // Helper function for season-based colors
    function getSeasonBaseHue(season: string): number {
      const seasonHues = {
        winter: 200, // Blue
        spring: 120, // Green
        summer: 40,  // Orange
        fall: 20     // Red
      };
      return seasonHues[season as keyof typeof seasonHues] || 40;
    }
    
    // Static Contours Pattern (Option 4) - Original Flowing Style
    function drawStaticContours(p: p5, time: number, params: P5PatternParams) {
      console.log('drawStaticContours called with params:', params);
      
      // Clear background with motion blur effect like original
      if (params.motionBlur > 0) {
        p.fill(0, 0, 0, 100 - params.motionBlur * 50);
        p.noStroke();
        p.rect(0, 0, p.width, p.height);
      } else {
        p.background(0, 0, 0);
      }
      
      time += params.noiseSpeed * 0.01;
      
      // Create flowing contour streams like the original particle system
      const numStreams = Math.max(3, Math.floor(params.streamCount));
      const centerX = p.width / 2;
      const centerY = p.height / 2;
      
      for (let stream = 0; stream < numStreams; stream++) {
        drawFlowingContourStream(p, time, params, stream, numStreams, centerX, centerY);
      }
    }
    
    // Draw a single flowing contour stream (similar to original Stream class)
    function drawFlowingContourStream(p: p5, time: number, params: P5PatternParams, streamIndex: number, totalStreams: number, centerX: number, centerY: number) {
      const maxPoints = 60;
      const points: Array<{x: number, y: number, size: number, color: p5.Color}> = [];
      
      // Generate flowing contour path with elevation-like curves
      for (let i = 0; i < maxPoints; i++) {
        const t = i / maxPoints;
        const angle = t * p.TWO_PI * 1.5 + streamIndex * (p.TWO_PI / totalStreams);
        
        // Create flowing, organic contour curves
        const radius = 60 + p.noise(streamIndex, t * 3) * 100;
        const x = centerX + p.cos(angle) * radius + p.sin(t * p.PI * 4) * 30;
        const y = centerY + p.sin(angle) * radius + p.cos(t * p.PI * 3) * 20;
        
        // Add contour flow intensity
        const flowX = p.sin(t * p.PI * 6 + streamIndex) * params.flowIntensity * 25;
        const flowY = p.cos(t * p.PI * 5 + streamIndex) * params.flowIntensity * 15;
        
        const finalX = x + flowX;
        const finalY = y + flowY;
        
        // Calculate size based on position and flow
        const size = (2 + p.random(6)) * params.particleSize;
        
        // Generate color with original color palette (contour-like colors)
        const colors = [
          p.color(120, 80, 100), // Green
          p.color(140, 70, 90),  // Light green
          p.color(60, 70, 100),  // Yellow
          p.color(40, 80, 90),   // Orange
          p.color(0, 0, 100),    // White
          p.color(100, 50, 80)   // Light green
        ];
        const color = p.random(colors);
        
        points.push({ x: finalX, y: finalY, size, color });
      }
      
      // Draw the flowing contour stream
      points.forEach((point, index) => {
        if (point.x >= 0 && point.x < p.width && point.y >= 0 && point.y < p.height) {
          // Apply motion blur effect like original
          if (params.motionBlur > 0) {
            p.drawingContext.globalAlpha = 0.7;
            drawShapeWithBlur(p, point.x, point.y, point.size, params.shape, params.motionBlur);
            p.drawingContext.globalAlpha = 1.0;
          } else {
            drawShapeAtPoint(p, point.x, point.y, point.size, params.shape);
          }
          
          // Apply glow effect like original
          if (params.glowIntensity > 0) {
            p.drawingContext.shadowColor = p.color(p.hue(point.color), p.saturation(point.color), p.brightness(point.color), 50);
            p.drawingContext.shadowBlur = params.glowIntensity * 20;
          }
          
          p.fill(point.color);
          p.noStroke();
          drawShapeAtPoint(p, point.x, point.y, point.size, params.shape);
          
          // Reset glow
          p.drawingContext.shadowBlur = 0;
        }
      });
    }
    
    // Topographic Lines Pattern (Option 5)
    function drawTopographicLines(p: p5, time: number, params: P5PatternParams) {
      // Create topographic-style contour lines
      for (let elevation = 0; elevation < 1; elevation += 0.1) {
        p.stroke(0, 0, 100, 60); // White lines
        p.strokeWeight(1);
        p.noFill();
        
        // Create a grid to sample elevation data
        const gridSize = 4;
        const cols = Math.floor(p.width / gridSize) + 1;
        const rows = Math.floor(p.height / gridSize) + 1;
        
        // Create elevation grid
        let elevationGrid: Array<Array<{x: number, y: number, elevation: number}>> = [];
        for (let x = 0; x < cols; x++) {
          elevationGrid[x] = [];
          for (let y = 0; y < rows; y++) {
            const baseX = x * gridSize;
            const baseY = y * gridSize;
            
            const noiseX = baseX * params.noiseScale;
            const noiseY = baseY * params.noiseScale;
            
            // Add warping
            const warpX = p.noise(noiseX + 2000, noiseY + 2000, time * 0.1) * 3 - 1.5;
            const warpY = p.noise(noiseX + 3000, noiseY + 3000, time * 0.1) * 3 - 1.5;
            
            elevationGrid[x][y] = {
              x: baseX + warpX,
              y: baseY + warpY,
              elevation: p.noise(noiseX, noiseY, time * 0.3)
            };
          }
        }
        
        // Find contour line segments using marching squares approach
        for (let x = 0; x < cols - 1; x++) {
          for (let y = 0; y < rows - 1; y++) {
            const p1 = elevationGrid[x][y];
            const p2 = elevationGrid[x + 1][y];
            const p3 = elevationGrid[x + 1][y + 1];
            const p4 = elevationGrid[x][y + 1];
            
            // Check each edge of the square for contour intersections
            const edges = [
              {p1: p1, p2: p2}, // top edge
              {p1: p2, p2: p3}, // right edge
              {p1: p3, p2: p4}, // bottom edge
              {p1: p4, p2: p1}  // left edge
            ];
            
            edges.forEach(edge => {
              const e1 = edge.p1.elevation;
              const e2 = edge.p2.elevation;
              
              // Check if contour line crosses this edge
              if ((e1 < elevation && e2 >= elevation) || (e1 >= elevation && e2 < elevation)) {
                // Calculate intersection point
                const t = (elevation - e1) / (e2 - e1);
                const ix = edge.p1.x + t * (edge.p2.x - edge.p1.x);
                const iy = edge.p1.y + t * (edge.p2.y - edge.p1.y);
                
                // Draw a small line segment at the intersection
                p.line(ix - 2, iy, ix + 2, iy);
              }
            });
          }
        }
      }
    }
    
  });
};

/**
 * Particle class for individual flowing elements
 */
class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: p5.Color;
  life: number;
  maxLife: number;
  streamId: number;
  
  constructor(p: p5, streamId: number, params: P5PatternParams) {
    this.streamId = streamId;
    this.x = p.random(p.width);
    this.y = p.random(p.height);
    this.vx = p.random(-2, 2);
    this.vy = p.random(-2, 2);
    this.size = p.random(2, 8) * params.particleSize;
    
    // Create a random color
    const colors = [
      p.color(200, 80, 100), // White-blue
      p.color(220, 60, 90),  // Light blue
      p.color(40, 70, 100),  // Gold
      p.color(30, 80, 90),   // Orange
      p.color(0, 0, 100),    // White
      p.color(180, 50, 80)   // Light purple
    ];
    this.color = p.random(colors);
    this.life = 0;
    this.maxLife = p.random(200, 500);
  }
  
  update(p: p5, time: number, params: P5PatternParams) {
    // Apply noise-based flow
    const noiseX = p.noise(this.x * params.noiseScale, this.y * params.noiseScale, time);
    const noiseY = p.noise(this.x * params.noiseScale + 1000, this.y * params.noiseScale + 1000, time);
    
    // Calculate flow direction
    const flowX = p.map(noiseX, 0, 1, -params.flowIntensity, params.flowIntensity);
    const flowY = p.map(noiseY, 0, 1, -params.flowIntensity, params.flowIntensity);
    
    // Add turbulence
    const turbulenceX = p.sin(time * 2 + this.x * 0.01) * params.turbulence;
    const turbulenceY = p.cos(time * 1.5 + this.y * 0.01) * params.turbulence;
    
    // Update velocity
    this.vx += flowX + turbulenceX;
    this.vy += flowY + turbulenceY;
    
    // Apply damping
    this.vx *= 0.98;
    this.vy *= 0.98;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Wrap around screen
    if (this.x < 0) this.x = p.width;
    if (this.x > p.width) this.x = 0;
    if (this.y < 0) this.y = p.height;
    if (this.y > p.height) this.y = 0;
    
    // Update life
    this.life++;
    if (this.life > this.maxLife) {
      this.life = 0;
      this.x = p.random(p.width);
      this.y = p.random(p.height);
    }
    
    // Update color with shifting
    if (params.colorShift > 0) {
      const hue = (p.hue(this.color) + params.colorShift * 0.1) % 360;
      this.color = p.color(hue, p.saturation(this.color), p.brightness(this.color), p.alpha(this.color));
    }
  }
  
  draw(p: p5, params: P5PatternParams) {
    const alpha = p.map(this.life, 0, this.maxLife, 0, 100);
    const originalColor = p.color(p.hue(this.color), p.saturation(this.color), p.brightness(this.color), alpha);
    const tintedColor = applyTint(p, originalColor, params.tintColor);
    p.fill(tintedColor);
    p.noStroke();
    
    // Apply glow effect
    if (params.glowIntensity > 0) {
      p.drawingContext.shadowColor = p.color(p.hue(this.color), p.saturation(this.color), p.brightness(this.color), 50);
      p.drawingContext.shadowBlur = params.glowIntensity * 20;
    }
    
    // Draw shape
    switch (params.shape) {
      case 'circle':
        p.ellipse(this.x, this.y, this.size);
        break;
      case 'rectangle':
        p.rect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        break;
      case 'triangle':
        p.triangle(this.x, this.y - this.size, this.x - this.size, this.y + this.size, this.x + this.size, this.y + this.size);
        break;
      case 'rhombus':
        p.beginShape();
        p.vertex(this.x, this.y - this.size);
        p.vertex(this.x - this.size, this.y);
        p.vertex(this.x, this.y + this.size);
        p.vertex(this.x + this.size, this.y);
        p.endShape(p.CLOSE);
        break;
      case 'star':
        drawStar(p, this.x, this.y, this.size);
        break;
    }
    
    // Reset glow
    p.drawingContext.shadowBlur = 0;
  }
}

/**
 * Stream class for flowing ribbon-like structures
 */
class Stream {
  points: Array<{x: number, y: number, size: number, color: p5.Color}>;
  maxPoints: number;
  streamId: number;
  
  constructor(p: p5, streamId: number, params: P5PatternParams) {
    this.streamId = streamId;
    this.maxPoints = 50;
    this.points = [];
    
    // Initialize stream with a flowing path
    for (let i = 0; i < this.maxPoints; i++) {
      const t = i / this.maxPoints;
      const angle = t * p.TWO_PI * 2 + streamId * (p.TWO_PI / params.streamCount);
      
      const radius = 100 + p.noise(streamId, t * 5) * 150;
      const x = p.width/2 + p.cos(angle) * radius + p.sin(t * p.PI * 4) * 50;
      const y = p.height/2 + p.sin(angle) * radius + p.cos(t * p.PI * 3) * 30;
      
      const size = p.random(3, 12) * params.particleSize;
      
      // Create a random color
      const colors = [
        p.color(200, 80, 100), // White-blue
        p.color(220, 60, 90),  // Light blue
        p.color(40, 70, 100),  // Gold
        p.color(30, 80, 90),   // Orange
        p.color(0, 0, 100),    // White
        p.color(180, 50, 80)   // Light purple
      ];
      const color = p.random(colors);
      
      this.points.push({ x, y, size, color });
    }
  }
  
  update(p: p5, time: number, params: P5PatternParams) {
    // Update each point in the stream
    this.points.forEach((point, index) => {
      const t = index / this.maxPoints;
      
      // Apply flowing motion
      const flowX = p.sin(time * 2 + t * p.PI * 6) * params.flowIntensity * 30;
      const flowY = p.cos(time * 1.5 + t * p.PI * 4) * params.flowIntensity * 20;
      
      // Apply noise-based movement
      const noiseX = p.noise(point.x * params.noiseScale, point.y * params.noiseScale, time);
      const noiseY = p.noise(point.x * params.noiseScale + 1000, point.y * params.noiseScale + 1000, time);
      
      point.x += p.map(noiseX, 0, 1, -1, 1) + flowX;
      point.y += p.map(noiseY, 0, 1, -1, 1) + flowY;
      
      // Keep points on screen
      if (point.x < 0) point.x = p.width;
      if (point.x > p.width) point.x = 0;
      if (point.y < 0) point.y = p.height;
      if (point.y > p.height) point.y = 0;
      
      // Update color
      if (params.colorShift > 0) {
        const hue = (p.hue(point.color) + params.colorShift * 0.05) % 360;
        point.color = p.color(hue, p.saturation(point.color), p.brightness(point.color), p.alpha(point.color));
      }
    });
  }
  
  draw(p: p5, params: P5PatternParams) {
    // Draw stream as connected points
    for (let i = 0; i < this.points.length - 1; i++) {
      const point1 = this.points[i];
      const point2 = this.points[i + 1];
      
      // Interpolate color between points
      const t = i / this.points.length;
      const originalColor = p.lerpColor(point1.color, point2.color, t);
      const tintedColor = applyTint(p, originalColor, params.tintColor);
      
      p.stroke(tintedColor);
      p.strokeWeight(point1.size * 0.5);
      p.line(point1.x, point1.y, point2.x, point2.y);
      
      // Draw point
      p.fill(tintedColor);
      p.noStroke();
      p.ellipse(point1.x, point1.y, point1.size);
    }
  }
}

/**
 * Draw a star shape
 */
function drawStar(p: p5, x: number, y: number, size: number) {
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  
  p.beginShape();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * p.PI) / spikes;
    const px = x + p.cos(angle) * radius;
    const py = y + p.sin(angle) * radius;
    
    if (i === 0) {
      p.vertex(px, py);
    } else {
      p.vertex(px, py);
    }
  }
  p.endShape(p.CLOSE);
}

/**
 * Map metadata to P5.js parameters
 */
export const mapMetadataToP5Params = (metadata: ImageMetadata, seed?: number): P5PatternParams => {
  const randomSeed = seed || Date.now();
  
  // Basic parameters
  const shape = mapLensToShape(metadata.lens);
  const density = mapIsoToDensity(metadata.iso);
  const alignment = mapOrientationToAlignment(metadata.orientation);
  const sharpness = mapFlashToSharpness(metadata.flash);
  
  // Automatic pattern type selection based on metadata
  const patternType = mapMetadataToPatternType(metadata);
  
  // P5.js specific parameters
  const flowIntensity = mapMetadataToFlowIntensity(metadata);
  const organicCurves = mapMetadataToOrganicCurves(metadata);
  const depthLayers = mapMetadataToDepthLayers(metadata);
  const colorGradient = mapMetadataToColorGradient(metadata);
  const iridescentEffect = mapMetadataToIridescentEffect(metadata);
  const centralGlow = mapMetadataToCentralGlow(metadata);
  const particleSize = mapMetadataToParticleSize(metadata);
  const motionBlur = mapMetadataToMotionBlur(metadata);
  
  // Advanced P5.js parameters
  const noiseScale = 0.01 + (metadata.iso ? metadata.iso / 20000 : 0.01);
  const noiseSpeed = 1 + (metadata.iso ? metadata.iso / 1000 : 1);
  // Optimize particle count for performance (reduce for better performance)
  const particleCount = Math.floor(50 + (metadata.iso ? metadata.iso / 20 : 50));
  const streamCount = 3 + (metadata.flash ? 2 : 0);
  const turbulence = 0.5 + (metadata.iso ? metadata.iso / 2000 : 0.5);
  const colorShift = metadata.flash ? 2 : 0.5;
  const glowIntensity = metadata.flash ? 0.8 : 0.3;
  
  return {
    shape,
    density,
    alignment,
    sharpness,
    seed: randomSeed,
    flowIntensity,
    organicCurves,
    depthLayers,
    colorGradient,
    iridescentEffect,
    centralGlow,
    particleSize,
    motionBlur,
    noiseScale,
    noiseSpeed,
    particleCount,
    streamCount,
    turbulence,
    colorShift,
    glowIntensity,
    patternType,
    // Additional parameters
    iso: metadata.iso,
    season: metadata.season,
    tintColor: null // Will be set by the component
  };
};

// Helper function to apply color tinting
function applyTint(p: p5, color: p5.Color, tintColor: string | null): p5.Color {
  if (!tintColor) return color;
  
  // Convert tint color to HSB for better blending
  const tint = p.color(tintColor);
  const originalH = p.hue(color);
  const originalS = p.saturation(color);
  const originalB = p.brightness(color);
  const originalA = p.alpha(color);
  
  const tintH = p.hue(tint);
  const tintS = p.saturation(tint);
  const tintB = p.brightness(tint);
  
  // Blend hue towards tint color (weighted average)
  const blendedH = (originalH + tintH * 0.3) % 360;
  // Increase saturation slightly when tinting
  const blendedS = Math.min(100, originalS + tintS * 0.2);
  // Keep original brightness but allow some tint influence
  const blendedB = Math.min(100, originalB + (tintB - 50) * 0.1);
  
  return p.color(blendedH, blendedS, blendedB, originalA);
}

// Helper functions
function mapLensToShape(lens?: string): P5PatternParams['shape'] {
  if (!lens) return 'star';
  const lensLower = lens.toLowerCase();
  if (lensLower.includes('front') || lensLower.includes('selfie')) return 'circle';
  else if (lensLower.includes('wide') && !lensLower.includes('ultra')) return 'rectangle';
  else if (lensLower.includes('telephoto') || lensLower.includes('zoom')) return 'triangle';
  else if (lensLower.includes('ultra wide') || lensLower.includes('ultra-wide')) return 'rhombus';
  else return 'star';
}

function mapIsoToDensity(iso?: number): number {
  if (!iso) return 0.3;
  const minIso = 24, maxIso = 2000, minDensity = 0.05, maxDensity = 1.0;
  const clampedIso = Math.max(minIso, Math.min(maxIso, iso));
  const normalizedIso = (clampedIso - minIso) / (maxIso - minIso);
  return Math.round((minDensity + (normalizedIso * (maxDensity - minDensity))) * 100) / 100;
}

function mapOrientationToAlignment(orientation?: number): P5PatternParams['alignment'] {
  if (!orientation) return 'both';
  if (orientation === 1 || orientation === 3) return 'horizontal';
  else if (orientation === 6 || orientation === 8) return 'vertical';
  else return 'both';
}

function mapFlashToSharpness(flash?: boolean): P5PatternParams['sharpness'] {
  return flash === undefined ? 'sharp' : (flash ? 'blurred' : 'sharp');
}

function mapMetadataToFlowIntensity(metadata: ImageMetadata): number {
  let intensity = 0.3;
  if (metadata.iso && metadata.iso > 800) intensity += 0.4;
  else if (metadata.iso && metadata.iso > 400) intensity += 0.2;
  if (metadata.lens) {
    const lensLower = metadata.lens.toLowerCase();
    if (lensLower.includes('ultra wide')) intensity += 0.3;
    else if (lensLower.includes('wide')) intensity += 0.2;
  }
  if (metadata.flash) intensity += 0.2;
  return Math.min(1.0, intensity);
}

function mapMetadataToOrganicCurves(metadata: ImageMetadata): boolean {
  if (!metadata.lens) return false;
  const lensLower = metadata.lens.toLowerCase();
  return lensLower.includes('ultra wide') || lensLower.includes('wide') || lensLower.includes('front');
}

function mapMetadataToDepthLayers(metadata: ImageMetadata): number {
  let layers = 2;
  if (metadata.iso && metadata.iso > 800) layers += 2;
  else if (metadata.iso && metadata.iso > 400) layers += 1;
  if (metadata.flash) layers += 1;
  return Math.min(5, Math.max(1, layers));
}

function mapMetadataToColorGradient(metadata: ImageMetadata): boolean {
  if (metadata.flash) return true;
  return metadata.season === 'summer' || metadata.season === 'autumn';
}

function mapMetadataToIridescentEffect(metadata: ImageMetadata): boolean {
  return !!(metadata.flash && metadata.iso && metadata.iso > 600) || metadata.season === 'summer';
}

function mapMetadataToCentralGlow(metadata: ImageMetadata): boolean {
  if (metadata.flash) return true;
  if (metadata.lens) {
    const lensLower = metadata.lens.toLowerCase();
    return lensLower.includes('front') || lensLower.includes('wide');
  }
  return false;
}

function mapMetadataToParticleSize(metadata: ImageMetadata): number {
  let size = 1.0;
  if (metadata.iso && metadata.iso > 800) size -= 0.3;
  else if (metadata.iso && metadata.iso > 400) size -= 0.1;
  if (metadata.flash) size += 0.2;
  return Math.max(0.5, Math.min(3.0, size));
}

function mapMetadataToMotionBlur(metadata: ImageMetadata): number {
  let blur = 0.0;
  if (metadata.flash) blur += 0.4;
  if (metadata.iso && metadata.iso > 800) blur += 0.3;
  else if (metadata.iso && metadata.iso > 400) blur += 0.1;
  return Math.min(1.0, blur);
}

function mapMetadataToPatternType(metadata: ImageMetadata): string {
  // Pattern selection based on camera and settings
  if (metadata.lensType) {
    const lensLower = metadata.lensType.toLowerCase();
    
    // Ultra Wide lens - flowing, organic patterns
    if (lensLower.includes('ultra wide')) {
      return 'wave'; // Sinusoidal waves work well for wide field of view
    }
    
    // Telephoto lens - detailed, structured patterns
    if (lensLower.includes('telephoto')) {
      return 'topographic'; // Topographic lines for detailed telephoto shots
    }
    
    // Front camera - simple, clean patterns
    if (lensLower.includes('front')) {
      return 'bouncing'; // Bouncing animation for selfies
    }
    
    // Wide lens - balanced patterns
    if (lensLower.includes('wide')) {
      return 'contour'; // Default to contours for wide shots
    }
  }
  
  // Pattern selection based on ISO (image quality/noise)
  if (metadata.iso) {
    if (metadata.iso <= 100) {
      return 'wave'; // Clean, smooth patterns for low ISO
    } else if (metadata.iso <= 400) {
      return 'contour'; // Balanced patterns for medium ISO
    } else {
      return 'static'; // Static patterns for high ISO/noisy images
    }
  }
  
  // Pattern selection based on flash usage
  if (metadata.flash) {
    return 'bouncing'; // Dynamic patterns for flash-lit images
  }
  
  // Pattern selection based on time of day
  if (metadata.timeOfDay) {
    if (metadata.timeOfDay === 'night') {
      return 'static'; // Static patterns for night shots
    } else {
      return 'wave'; // Flowing patterns for day shots
    }
  }
  
  // Pattern selection based on season
  if (metadata.season) {
    switch (metadata.season) {
      case 'spring':
        return 'wave'; // Flowing, organic patterns for spring
      case 'summer':
        return 'bouncing'; // Dynamic patterns for summer
      case 'autumn':
        return 'topographic'; // Structured patterns for autumn
      case 'winter':
        return 'static'; // Static patterns for winter
      default:
        return 'contour';
    }
  }
  
  // Default fallback
  return 'contour';
}

