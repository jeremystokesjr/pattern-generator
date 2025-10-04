import React, { useRef } from 'react'
import ImagePlaceholder from './ImagePlaceholder'

const UploadArea = ({ uploadedImage, onImageUpload }) => {
  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      await onImageUpload(file)
    } else {
      alert('Please select an image file')
    }
  }

  return (
    <div 
      className="w-[212px] h-[255px] bg-[#3A2F2A] border-2 border-dashed border-[#FF9966] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {uploadedImage ? (
        <ImagePlaceholder uploadedImage={uploadedImage} />
      ) : (
        <span className="text-white text-lg font-medium">Upload an image</span>
      )}
    </div>
  )
}

export default UploadArea
