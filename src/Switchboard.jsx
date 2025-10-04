import React from 'react'
import Controls from './Controls'

const Switchboard = ({ 
  patternType, 
  frequency, 
  rotation, 
  scale, 
  tint,
  zoom,
  animationSpeed,
  onPatternTypeChange,
  onFrequencyChange,
  onRotationChange,
  onScaleChange,
  onTintChange,
  onZoomChange,
  onAnimationSpeedChange
}) => {
  return (
    <Controls 
      patternType={patternType}
      frequency={frequency}
      rotation={rotation}
      scale={scale}
      tint={tint}
      zoom={zoom}
      animationSpeed={animationSpeed}
      onPatternTypeChange={onPatternTypeChange}
      onFrequencyChange={onFrequencyChange}
      onRotationChange={onRotationChange}
      onScaleChange={onScaleChange}
      onTintChange={onTintChange}
      onZoomChange={onZoomChange}
      onAnimationSpeedChange={onAnimationSpeedChange}
    />
  )
}

export default Switchboard