import { File, Search } from 'lucide-react';

interface File {
  name: string;
  ext: string;
  size: string;
  updatedBy: string;
  updatedAt: string;
}

export const StartScreen = () => {
    const data = [
      { name: "ProjectPlan_V2.docx", ext: "docx", size: "1.2 MB", updatedBy: "Sarah", updatedAt: "2025-10-30 14:23 HKT" },
      { name: "ClientBrief_Q4.pdf", ext: "pdf", size: "850 KB", updatedBy: "Sarah", updatedAt: "2025-10-30 14:23 HKT" },
      { name: "ProductMockup_final.psd", ext: "psd", size: "45.6 MB", updatedBy: "Sarah", updatedAt: "2025-10-30 14:23 HKT" },
      { name: "SalesReport_Oct.xlsx", ext: "xlsx", size: "3.1 MB", updatedBy: "Sarah", updatedAt: "2025-10-30 14:23 HKT" },
      { name: "TEAMMEETINGNOTES.TXT", ext: "TXT", size: "15 KB", updatedBy: "Sarah", updatedAt: "2025-10-30 14:23 HKT" }
    ];
    
    
    return (
    <div className="min-h-screen w-full bg-[#202532] bg-fixed bg-cover bg-center p-8">
    <div className="flex flex-row justify-between items-center mb-4">
      <div className="flex flex-row gap-2 items-center">
        <File className="text-white"/>
        <h1 className="text-xl font-semibold text-white">File History</h1>
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
  
    {/* Added border around the entire table container */}
    <div className="bg-[#e6eaef] shadow-md overflow-hidden border border-[#b3b8be]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#202532] border-b border-[#b3b8be]">
            <th className="px-1 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider border-r border-[#b3b8be]">
              
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider border-r border-[#b3b8be]">
              File Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider border-r border-[#b3b8be]">
              File Extension
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider border-r border-[#b3b8be]">
              Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider border-r border-[#b3b8be]">
              Updated By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#b3b8be] uppercase tracking-wider">
              Updated At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#b3b8be]">
          {data.map((item) => (
            <tr key={item.name} className="hover:bg-gray-50">
              <td className="p-2 border-r border-[#b3b8be] text-center">
                <input type="checkbox" className="ml-2 text-[#b3b8be]" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-[#b3b8be]">
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-[#b3b8be]">
                {item.ext}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-[#b3b8be]">
                {item.size}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-[#b3b8be]">
                {item.updatedBy}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.updatedAt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
    );
};