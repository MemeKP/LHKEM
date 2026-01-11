const LineIcon = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21 11.5C21 7.08 16.97 3.5 12 3.5C7.03 3.5 3 7.08 3 11.5C3 15.5 6.2 18.8 10.5 19.4c.4.08.95.27 1.1.62c.12.28.08.72.04 1.1c-.04.38-.2 1.5-.24 1.76c-.05.3.2.14 1.15-.48c.95-.62 5.12-3.04 7-5.22c1.6-1.85 1.45-3.6 1.45-5.68z" />
    </svg>
  );
};

export default LineIcon;