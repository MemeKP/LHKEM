import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { resolveImageUrl } from '../utils/image';

const SLOT_LABELS = [
  'Gallery Image 1',
  'Gallery Image 2',
  'Gallery Image 3',
  'Gallery Image 4',
];

const createInitialSlots = (initialImages = []) => {
  return SLOT_LABELS.map((label, index) => {
    const existingUrl = initialImages[index] || null;
    return {
      index,
      label,
      existingUrl,
      preview: existingUrl ? resolveImageUrl(existingUrl) : null,
      file: null,
    };
  });
};

const CommunityImageUploader = ({ initialImages = [], onChange }) => {
  const [slots, setSlots] = useState(() => createInitialSlots(initialImages));

  useEffect(() => {
    setSlots(createInitialSlots(initialImages));
  }, [initialImages]);

  const latestPayloadRef = useRef(null);

  useEffect(() => {
    const payload = slots.map((slot) => ({
      file: slot.file || null,
      existingUrl: slot.existingUrl || null,
    }));

    const key = JSON.stringify(payload);
    if (latestPayloadRef.current !== key) {
      latestPayloadRef.current = key;
      onChange?.(payload);
    }
  }, [slots, onChange]);

  const handleFileChange = (index, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSlots((prev) =>
      prev.map((slot, idx) =>
        idx === index ? { ...slot, file, preview, existingUrl: null } : slot,
      ),
    );
  };

  const handleRemove = (index) => {
    setSlots((prev) =>
      prev.map((slot, idx) =>
        idx === index ? { ...slot, file: null, preview: null, existingUrl: null } : slot,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        เพิ่มรูปภาพบรรยากาศเพิ่มเติมของชุมชน (สูงสุด 4 รูป) เพื่อแสดงบนหน้า
        Community Home ส่วนแกลเลอรี โดยรูปปกยังคงตั้งค่าที่ส่วนอัปโหลดปกด้านบน
        แยกต่างหาก
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot, index) => (
          <div
            key={slot.index}
            className="border border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {SLOT_LABELS[index]}
                </p>
                <p className="text-xs text-gray-500">Gallery image</p>
              </div>
              {(slot.preview || slot.existingUrl) && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="relative h-48 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center">
              {slot.preview ? (
                <img src={slot.preview} alt={slot.label} className="w-full h-full object-cover" />
              ) : slot.existingUrl ? (
                <img
                  src={resolveImageUrl(slot.existingUrl)}
                  alt={slot.label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-400 space-y-2">
                  <ImageIcon className="h-10 w-10 mx-auto" />
                  <p className="text-xs">No image selected</p>
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white font-semibold">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(index, e.target.files[0])}
                />
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityImageUploader;
