
import React, { useState, useMemo, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Target, TrendingUp, MapPin, Building2, Eye, Database } from 'lucide-react';
import { useSessionsData, SessionData } from '@/hooks/useSessionsData';
import { SessionsAttendanceAnalytics } from './SessionsAttendanceAnalytics';
import { SessionsMetricCards } from './SessionsMetricCards';
import { SessionsGroupedTable } from './SessionsGroupedTable';
import { ClassFormatAnalysis } from './ClassFormatAnalysis';
import { ImprovedSessionsTopBottomLists } from './ImprovedSessionsTopBottomLists';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { designTokens } from '@/utils/designTokens';
import { formatNumber } from '@/utils/formatters';
import { SourceDataModal } from '@/components/ui/SourceDataModal';

const locations = [
  { id: 'all', name: 'All Locations', fullName: 'All Locations' },
  { id: 'kwality', name: 'Kwality House, Kemps Corner', fullName: 'Kwality House, Kemps Corner' },
  { id: 'supreme', name: 'Supreme HQ, Bandra', fullName: 'Supreme HQ, Bandra' },
  { id: 'kenkere', name: 'Kenkere House', fullName: 'Kenkere House' }
];

// Memoized location tab component
const LocationTab = memo(({ location, isActive }: { location: typeof locations[0]; isActive: boolean }) => (
  <div className="flex items-center gap-2">
    {location.id === 'all' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
    <div className="text-center">
      <div className="font-bold">{location.name}</div>
    </div>
  </div>
));

// Memoized metric display component
const MetricDisplay = memo(({ title, value, description }: { title: string; value: string; description: string }) => (
  <div className="text-center">
    <div className="text-4xl font-bold text-white mb-2">{value}</div>
    <div className="text-sm text-slate-300 font-medium">{description}</div>
  </div>
));

export const SessionsSection: React.FC = () => {
  const { data, loading, error, refetch } = useSessionsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [openSource, setOpenSource] = useState(false);

  // Memoized filtered data with performance optimization
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let filtered = data.filter(session => {
      const className = session.cleanedClass || '';
      const excludeKeywords = ['Hosted', 'P57', 'X'];
      
      const hasExcludedKeyword = excludeKeywords.some(keyword => 
        className.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return !hasExcludedKeyword && (session.checkedInCount >= 2);
    });

    if (activeLocation !== 'all') {
      const selectedLocation = locations.find(loc => loc.id === activeLocation);
      if (selectedLocation) {
        filtered = filtered.filter(session => {
          if (session.location === selectedLocation.fullName) return true;
          
          const sessionLoc = session.location?.toLowerCase() || '';
          const targetLoc = selectedLocation.fullName.toLowerCase();
          
          if (selectedLocation.id === 'kwality' && sessionLoc.includes('kwality')) return true;
          if (selectedLocation.id === 'supreme' && sessionLoc.includes('supreme')) return true;
          if (selectedLocation.id === 'kenkere' && sessionLoc.includes('kenkere')) return true;
          
          return false;
        });
      }
    }

    return filtered;
  }, [data, activeLocation]);

  // Memoized metrics calculation
  const headerMetrics = useMemo(() => {
    const totalSessions = filteredData.length;
    const totalAttendance = filteredData.reduce((sum, session) => sum + (session.checkedInCount || 0), 0);
    const avgFillRate = filteredData.length > 0 ? 
      Math.round(filteredData.reduce((sum, session) => sum + (session.fillPercentage || 0), 0) / filteredData.length) : 0;

    return {
      totalSessions: formatNumber(totalSessions),
      totalAttendance: totalAttendance.toLocaleString(),
      avgFillRate: `${avgFillRate}%`
    };
  }, [filteredData]);

  const handleLocationChange = useCallback((value: string) => {
    setActiveLocation(value);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <LoadingSkeleton type="full-page" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
        <Card className={`p-8 ${designTokens.card.background} ${designTokens.card.shadow} max-w-md`}>
          <CardContent className="text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-gray-800">Connection Error</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
            <Button onClick={refetch} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Optimized Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.3),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(255,255,255,0.1),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,_rgba(120,119,198,0.2),_transparent_50%)]" />
        </div>
        
        <div className="relative px-8 py-16">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <Target className="w-5 h-5 text-blue-300" />
              <span className="font-semibold text-white">Session Analytics</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              Sessions Dashboard
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Comprehensive analysis of class performance, attendance patterns, and operational insights across all studio locations
            </p>
            
            {/* Optimized Key Metrics Display */}
            <div className="flex items-center justify-center gap-12 mt-12">
              <MetricDisplay 
                title="Total Sessions"
                value={headerMetrics.totalSessions}
                description="Total Sessions"
              />
              <div className="w-px h-16 bg-white/20" />
              <MetricDisplay 
                title="Total Attendance"
                value={headerMetrics.totalAttendance}
                description="Total Attendance"
              />
              <div className="w-px h-16 bg-white/20" />
              <MetricDisplay 
                title="Average Fill Rate"
                value={headerMetrics.avgFillRate}
                description="Avg Fill Rate"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-slate-700">Data Source: Sessions Sheet</span>
            <Badge variant="outline" className="text-indigo-700 border-indigo-200">
              149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            onClick={() => setOpenSource(true)}
          >
            <Eye className="w-4 h-4" />
            View Source Data
          </Button>
        </div>
        {/* Optimized Location Tabs */}
        <Card className={`${designTokens.card.background} ${designTokens.card.shadow} ${designTokens.card.border} overflow-hidden`}>
          <CardContent className="p-2">
            <Tabs value={activeLocation} onValueChange={handleLocationChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-slate-100 to-slate-200 p-2 rounded-2xl h-auto gap-2">
                {locations.map((location) => (
                  <TabsTrigger
                    key={location.id}
                    value={location.id}
                    className="rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300"
                  >
                    <LocationTab location={location} isActive={activeLocation === location.id} />
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Optimized Tab Content */}
              {locations.map((location) => (
                <TabsContent key={location.id} value={location.id} className="space-y-8 mt-8">
                  <SessionsMetricCards data={filteredData} />
                  
                  {/* Top and Bottom Lists Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ImprovedSessionsTopBottomLists 
                      data={filteredData} 
                      title="Top Performing Classes"
                      type="classes"
                      variant="top"
                      initialCount={10}
                    />
                    <ImprovedSessionsTopBottomLists 
                      data={filteredData} 
                      title="Bottom Performing Classes"
                      type="classes"
                      variant="bottom"
                      initialCount={10}
                    />
                  </div>
                  
                  <SessionsAttendanceAnalytics data={filteredData} />
                  <ClassFormatAnalysis data={filteredData} />
                  <SessionsGroupedTable data={filteredData} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <SourceDataModal
        open={openSource}
        onOpenChange={setOpenSource}
        sources={[{
          name: 'Sessions',
          sheetName: 'Sessions',
          spreadsheetId: '149ILDqovzZA6FRUJKOwzutWdVqmqWBtWPfzG3A0zxTI',
          data: data || []
        }]}
      />
    </div>
  );
};
