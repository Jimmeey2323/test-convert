import React, { useMemo, useState } from 'react';
import { SalesData, FilterOptions, YearOnYearMetricType, EnhancedYearOnYearTableProps } from '@/types/dashboard';
import { YearOnYearMetricTabs } from './YearOnYearMetricTabs';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { ChevronDown, ChevronRight, RefreshCw, Filter, Calendar, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const groupDataByCategory = (data: SalesData[]) => {
  return data.reduce((acc: Record<string, any>, item) => {
    const category = item.cleanedCategory || 'Uncategorized';
    const product = item.cleanedProduct || 'Unspecified';
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][product]) {
      acc[category][product] = [];
    }
    acc[category][product].push(item);
    return acc;
  }, {});
};
export const EnhancedYearOnYearTable: React.FC<EnhancedYearOnYearTableProps> = ({
  data,
  filters = {
    dateRange: {
      start: '',
      end: ''
    },
    location: [],
    category: [],
    product: [],
    soldBy: [],
    paymentMethod: []
  },
  onRowClick,
  collapsedGroups = new Set(),
  onGroupToggle = () => {},
  selectedMetric: initialMetric = 'revenue'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<YearOnYearMetricType>(initialMetric);
  const [showFilters, setShowFilters] = useState(false);
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    // Handle DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [, day, month, year] = ddmmyyyy;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Try other formats
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };
  const getMetricValue = (items: SalesData[], metric: YearOnYearMetricType) => {
    if (!items.length) return 0;
    switch (metric) {
      case 'revenue':
        return items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
      case 'transactions':
        return items.length;
      case 'members':
        return new Set(items.map(item => item.memberId)).size;
      case 'atv':
        const totalRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        return items.length > 0 ? totalRevenue / items.length : 0;
      case 'auv':
        const revenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const uniqueMembers = new Set(items.map(item => item.memberId)).size;
        return uniqueMembers > 0 ? revenue / uniqueMembers : 0;
      case 'asv':
        const sessionRevenue = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const sessions = new Set(items.map(item => item.saleItemId)).size;
        return sessions > 0 ? sessionRevenue / sessions : 0;
      case 'upt':
        const totalItems = items.length;
        const totalTransactions = new Set(items.map(item => item.paymentTransactionId)).size;
        return totalTransactions > 0 ? totalItems / totalTransactions : 0;
      case 'vat':
        return items.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
      case 'netRevenue':
        const gross = items.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
        const vat = items.reduce((sum, item) => sum + (item.paymentVAT || 0), 0);
        return gross - vat;
      default:
        return 0;
    }
  };
  const formatMetricValue = (value: number, metric: YearOnYearMetricType) => {
    switch (metric) {
      case 'revenue':
      case 'auv':
      case 'asv':
      case 'atv':
      case 'vat':
      case 'netRevenue':
        return formatCurrency(value);
      case 'transactions':
      case 'members':
        return formatNumber(value);
      case 'upt':
        return value.toFixed(2);
      default:
        return formatNumber(value);
    }
  };

  // Get all data for historic comparison (include 2024 data regardless of filters)
  const allHistoricData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(item => {
      // Apply only non-date filters for YoY comparison
      if (filters?.location?.length > 0 && !filters.location.includes(item.calculatedLocation)) return false;
      if (filters?.category?.length > 0 && !filters.category.includes(item.cleanedCategory)) return false;
      if (filters?.product?.length > 0 && !filters.product.includes(item.cleanedProduct)) return false;
      if (filters?.soldBy?.length > 0 && !filters.soldBy.includes(item.soldBy)) return false;
      if (filters?.paymentMethod?.length > 0 && !filters.paymentMethod.includes(item.paymentMethod)) return false;
      if (filters?.minAmount !== undefined && item.paymentValue < filters.minAmount) return false;
      if (filters?.maxAmount !== undefined && item.paymentValue > filters.maxAmount) return false;
      return true;
    });
  }, [data, filters]);

  // Generate monthly data with 2024/2025 grouping in descending order
  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Create alternating pattern: Jun-2024, Jun-2025, May-2024, May-2025, etc.
    for (let i = 5; i >= 0; i--) {
      // Jun to Jan (descending)
      const monthName = monthNames[i];
      const monthNum = i + 1;

      // Add 2024 first, then 2025
      months.push({
        key: `2024-${String(monthNum).padStart(2, '0')}`,
        display: `${monthName} 2024`,
        year: 2024,
        month: monthNum,
        sortOrder: (5 - i) * 2
      });
      months.push({
        key: `2025-${String(monthNum).padStart(2, '0')}`,
        display: `${monthName} 2025`,
        year: 2025,
        month: monthNum,
        sortOrder: (5 - i) * 2 + 1
      });
    }
    return months;
  }, []);
  const processedData = useMemo(() => {
    const grouped = groupDataByCategory(allHistoricData);
    return Object.entries(grouped).map(([category, products]) => {
      const categoryData = {
        category,
        products: Object.entries(products).map(([product, items]) => {
          const monthlyValues: Record<string, number> = {};

          // Calculate values for each month
          monthlyData.forEach(({
            key,
            year,
            month
          }) => {
            const monthItems = (items as SalesData[]).filter(item => {
              const itemDate = parseDate(item.paymentDate);
              return itemDate && itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
            });
            monthlyValues[key] = getMetricValue(monthItems, selectedMetric);
          });

          // Calculate averages for collapsed view
          const values = Object.values(monthlyValues).filter(v => v > 0);
          const averages = {
            atv: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
            auv: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
            asv: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
            upt: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
          };
          return {
            product,
            monthlyValues,
            rawData: items,
            averages
          };
        })
      };

      // Calculate category totals for each month
      const categoryMonthlyValues: Record<string, number> = {};
      monthlyData.forEach(({
        key
      }) => {
        categoryMonthlyValues[key] = categoryData.products.reduce((sum, p) => sum + (p.monthlyValues[key] || 0), 0);
      });
      return {
        ...categoryData,
        monthlyValues: categoryMonthlyValues
      };
    });
  }, [allHistoricData, selectedMetric, monthlyData]);
  const handleRefresh = () => {
    window.location.reload();
  };
  const handleExportData = () => {
    const csvContent = processedData.map(categoryGroup => {
      const categoryRow = [categoryGroup.category, ...monthlyData.map(({
        key
      }) => formatMetricValue(categoryGroup.monthlyValues[key] || 0, selectedMetric))].join(',');
      const productRows = categoryGroup.products.map(product => [`  ${product.product}`, ...monthlyData.map(({
        key
      }) => formatMetricValue(product.monthlyValues[key] || 0, selectedMetric))].join(','));
      return [categoryRow, ...productRows].join('\n');
    }).join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `year-on-year-${selectedMetric}-data.csv`;
    a.click();
  };
  const handleQuickFilter = (filterType: string) => {
    console.log(`Applied quick filter: ${filterType}`);
    // Quick filter implementations here
  };
  const quickFilters = [{
    label: 'Last 6 Months',
    action: () => handleQuickFilter('last6months'),
    variant: 'outline' as const
  }, {
    label: 'High Performers',
    action: () => handleQuickFilter('highvalue'),
    variant: 'outline' as const
  }, {
    label: 'Top Categories',
    action: () => handleQuickFilter('topcategories'),
    variant: 'outline' as const
  }, {
    label: 'Clear Filters',
    action: () => handleQuickFilter('clearall'),
    variant: 'destructive' as const
  }];
  return <Card className="bg-gradient-to-br from-white via-slate-50/30 to-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Year-on-Year Performance Analysis
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Monthly comparison between 2024 and 2025 with alternating year display
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData} className="flex items-center gap-2 hover:bg-green-50 hover:text-green-700">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-700">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter, index) => <Button key={index} variant={filter.variant} size="sm" onClick={filter.action} className="text-xs transition-all duration-200 hover:scale-105">
                {filter.label}
              </Button>)}
          </div>
          
          <YearOnYearMetricTabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border-t border-gray-200 rounded-lg">
            <thead className="bg-gradient-to-r from-purple-700 to-purple-900 text-white font-semibold text-sm uppercase tracking-wider px-4 py-2 sticky top-0 z-20">
              <tr className="bg-gradient-to-r from-purple-700 to-purple-900 text-white font-semibold text-sm uppercase tracking-wider px-4 py-2 rounded-md">
                <th className="text-white font-semibold uppercase tracking-wider px-12 py-2 text-left text-sm">
                  Product/Category
                </th>
                {monthlyData.map(({
                key,
                display,
                year
              }) => <th key={key} className="text-white font-semibold text-sm uppercase tracking-wider px-4 py-2">
                    <div className="flex flex-col">
                      <span className="text-base">{display.split(' ')[0]}</span>
                      <span className="text-yellow-200 text-xs">
                        {display.split(' ')[1]}
                      </span>
                    </div>
                  </th>)}
              </tr>
            </thead>
            <tbody>
              {processedData.map(categoryGroup => <React.Fragment key={categoryGroup.category}>
                  <tr onClick={() => onGroupToggle(categoryGroup.category)} className="bg-white hover:bg-gray-100 cursor-pointer border-b border-gray-200 group transition-colors duration-200 ease-in-out">
                    <td className="py-4 font-semibold text-gray-800 group-hover:text-gray-900 bg-white group-hover:bg-gray-100 sticky left-0 z-10 transition-colors duration-200 ease-in-out px-[10px] min-w-80 text-sm">
                      <div className="flex justify-between items-center min-w-full text-md text-bold">
                        {collapsedGroups.has(categoryGroup.category) ? <ChevronRight className="w-4 h-4 mr-2 text-gray-500 transition-transform duration-200" /> : <ChevronDown className="w-4 h-4 mr-2 text-gray-500 transition-transform duration-200" />}
                        {categoryGroup.category}
                        <Badge variant="secondary" className="ml-auto text-sm text-white bg-purple-900 min-w-32 text-right py-1 capitalize rounded-lg px-[12px]">
                          {categoryGroup.products.length} products
                        </Badge>
                      </div>
                    </td>
                    {monthlyData.map(({
                  key
                }) => <td key={key} className="px-4 py-4 text-center font-semibold text-gray-900 text-sm">
                        {formatMetricValue(categoryGroup.monthlyValues[key] || 0, selectedMetric)}
                      </td>)}
                  </tr>

                  {!collapsedGroups.has(categoryGroup.category) && categoryGroup.products.map(product => <tr key={`${categoryGroup.category}-${product.product}`} className="hover:bg-blue-50 cursor-pointer border-b border-gray-100 transition-colors duration-200" onClick={() => onRowClick && onRowClick(product.rawData)}>
                      <td className="px-8 py-3 text-sm text-gray-700 hover:text-blue-700 sticky left-0 bg-white hover:bg-blue-50 z-10 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                          <span>{product.product}</span>
                          {['atv', 'auv', 'asv', 'upt'].includes(selectedMetric) && <Badge variant="outline" className="text-xs ml-2 border-blue-200 text-blue-700">
                              Avg: {formatMetricValue(product.averages[selectedMetric as keyof typeof product.averages] || 0, selectedMetric)}
                            </Badge>}
                        </div>
                      </td>
                      {monthlyData.map(({
                  key
                }) => <td key={key} className="px-4 py-3 text-center text-sm text-gray-900 font-mono">
                          {formatMetricValue(product.monthlyValues[key] || 0, selectedMetric)}
                        </td>)}
                    </tr>)}
                </React.Fragment>)}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>;
};