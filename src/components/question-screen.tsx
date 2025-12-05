import React, { useState, useEffect } from "react";
import { CircleQuestionMark, ChevronsLeft, ChevronsRight } from "lucide-react";

export const QuestionScreen = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const handleCall = (memberName: string) => {
    console.log(`Calling ${memberName}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#202532] bg-fixed bg-cover bg-center">
      <div className="flex justify-between items-center px-8 py-2">
        <div className="flex flex-row gap-2 items-center">
          <CircleQuestionMark className="text-white" />
          <h1 className="text-xl font-semibold text-white">Question</h1>
        </div>
      </div>
      <div className="bg-[#e6eaef] w-full">
        <div className="mx-3 py-3">
          <p className="text-sm">Question - 1</p>
          <h3 className="text-lg font-medium">Are you a good listener?</h3>
        </div>
        <div className="flex flex-row">
          {/* Left Card - NO (Left Aligned) */}
          <div className="bg-[#FF8D8F] w-1/2 h-50 ml-2 mr-1 rounded-lg">
            <div className="flex flex-row items-center h-full p-4">
              <ChevronsLeft size={64} />
              <div className="text-left ml-4">
                <p className="text-sm">👎 to Answer</p>
                <h3 className="text-4xl font-semibold">NO</h3>
              </div>
            </div>
          </div>

          {/* Right Card - YES (Right Aligned) */}
          <div className="bg-[#8DC0FF] w-1/2 ml-1 mr-2 rounded-lg">
            <div className="flex flex-row items-center justify-end h-full p-4">
              <div className="text-right mr-4">
                <p className="text-sm">👍 to Answer</p>
                <h3 className="text-4xl font-semibold">YES</h3>
              </div>
              <ChevronsRight size={64} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
