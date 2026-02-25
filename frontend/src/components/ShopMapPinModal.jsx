import { useEffect, useState, useMemo, useRef } from 'react';
import { X, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { fetchCommunityMap } from '../services/mapPinService';
import { resolveImageUrl } from '../utils/image';

const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return `${value.toFixed(1)}%`;
};

const ShopMapPinModal = ({
  isOpen,
  onClose,
  communityId,
  initialPosition,
  onConfirm,
  title,
}) => {
  const { ct } = useTranslation();
  const [loadingMap, setLoadingMap] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mapData, setMapData] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(initialPosition ?? null);
  const containerRef = useRef(null);

  const resolvedTitle = title || ct('เลือกตำแหน่งร้านบนแผนที่', 'Select shop position on map');

  useEffect(() => {
    if (isOpen) {
      setSelectedPosition(initialPosition ?? null);
      setError('');
    }
  }, [isOpen, initialPosition]);

  useEffect(() => {
    if (!isOpen || !communityId) return;
    let ignore = false;
    setLoadingMap(true);
    setError('');

    fetchCommunityMap(communityId)
      .then((data) => {
        if (!ignore) {
          setMapData(data);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load community map', err);
          setMapData(null);
          setError(ct('ไม่สามารถโหลดแผนที่ของชุมชนนี้ได้', 'Unable to load community map.'));
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoadingMap(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, communityId, ct]);

  const handleMapClick = (event) => {
    if (!mapData?.map_image) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const xPercent = ((event.clientX - bounds.left) / bounds.width) * 100;
    const yPercent = ((event.clientY - bounds.top) / bounds.height) * 100;

    const clamp = (value) => Math.max(0, Math.min(100, value));

    setSelectedPosition({
      x: parseFloat(clamp(xPercent).toFixed(2)),
      y: parseFloat(clamp(yPercent).toFixed(2)),
    });
  };

  const handleConfirm = async () => {
    if (!selectedPosition) {
      setError(ct('กรุณาเลือกตำแหน่งบนแผนที่ก่อนบันทึก', 'Please select a position on the map before saving.'));
      return;
    }

    if (!onConfirm) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      await onConfirm(selectedPosition);
      onClose();
    } catch (err) {
      console.error('Failed to save shop pin', err);
      const message = err?.response?.data?.message || err.message;
      setError(Array.isArray(message) ? message.join(', ') : message || ct('เกิดข้อผิดพลาดในการบันทึกตำแหน่ง', 'Failed to save position.'));
    } finally {
      setSaving(false);
    }
  };

  const renderPins = useMemo(() => {
    if (!mapData?.pins?.length) return null;
    return mapData.pins.map((pin) => (
      <div
        key={pin.id}
        className="absolute w-3.5 h-3.5 rounded-full border-2 border-white"
        style={{
          top: `${pin.y}%`,
          left: `${pin.x}%`,
          transform: 'translate(-50%, -100%)',
          backgroundColor: '#9ca3af',
        }}
      />
    ));
  }, [mapData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm uppercase tracking-wide text-orange-500 font-semibold mb-1">
              {ct('ตำแหน่งร้านบนแผนที่', 'Shop Map Position')}
            </p>
            <h3 className="text-xl font-bold text-gray-900">{resolvedTitle}</h3>
          </div>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            aria-label={ct('ปิดหน้าต่าง', 'Close modal')}
            onClick={() => {
              if (!saving) {
                onClose();
              }
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50">
            <div
              className="relative w-full h-[420px]"
              ref={containerRef}
            >
              {loadingMap ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>{ct('กำลังโหลดแผนที่...', 'Loading community map...')}</p>
                </div>
              ) : mapData?.map_image ? (
                <div
                  className="w-full h-full bg-cover bg-center cursor-crosshair"
                  //style={{ backgroundImage: `url(${mapData.map_image})` }}
                  style={{ backgroundImage: `url(${resolveImageUrl(mapData.map_image)})`, }}
                  
                  onClick={handleMapClick}
                >
                  {renderPins}
                  {selectedPosition && (
                    <div
                      className="absolute flex items-center justify-center"
                      style={{
                        top: `${selectedPosition.y}%`,
                        left: `${selectedPosition.x}%`,
                        transform: 'translate(-50%, -100%)',
                      }}
                    >
                      <MapPin className="h-8 w-8 text-orange-500 drop-shadow-md" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                  <MapPin className="h-10 w-10 text-gray-400 mb-3" />
                  <p>{ct('ยังไม่มีแผนที่สำหรับชุมชนนี้', 'No map has been uploaded for this community yet.')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">{ct('ตำแหน่งที่เลือก', 'Selected position')}</p>
              {selectedPosition ? (
                <p className="text-sm font-medium text-gray-900">
                  X: {formatPercent(selectedPosition.x)} • Y: {formatPercent(selectedPosition.y)}
                </p>
              ) : (
                <p className="text-sm text-gray-500">{ct('ยังไม่ได้เลือกตำแหน่ง', 'No position selected')}</p>
              )}
            </div>
            <p className="text-xs text-gray-400">{ct('คลิกบนแผนที่เพื่อย้ายหมุด', 'Click anywhere on the map to place the pin')}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              onClick={() => {
                if (!saving) {
                  onClose();
                }
              }}
            >
              {ct('ยกเลิก', 'Cancel')}
            </button>
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-orange-500 text-white font-semibold shadow-sm hover:bg-orange-600 disabled:opacity-50"
              onClick={handleConfirm}
              disabled={saving || loadingMap || !communityId}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{ct('บันทึกตำแหน่ง', 'Save position')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopMapPinModal;
