import React from 'react'
import ImagePlaceholder from './ImagePlaceholder'

const UploadArea = () => {
  return (
    <div className="w-[212px] h-[255px] bg-[#3A2F2A] border-2 border-dashed border-[#FF9966] rounded-xl flex flex-col items-center justify-center">
      <ImagePlaceholder />
    </div>
  )
}

export default UploadArea
