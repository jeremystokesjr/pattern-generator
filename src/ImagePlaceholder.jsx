import React, { useState } from 'react'

const ImagePlaceholder = ({ uploadedImage }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', 'cartridge')
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
    console.log('Cartridge drag started - isDragging:', true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    console.log('Cartridge drag ended - isDragging:', false)
  }

  return (
    <div 
      className={`w-[111px] h-[149px] inline-flex justify-center items-center gap-0.5 relative cursor-move transition-opacity duration-100 ${isDragging ? 'opacity-0' : 'opacity-100'}`}
      style={{
        borderRadius: '6px',
        borderBottom: '4px solid #BA452C',
        background: 'linear-gradient(180deg, #F85C3B 0%, #C9492D 100%)',
        padding: '9px 8px 9px 5px'
      }}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Inner Container */}
      <div className="w-full h-[120px] bg-white border border-[#333333] rounded-md relative self-start flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="w-full h-[19px] bg-black rounded-t-md flex items-center justify-center">
          <span className="text-white text-sm font-medium">image</span>
        </div>
        
        {/* Main Content Area */}
        <div className="w-full flex-1 bg-[#E0E0E0] rounded-b-md flex items-center justify-center relative">
          {uploadedImage && (
            <img
              src={uploadedImage.src}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-b-md"
            />
          )}
        </div>
        
      </div>
    </div>
  )
}

export default ImagePlaceholder
