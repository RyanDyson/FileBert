import React, { useState, useEffect } from 'react';
import { WindowWrapper } from "@/components/global/window-wrapper";
import { UsersRound, UserRound, Search, X, Hand, RefreshCcw } from 'lucide-react';

interface Member {
  name: string;
  call: boolean;
  remove: boolean;
  givePermission: boolean;
}

export const Members = () => {
  const [count, setCount] = useState<number>(0);
  const members = [
    { name: "Sarah", call: false, remove: false, givePermission: false }, 
    { name: "Mike", call: false, remove: false, givePermission: false }
  ];

  useEffect(() => {
    setCount(members.length);
  }, [members]);

  const handleCall = (memberName: string) => {
    console.log(`Calling ${memberName}`);
  };

  const handleRemove = (memberName: string) => {
    console.log(`Removing ${memberName}`);
  };

  const handlePermission = (memberName: string) => {
    console.log(`Managing permissions for ${memberName}`);
  };

  return (
    <WindowWrapper title="FileBert - Members">
      <div className="w-full h-full flex flex-col p-6 bg-[#202532]">
        <div className="flex flex-row justify-between items-center mb-6">
          <div className="flex flex-row gap-2 items-center">
            <UsersRound className="text-white"/>
            <h1 className="text-xl font-semibold text-white">Room Members ({count})</h1>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50" size={20} />
            <input
              type="text"
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-1 rounded-lg border border-white/40 bg-white text-black placeholder-black/50 focus:outline-none focus:border-white/60"
            />
          </div>
        </div>
      
        <div className="flex-1 bg-[#e6eaef] shadow-md overflow-hidden border border-[#b3b8be] rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#202532] border-b border-[#b3b8be]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider">
                  
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider">
                  Member Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider">
                  
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider">
                  
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#b3b8be]">
              {members.map((item) => (
                <tr key={item.name} className="hover:bg-gray-50">
                  {/* Member icon */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <UserRound className="text-black" size={20} />
                  </td>
                  
                  {/* Member name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"> 
                    <span className="font-medium">{item.name}</span>
                  </td>
                  
                  {/* Call button */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handleCall(item.name)}
                      className="flex items-center gap-2 bg-[#f6f7f9] text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Hand size={16} />
                      Call
                    </button>
                  </td>
                  
                  {/* Remove button */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handleRemove(item.name)}
                      className="flex items-center gap-2 bg-[#f6f7f9] text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  </td>
                  
                  {/* Permission button */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handlePermission(item.name)}
                      className="flex items-center gap-2 bg-[#f6f7f9] text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      <RefreshCcw size={16} />
                      Give Upload Privileges
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WindowWrapper>
  );
};