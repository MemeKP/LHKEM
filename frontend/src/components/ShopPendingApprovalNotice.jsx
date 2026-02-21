import { ShieldAlert, ArrowLeft } from 'lucide-react';

const buttonVariants = {
  primary: 'bg-[#E07B39] text-white hover:bg-[#D66B29] shadow-md hover:shadow-lg',
  secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
};

const ShopPendingApprovalNotice = ({
  title = 'ร้านค้าของคุณยังรอการอนุมัติ',
  description = 'กรุณารอการตรวจสอบจากทีมแพลตฟอร์มหรืออัปเดตข้อมูลร้านค้าเพิ่มเติม',
  actions = [],
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#F5EFE7] py-12 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-lg border border-amber-100 p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{description}</p>
          {children && <div className="text-left text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">{children}</div>}
          {actions.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              {actions.map(({ label, onClick, variant = 'primary', icon: Icon = ArrowLeft }, index) => (
                <button
                  key={`${label}-${index}`}
                  onClick={onClick}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${buttonVariants[variant]}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPendingApprovalNotice;
