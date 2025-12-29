import { useState } from 'react';
import { MapPin, Navigation, Plus, Minus } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const Map = () => {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [zoom, setZoom] = useState(1);
  
  //สถานที่ต่างๆที่ปรากฎบนแผนที่
  const locations = [
    {
      id: 1,
      name: 'ร้านเซรามิก',
      category: 'ร้านค้า',
      distance: '2.5 กม.',
      description: 'ร้านเซรามิกทำมือ ผลิตภัณฑ์เครื่องปั้นดินเผาคุณภาพสูงจากชุมชน',
      position: { top: '30%', left: '35%' }
    },
    {
      id: 2,
      name: 'เรือนไม้',
      category: 'ร้านค้า',
      distance: '1.8 กม.',
      description: 'ร้านจำหน่ายผลิตภัณฑ์ไม้แกะสลักและของตกแต่งบ้าน',
      position: { top: '50%', left: '55%' }
    },
    {
      id: 3,
      name: 'ศูนย์เกษตรอินทรีย์',
      category: 'สถานที่',
      distance: '3.2 กม.',
      description: 'ศูนย์เรียนรู้และจำหน่ายผลผลิตเกษตรอินทรีย์',
      position: { top: '65%', left: '40%' }
    }
  ];

  const handleZoomIn = () => {
    if (zoom < 2) setZoom(zoom + 0.2);
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) setZoom(zoom - 0.2);
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        <div className="flex-1 relative bg-[#E8DCC8] overflow-hidden animate-slideUp">
          <div 
            className="w-full h-full relative"
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-200 to-transparent"></div>
            
            {locations.map((location) => (
              <button
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ top: location.position.top, left: location.position.left }}
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
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: '#111827' }}>
                    {location.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* ปุ่มซูม */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="bg-white hover:bg-gray-100 p-2 rounded-lg shadow-md transition-colors"
            >
              <Plus className="h-5 w-5" style={{ color: '#374151' }} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg shadow-md transition-colors"
              style={{ backgroundColor: '#ffffff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <Minus className="h-5 w-5" style={{ color: '#374151' }} />
            </button>
          </div>
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
              {locations.map((location) => (
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
                      <h3 className="font-semibold" style={{ color: '#111827' }}>{location.name}</h3>
                      <span className="text-xs" style={{ color: '#6b7280' }}>{location.category}</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#ea580c' }}>{location.distance}</span>
                  </div>
                  
                  <p className="text-sm mb-3" style={{ color: '#4b5563' }}>
                    {location.description}
                  </p>

                  <button className="flex items-center space-x-2 font-medium text-sm transition-all transform hover:scale-105" style={{ color: '#ea580c' }} onMouseEnter={(e) => e.currentTarget.style.color = '#c2410c'} onMouseLeave={(e) => e.currentTarget.style.color = '#ea580c'}>
                    <Navigation className="h-4 w-4" />
                    <span>{t('map.viewRoute')}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
