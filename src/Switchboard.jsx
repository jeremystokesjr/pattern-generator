import React from 'react'
import Controls from './Controls'

const Switchboard = ({ 
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
  return (
    <Controls 
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
  )
}

export default Switchboard