import { useOutletContext, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useEffect, useRef } from 'react';
import { MapPin, Calendar, Heart, Leaf, Users, Palette, HomeIcon, List, BookXIcon, Box, BoxesIcon, Sparkle, SparklesIcon, Clock, Users as UsersIcon, Star, Store, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// เหลือต่อ map

const About = () => {
  const { t, ct } = useTranslation();
  const { community } = useOutletContext();
  const observerRef = useRef(null);
  const highlights = community.cultural_highlights || []
    const API_URL = import.meta.env.VITE_API_URL;


  const getIcon = (title) => {
    if (!title) return <Star className="h-4 w-4 text-yellow-300" />
    const text = title.toLowerCase()
    if (text.includes('สิ่งแวดล้อม') || text.includes('environment') || text.includes('eco')) {
      return <Leaf className="h-5 w-5 text-green-600" />
    }
    if (text.includes('วัฒนธรรม') || text.includes('culture')) {
      return <Heart className="h-5 w-5 text-rose-500" />
    }
    if (text.includes('ชุมชน') || text.includes('craft')) {
      return <Palette className="h-5 w-5 text-indigo-500" />
    }
    if (text.includes('หยุดพัก') || text.includes('slow life')) {
      return <SparklesIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Mock Slow Life values - จะถูกแทนที่ด้วย API data
  const slowLifeValues = [
    {
      emoji: '🎨',
      title: 'Arts & Crafts',
      title_th: 'Arts & Crafts',
      description: 'A place for artisans and craftsmen to share their skills and knowledge. Learn from local artisans who preserve ancient techniques.',
      description_th: 'แหล่งรวมศิลปินและช่างฝีมือ ทั้งงานผ้าย้อมคราม เซรามิก และงานไม้ ที่เปิดโอกาสให้คุณได้ลงมือทำด้วยตัวเอง (DIY)',
      borderColor: 'border-l-4 border-orange-500'
    },
    {
      emoji: '🌿',
      title: 'Green Living',
      title_th: 'Green Living',
      description: 'A community that practices zero waste and maintains the riverbank forest to ensure that nature coexists with the community in harmony.',
      description_th: 'ชุมชนต้นแบบด้านการจัดการขยะ (ZeroWaste) และการรักษาป่าต้นน้ำ เพื่อให้ธรรมชาติอยู่คู่กับชุมชนอย่างยั่งยืน',
      borderColor: 'border-l-4 border-green-500'
    },
    {
      emoji: '🏪',
      title: 'Kad Ton Yon',
      title_th: 'Kad Ton Yon',
      description: 'A community market where locals share their stories, foods and products. Peacefully under the cover of greens.',
      description_th: '"กาดต่อนยอน" ตลาดนัดสุดสัปดาห์ที่มีเอกลักษณ์ ขายอาหารพื้นเมืองและของทำมือ ในบรรยากาศสบายๆ ใต้ร่มไม้',
      borderColor: 'border-l-4 border-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdf7ef]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2d5a4d] via-[#3d6b5c] to-[#4d7c6b] text-white py-20 px-4 animate-fadeIn">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-green-200 mb-4 tracking-wide uppercase">
            {/* {ct('รู้จัก "โหล่งฮิมคาว"', 'About "Loeng Him Kaw"')} */}
            {ct(
              `รู้จัก "${community.name}" `,
              `About "${community.name_en}"`
            )}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {ct(
              `บรรยากาศ ณ ${community.name} `,
              `${community.name_en} Atmosphere`
            )}
            {/* {ct('Loeng Him Kaw Atmosphere', 'Loeng Him Kaw Atmosphere')} */}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            {/* {ct(
              'ชุมชนเล็กๆ ที่ซ่อนตัวอยู่อย่างเงียบสงบ ณ สันกำแพง เชียงใหม่',
              'A small peaceful community that was hidden in Chiang Mai'
            )} */}
            {ct(community.hero_section?.description, community.hero_section?.description_en)}
          </p>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
              <span className="inline-block bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4 uppercase tracking-wide">
                {ct('HISTORY & ORIGIN', 'HISTORY & ORIGIN')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {/* {ct('จากป่ารกร้าง สู่ชุมชนงานคราฟต์', 'From abandoned woods, to the community')} */}
                {ct(
                  community.hero_section?.title || `รู้จัก "${community.name}" `,
                  community.hero_section?.title_en || `About "${community.name_en}"`
                )}
              </h2>
              {/* <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="font-semibold text-gray-900">
                  {ct(
                    '"โหล่งฮิมคาว" เป็นภาษาเหนือที่มีความหมายลึกซึ้ง',
                    '"Loeng Him Kaw" is a Northen Thai word that has a beautiful meaning."'
                  )}
                </p>
                <p>
                  {ct(
                    '🌲 โหล่ง : ย่าน, ชุมชน, หรือพื้นที่โล่งกว้าง',
                    '🌲 Loeng : quarter, neighborhood or wide open area'
                  )}
                </p>
                <p>
                  {ct(
                    '🌊 ฮิม : ริม หรือ ขอบ',
                    '🌊 Him : rim or edge'
                  )}
                </p>
                <p>
                  {ct(
                    '️ คาว : ชื่อแม่น้ำคาว (แม่น้ำสายสำคัญของเชียงใหม่)',
                    ' Kaw : A name of the river that is important to Chiang Mai'
                  )}
                </p>
                <p>
                  {ct(
                    'รวมความหมายคือ "ชุมชนริมแม่น้ำคาว" ก่อตั้งขึ้นโดย คุณชัชวาลย์ ทองดีเลิศและกลุ่มเพื่อนศิลปิน ที่ต้องการเปลี่ยนพื้นที่รกร้างให้กลายเป็นชุมชนสีเขียว(Green Community) ที่เน้นวิถีชีวิตแบบเรียบง่าย พึ่งพาตนเอง และอนุรักษ์ธรรมชาติ',
                    'Alls meaning "A community by the edge of the river Kaw" created by Mr. Chatchaval Thongdeelee and a group of artists who want to change the abandoned area into a green community that emphasizes simple living, self-sufficiency, and nature conservation.' 
                  )}
                </p>
              </div> */}
              <div className="space-y-4 text-gray-700 leading-relaxed">
                {ct(community.history, community.history_en)
                  ?.split('\n')
                  .filter(Boolean)
                  .map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))
                }
              </div>
            </div>

            {/* Image Placeholder */}
            <div className="relative animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 overflow-hidden shadow-xl flex items-center justify-center">
                {/* <p className="text-gray-400 text-lg font-medium">
                  {ct('Community History', 'Community History')}
                </p> */}
                 <img
                    src={`${API_URL}${community.images?.[0]}`}
                    alt={ct('รูปภาพ 2', 'Image 2')}
                    className="w-full h-full object-cover"
                  />
                {/* 30+ Badge - Bottom Right Corner */}
                {/* <div className="absolute bottom-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-gray-200">
                    <p className="text-5xl font-bold text-orange-600 mb-1">30+</p>
                    <p className="text-gray-700 font-semibold text-sm">
                      {ct('ปีแห่งการก่อตั้งและพัฒนาชุมชน', 'Years of Community History')}
                    </p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slow Life Values Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {/* {ct('วิถีชีวิต "Slow Life"', 'The "Slow Life" Way')} */}
              {ct(
                  community.hero_section?.title,
                  community.hero_section?.title_en
                )}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {ct(
                'ที่นี่เราไม่ได้ขายแค่สินค้า แต่เรามอบ "เวลา" ให้คุณได้เดินช้าลง สัมผัสธรรมชาติ และเรียนรู้งานฝีมือด้วยหัวใจ',
                'Here, we don\'t just sell products, but we give you "time" to slow down, experience nature, and learn crafts with your heart'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 ${feature.borderColor} animate-on-scroll opacity-0 translate-y-8`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    {getIcon(feature.title)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {ct(feature.title, feature.title_en)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {ct(feature.desc, feature.desc_en)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {ct('การเดินทางมาชุมชน', 'Getting to the Community')}
            </h2>
            <p className="text-gray-600">
              {ct(
                  community.location?.full_address,
                  community.location?.full_address_en
                )}
            </p>
          </div>

          {/* Map Placeholder */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
            <div className="h-96 md:h-[500px] bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  {ct('แผนที่ Google Map (Embed)', 'Google Map Embed')}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {ct('พิกัด: 18.7903, 99.3661', 'Coordinates: 18.7903, 99.3661')}
                </p>
              </div>
            </div>
          </div>

          {/* Map Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link
              to={`/${community.slug}/map`}
              className="inline-flex items-center justify-center gap-2 bg-[#2d5a4d] hover:bg-[#3d6b5c] text-white px-8 py-4 rounded-full font-semibold transition shadow-lg"
            >
              <MapPin className="h-5 w-5" />
              {ct('เปิด Google Map', 'Open Google Map')}
            </Link>
            <button className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-full font-semibold transition">
              {ct('ส่งตำแหน่งให้ฉัน', 'Send Location to Me')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
