import React from 'react'
import ConsoleFrame from './ConsoleFrame'
import UploadSlot from './UploadSlot'
import UploadArea from './UploadArea'

function App() {
  return (
    <div className="min-h-screen bg-[#222222] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        
        
        {/* Main Layout - Console and Upload Area */}
        <div className="flex justify-center items-start gap-8">
          <ConsoleFrame />
          <UploadArea />
        </div>
        
        {/* Footer */}
        
      </div>
    </div>
  )
}

export default App
