import React from 'react'
import Controls from './Controls'

const Switchboard = ({ 
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
  return (
    <Controls 
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
  )
}

export default Switchboard