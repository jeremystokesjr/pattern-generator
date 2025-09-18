import React from 'react'

const ImagePlaceholder = () => {
  return (
    <div 
      className="w-[111px] h-[149px] inline-flex justify-center items-center gap-0.5 relative"
      style={{
        borderRadius: '6px',
        borderBottom: '4px solid #BA452C',
        background: 'linear-gradient(180deg, #F85C3B 0%, #C9492D 100%)',
        padding: '9px 8px 9px 5px'
      }}
    >
      {/* Inner Container */}
      <div className="w-full h-[120px] bg-white border border-[#333333] rounded-md relative self-start flex flex-col">
        {/* Header Bar */}
        <div className="w-full h-[19px] bg-black rounded-t-md flex items-center justify-center">
          <span className="text-white text-sm font-medium">image</span>
        </div>
        
        {/* Main Content Area */}
        <div className="w-full flex-1 bg-[#E0E0E0] rounded-b-md flex items-center justify-center">
          {/* Plus Sign */}
          <div className="w-8 h-8 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="black" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        
        {/* Bottom Arrow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full" style={{marginTop: '2px'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="15" viewBox="0 0 24 15" fill="none">
            <g filter="url(#filter0_i_14_340)">
              <path d="M13.4339 13.5254C12.6486 14.333 11.3515 14.333 10.5661 13.5254L1.44412 4.14427C0.211345 2.87648 1.10965 0.749998 2.87799 0.749998L21.122 0.749999C22.8904 0.75 23.7887 2.87648 22.5559 4.14427L13.4339 13.5254Z" fill="#D74F32"/>
            </g>
            <path d="M13.0752 13.1768C12.4862 13.7824 11.5138 13.7824 10.9248 13.1768L1.80274 3.7959C0.878169 2.84507 1.55172 1.25005 2.87793 1.25L21.1221 1.25C22.4483 1.25005 23.1218 2.84507 22.1973 3.7959L13.0752 13.1768Z" stroke="#E65436"/>
            <defs>
              <filter id="filter0_i_14_340" x="-0.125977" y="0.75" width="23.252" height="14.3811" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dx="-6" dy="4"/>
                <feGaussianBlur stdDeviation="0.5"/>
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
                <feBlend mode="normal" in2="shape" result="effect1_innerShadow_14_340"/>
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default ImagePlaceholder
