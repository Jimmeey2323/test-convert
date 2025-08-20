
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Filter, Download } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ClientConversionDataTableProps {
  data: NewClientData[];
  onItemClick?: (item: any) => void;
}

export const ClientConversionDataTable: React.FC<ClientConversionDataTableProps> = ({
  data,
  onItemClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredData = data.filter(item =>
    item.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.firstVisitLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleRowClick = (item: NewClientData) => {
    onItemClick?.(item);
  };

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 text-xl">Client Conversion Details</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Client</th>
                <th className="text-left p-4 font-semibold text-gray-700">First Visit</th>
                <th className="text-left p-4 font-semibold text-gray-700">Location</th>
                <th className="text-left p-4 font-semibold text-gray-700">Trainer</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">LTV</th>
                <th className="text-left p-4 font-semibold text-gray-700">Visits</th>
                <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr 
                  key={item.memberId}
                  className="border-b hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(item)}
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.firstName} {item.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{item.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm text-gray-800">{item.firstVisitDate}</p>
                      <p className="text-xs text-gray-500">{item.firstVisitType}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-800">{item.firstVisitLocation || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Home: {item.homeLocation || 'N/A'}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-800">{item.trainerName || 'N/A'}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <Badge 
                        className={`text-xs px-2 py-1 ${
                          item.conversionStatus === 'Converted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {item.conversionStatus}
                      </Badge>
                      <Badge 
                        className={`text-xs px-2 py-1 ${
                          item.retentionStatus === 'Retained' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.retentionStatus}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{formatCurrency(item.ltv || 0)}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-800">{formatNumber(item.visitsPostTrial || 0)}</p>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(item);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
