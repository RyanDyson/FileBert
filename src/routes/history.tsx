import { WindowWrapper } from "@/components/global/window-wrapper";
import { File, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FileObject{
	originalFileName: string;
	username: string;
	lastModified: string;
}

export const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [fileHistory, setFileHistory] = useState<FileObject[]>([]);
  

  useEffect(() => {
    const fetchOverlayData = async () => {
      try {
        const overlayData = await window.electronAPI.getOverlayData();
        setRoomCode((prev) => {
          console.log("Previous roomCode:", prev, "New roomCode:", overlayData.roomId);
          return overlayData.roomId;
        });
      } catch (error) {
        console.error("Failed to fetch overlay data:", error);
      }
    };

    fetchOverlayData();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`https://filebertbackend.netlify.app/api/history?roomId=${encodeURIComponent(roomCode)}`);
        const responseData = await response.json();
        const history: FileObject[] = responseData.history;

        if (history) {
          setFileHistory(history); // Automatically update the state with the fetched data
          console.log("Successfully fetched file history:", history);
        } else {
          console.error("Failed to fetch file history.");
        }
      } catch (error) {
        console.error("Error fetching file history:", error);
      }
    };

    if (roomCode) {
      fetchHistory();
    }
  }, [roomCode]);

  // Filter fileHistory based on search term
  const filteredData = fileHistory.filter(item => 
    item.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lastModified.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <WindowWrapper title="FileBert - History">
      <div className="w-full h-full flex flex-col p-6 bg-[#202532]">
        {/* Header Section */}
        <div className="flex flex-row justify-between items-center mb-6">
          <div className="flex flex-row gap-2 items-center">
            <File className="text-white"/>
            <h1 className="text-xl font-semibold text-white">File History</h1>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50" size={20} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-1 rounded-lg border border-white/40 bg-white text-black placeholder-black/50 focus:outline-none focus:border-white/60"
            />
          </div>
        </div>
        
        {/* Table Container */}
        <div className="flex-1 bg-[#e6eaef] shadow-md overflow-hidden border border-[#b3b8be] rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#202532] border-b border-[#b3b8be]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider border-r border-[#b3b8be]">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider border-r border-[#b3b8be]">
                  Extension
                </th>
                <th className="px-6- py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider border-r border-[#b3b8be]">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider border-r border-[#b3b8be]">
                  Last Modified
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#b3b8be]">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.originalFileName} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-[#b3b8be]">
                      {item.originalFileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-[#b3b8be]">
                      {item.originalFileName.split(".")[1]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-[#b3b8be]">
                      {item.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.lastModified}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No files found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </WindowWrapper>
  );
};