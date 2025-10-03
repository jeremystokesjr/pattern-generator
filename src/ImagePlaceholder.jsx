import React, { useRef, useState } from 'react'

const ImagePlaceholder = ({ uploadedImage, onImageUpload }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setIsProcessing(true)
      try {
        await onImageUpload(file)
      } finally {
        setIsProcessing(false)
      }
    } else {
      alert('Please select an image file')
    }
  }

  return (
    <div 
      className="w-[111px] h-[149px] inline-flex justify-center items-center gap-0.5 relative cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        borderRadius: '6px',
        borderBottom: '4px solid #BA452C',
        background: 'linear-gradient(180deg, #F85C3B 0%, #C9492D 100%)',
        padding: '9px 8px 9px 5px'
      }}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {/* Inner Container */}
      <div className="w-full h-[120px] bg-white border border-[#333333] rounded-md relative self-start flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="w-full h-[19px] bg-black rounded-t-md flex items-center justify-center">
          <span className="text-white text-sm font-medium">image</span>
        </div>
        
        {/* Main Content Area */}
        <div className="w-full flex-1 bg-[#E0E0E0] rounded-b-md flex items-center justify-center relative">
          {isProcessing ? (
            /* Processing Indicator */
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
            </div>
          ) : uploadedImage ? (
            <img
              src={uploadedImage.src}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-b-md"
            />
          ) : (
            /* Plus Sign */
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="black" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}

export default ImagePlaceholder
