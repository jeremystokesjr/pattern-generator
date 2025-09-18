import React from 'react'
import ConsoleFrame from './ConsoleFrame'
import UploadSlot from './UploadSlot'

function App() {
  return (
    <div className="min-h-screen bg-[#222222] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        
        
        {/* Main Layout - Centered Console */}
        <div className="flex justify-center items-start">
          <ConsoleFrame />
        </div>
        
        {/* Footer */}
        
      </div>
    </div>
  )
}

export default App
