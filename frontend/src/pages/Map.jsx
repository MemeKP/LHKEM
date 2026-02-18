import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Store, Map as MapIcon } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const Map = () => {
  const { t, ct } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [communityId, setCommunityId] = useState(null);

  // Fetch community ID from slug
  const { data: community } = useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      const res = await api.get(`/api/communities/${slug}`);
      return res.data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (community?._id) {
      setCommunityId(community._id);
    }
  }, [community]);

  // Fetch community map and pins
  const { data: mapData, isLoading: mapLoading } = useQuery({
    queryKey: ['communityMap', communityId],
    queryFn: async () => {
      const res = await api.get(`/api/communities/${communityId}/communitymap`);
      return res.data;
    },
    enabled: !!communityId,
  });

  const locations = useMemo(() => {
    return (mapData?.pins || []).filter((pin) => pin.status === 'ACTIVE');
  }, [mapData]);

  useEffect(() => {
    if (locations.length === 0) {
      setSelectedLocation(null);
      return;
    }

    if (!selectedLocation) {
      setSelectedLocation(locations[0]);
      return;
    }

    const stillExists = locations.find((pin) => pin.id === selectedLocation.id);
    if (!stillExists) {
      setSelectedLocation(locations[0]);
    }
  }, [locations, selectedLocation]);

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        <div className="flex-1 relative overflow-hidden animate-slideUp">
          {mapLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <div className="flex flex-col items-center text-gray-500">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                <p>{ct('กำลังโหลดแผนที่...', 'Loading community map...')}</p>
              </div>
            </div>
          ) : mapData?.map_image ? (
            <div 
              className="w-full h-full relative bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${mapData.map_image})`,
              }}
            >
              {locations.map((location) => (
                <button
                  key={location.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ top: `${location.positionY}%`, left: `${location.positionX}%` }}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="relative">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all"
                      style={{ 
                        backgroundColor: selectedLocation?.id === location.id ? '#ea580c' : '#f97316',
                        transform: selectedLocation?.id === location.id ? 'scale(1.1)' : 'scale(1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedLocation?.id === location.id ? '#ea580c' : '#f97316'}
                    >
                      <Store className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: '#111827' }}>
                      {location.ownerShop?.name || 'Shop'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="text-center p-8">
                <MapIcon className="h-24 w-24 text-orange-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  {ct('ยังไม่มีแผนที่สำหรับชุมชนนี้', 'No Map Available for This Community')}
                </h3>
                <p className="text-gray-500">
                  {ct('แผนที่จะพร้อมใช้งานเร็วๆ นี้', 'Map will be available soon')}
                </p>
              </div>
            </div>
          )}
          
        </div>

        <div className="lg:w-96 bg-white shadow-lg overflow-y-auto animate-slideUp">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>
              {t('map.title')}
            </h2>
            <p className="text-sm mb-6" style={{ color: '#4b5563' }}>
              {t('map.discover')} ({locations.length})
            </p>

            <div className="space-y-4 animate-stagger">
              {mapLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="p-4 rounded-lg border-2 border-gray-100 bg-gray-50 animate-pulse h-28" />
                  ))}
                </div>
              ) : locations.length > 0 ? (
                locations.map((location) => (
                  <div
                    key={location.id}
                    className="p-4 rounded-lg border-2 transition-all cursor-pointer"
                    style={{
                      borderColor: selectedLocation?.id === location.id ? '#f97316' : '#e5e7eb',
                      backgroundColor: selectedLocation?.id === location.id ? '#fff7ed' : '#ffffff'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLocation?.id !== location.id) {
                        e.currentTarget.style.borderColor = '#fdba74';
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLocation?.id !== location.id) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                    onClick={() => setSelectedLocation(location)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold" style={{ color: '#111827' }}>
                          {location.ownerShop?.name || ct('ร้านค้า', 'Shop')}
                        </h3>
                        <span className="text-xs" style={{ color: '#6b7280' }}>
                          {ct('ร้านค้า', 'Shop')}
                        </span>
                      </div>
                      {location.ownerShop?.status && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#ffedd5', color: '#c2410c' }}>
                          {location.ownerShop.status === 'ACTIVE' ? ct('แสดงบนแผนที่', 'Live') : location.ownerShop.status}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm mb-3" style={{ color: '#4b5563' }}>
                      {location.ownerShop?.description || ct('รายละเอียดร้านค้า', 'Shop details')}
                    </p>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (location.ownerShop?._id) {
                          navigate(`/${slug}/shops/${location.ownerShop._id}`);
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-[#E07B39] hover:bg-[#D66B29] text-white font-medium text-sm py-2.5 px-4 rounded-full transition-all transform hover:scale-105 shadow-sm hover:shadow-md disabled:opacity-50"
                      disabled={!location.ownerShop?._id}
                    >
                      <Store className="h-4 w-4" />
                      <span>{ct('เข้าชมร้านค้า', 'Visit Shop')}</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Store className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>{ct('ยังไม่มีร้านค้าบนแผนที่', 'No shops on the map yet')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
