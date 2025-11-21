import React, { useState, useEffect } from 'react';
import { UsersRound, UserRound, Search, Phone, Trash2, X, Hand, RefreshCcw, Shield } from 'lucide-react';

interface Member {
  name: string;
  call: boolean;
  remove: boolean;
  givePermission: boolean;
}

export const MembersScreen = () => {
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
      // Add your call logic here
    };

    const handleRemove = (memberName: string) => {
      console.log(`Removing ${memberName}`);
      // Add your remove logic here
    };

    const handlePermission = (memberName: string) => {
      console.log(`Managing permissions for ${memberName}`);
      // Add your permission logic here
    };

    return (
    <div className="min-h-screen w-full bg-[#202532] bg-fixed bg-cover bg-center p-8">
    <div className="flex flex-row justify-between items-center mb-4">
      <div className="flex flex-row gap-2 items-center">
        <UsersRound className="text-white"/>
        <h1 className="text-xl font-semibold text-white">Room Members ({count})</h1>
      </div>
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50" size={20} />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-1 rounded-lg border border-white/40 bg-white text-black placeholder-black/50 focus:outline-none focus:border-white/60"
        />
      </div>
    </div>
  
    <div className="bg-[#e6eaef] shadow-md overflow-hidden border border-[#b3b8be]">
      <table className="w-full border-collapse">
        <tbody className="divide-y ">
          {members.map((item) => (
            <tr key={item.name} className="hover:bg-gray-50">
              {/* Member name with icon */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <UserRound className="text-black" size={20} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"> 
                  <span className="font-medium">{item.name}</span>
              </td>
              
              {/* Call button */}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <button 
                  onClick={() => handleCall(item.name)}
                  className="flex items-center gap-2 bg-[#f6f7f9] hover:bg-blue-600 text-black px-3 py-2 rounded-lg transition-colors"
                >
                  <Hand size={16} />
                  Call
                </button>
              </td>
              
              {/* Remove button */}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <button 
                  onClick={() => handleRemove(item.name)}
                  className="flex items-center gap-2 bg-[#f6f7f9] hover:bg-red-600 text-black px-3 py-2 rounded-lg transition-colors"
                >
                  <X size={16} />
                  Remove
                </button>
              </td>
              
              {/* Permission button */}
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                <button 
                  onClick={() => handlePermission(item.name)}
                  className="flex items-center gap-2 bg-[#f6f7f9] hover:bg-green-600 text-black px-3 py-2 rounded-lg transition-colors"
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
    );
};