import React, { useState } from 'react';
import { WindowWrapper } from "@/components/global/window-wrapper";
import { CircleQuestionMark, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Question = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  return (
    <WindowWrapper title="FileBert - Question">
      <div className="w-full h-full flex flex-col bg-[#202532]">
        {/* Header - removed top padding since WindowWrapper has its own header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <div className="flex flex-row gap-2 items-center">
            <CircleQuestionMark className="text-white"/>
            <h1 className="text-xl font-semibold text-white">Question</h1>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6">
          {/* Question Section */}
          <div className="bg-[#e6eaef] rounded-lg p-4 mb-6">
            <p className='text-sm text-gray-600'>Question - 1</p>
            <h3 className='text-lg font-medium text-gray-900'>Are you a good listener?</h3>
          </div>
          
          {/* Answer Cards */}
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            {/* Left Card - NO */}
            <div className="flex-1 bg-[#FF8D8F] rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
              <div className="flex flex-col md:flex-row items-center justify-between h-full p-6">
                <ChevronsLeft size={64} className="text-white/80 mb-4 md:mb-0"/>
                <div className="text-center md:text-left md:ml-4">
                  <p className="text-sm text-white/90">Swipe Left to Answer</p>
                  <h3 className="text-4xl font-bold text-white">NO</h3>
                </div>
              </div>
            </div>
            
            {/* Right Card - YES */}
            <div className="flex-1 bg-[#8DC0FF] rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
              <div className="flex flex-col md:flex-row items-center justify-between h-full p-6">
                <div className="text-center md:text-right md:mr-4 order-2 md:order-1">
                  <p className="text-sm text-white/90">Swipe Right to Answer</p>
                  <h3 className="text-4xl font-bold text-white">YES</h3>
                </div>
                <ChevronsRight size={64} className="text-white/80 mb-4 md:mb-0 order-1 md:order-2"/>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>
    </WindowWrapper>
  );
};