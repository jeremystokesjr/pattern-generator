import React from 'react'
import Switchboard from './Switchboard'

const ConsoleFrame = () => {
  return (
    <div className="relative bg-[#F1F1F1] rounded-xl shadow-lg p-6 w-[626px] h-[800px] flex-shrink-0 border-b-[10px] border-b-[#676767]">
      {/* Canvas Area - Centered */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#232323] rounded-md h-[417px] w-[590px] flex-shrink-0 relative">
          {/* Screen - Left justified in canvas area */}
          <div className="absolute top-2 left-2 bg-black rounded-md h-[403px] w-[535px]">
            {/* Placeholder for future pattern rendering */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-500 text-lg">
                Pattern Display
              </div>
            </div>
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
            <div className="w-8 h-9 flex items-center justify-center cursor-pointer">
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
        <Switchboard />
      </div>
    </div>
  )
}

export default ConsoleFrame
