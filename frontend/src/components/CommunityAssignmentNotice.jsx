import { ShieldAlert } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const CommunityAssignmentNotice = () => {
  const { ct } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF8F3] px-4 py-12">
      <div className="max-w-xl w-full bg-white border border-dashed border-orange-300 rounded-2xl p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {ct('คุณยังไม่ได้รับมอบหมายให้ดูแลชุมชน', 'You have not been assigned to a community yet.')}
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          {ct(
            'โปรดติดต่อแพลตฟอร์มแอดมินเพื่อให้กำหนดสิทธิ์การดูแลชุมชน จากนั้นกลับมาที่หน้านี้อีกครั้งเพื่อจัดการข้อมูลได้ตามปกติ',
            'Please contact the platform admin so they can assign a community to you. Once assigned, revisit this section to manage the community data as usual.'
          )}
        </p>
        <div className="text-sm text-gray-500 bg-orange-50 rounded-xl px-4 py-3 inline-block">
          {ct('หากต้องการความช่วยเหลือเพิ่มเติม กรุณาส่งอีเมลหา Platform Admin', 'For additional assistance, please reach out to the Platform Admin.')}
        </div>
      </div>
    </div>
  );
};

export default CommunityAssignmentNotice;
