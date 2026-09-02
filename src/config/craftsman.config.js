/**
 * =========================================================================
 * 🪵 CRAFTSMAN CONFIGURATION — ورشة علاء خضر لدهانات الموبيليا
 * =========================================================================
 */

export const CRAFTSMAN_CONFIG = {
  name: "علاء خضر",
  brandName: "ورشة علاء خضر لدهانات الموبيليا",
  title: "فني دهانات موبيليا وأخشاب حديثة وكلاسيك",
  slogan: "إبداع وتميز في فن الدهانات المودرن والكلاسيك",
  bio: "ورشة علاء خضر لدهانات الموبيليا بمدينة فاقوس — نعمل دائماً على الإبداع والتميز في فن الدهانات المودرن والكلاسيك وأحدث تشطيبات الأخشاب (دوكو فرن مط ولميع، إستر وبوليستر وتعتيق، قشرة أرو وزان، وتجديد الأثاث القديم).",
  
  avatar: "https://bluetags.online/uploads/vcards/profiles/8645/IMG_IMG_1515792932416_1.jpg",
  coverImage: "https://bluetags.online/uploads/vcards/covers/8646/LogoMaker_٢٤٠٩٢٠٢١_١٣٣٦٥٧.png",

  // ── أرقام التواصل والعناوين ───────────────────────────────
  phone: "01007724110",
  phoneDisplay: "+20 100 772 4110",
  whatsappNumber: "201007724110",
  whatsappDirectUrl: "https://wa.me/201007724110",
  email: "alaa0100772@gmail.com",
  backupEmail: "alaa010@outlook.sa",

  address: "فاقوس، محافظة الشرقية — طريق كفر العدوي، خلف مسجد وفيلا العدوي، أمام محطة الصرف",
  googleMapsUrl: "https://maps.app.goo.gl/a1MUeZERQJv1Twqd8",

  // ── شبكات التواصل الاجتماعي ──────────────────────────────
  socialLinks: {
    whatsapp: "https://wa.me/201007724110",
    facebook: "https://www.facebook.com/profile.php?id=100000583479303",
    instagram: "https://instagram.com/alaa_basha_khedr",
    tiktok: "https://tiktok.com/@alaa.khedr",
    youtube: "https://www.youtube.com/@alaakhedr1426",
    pinterest: "https://pin.it/4OWJWer",
    twitter: "https://twitter.com/Alaa01023",
    linkedin: "https://www.linkedin.com/in/alaa-khedr-29746523a",
    snapchat: "https://www.snapchat.com/add/alaa-khedr"
  },

  // ── الفولدرات الافتراضية المبدئية ─────────────────────────
  defaultFolders: [
    {
      id: "bedrooms",
      name: "غرف النوم",
      desc: "غرف نوم ماستر وأطفال بأحدث تشطيبات الدوكو والإستر",
      icon: "Bed",
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
      subcategories: [
        { id: "bedrooms_duco", name: "غرف نوم دوكو فرن (مط ولميع)" },
        { id: "bedrooms_ester", name: "غرف نوم إستر وبوليستر وتعتيق" },
        { id: "bedrooms_oak", name: "غرف نوم قشرة أرو وزان" },
        { id: "bedrooms_renew", name: "تجديد ودهان غرف نوم قديمة" }
      ]
    },
    {
      id: "dining_rooms",
      name: "غرف السفرة والنيش",
      desc: "سفرات وبوفيهات ونيش بتشطيبات كلاسيك ومودرن ولمعان فندقي",
      icon: "Utensils",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
      subcategories: [
        { id: "dining_duco", name: "سفرة ونيش دوكو فرن أبيض ومودرن" },
        { id: "dining_ester", name: "سفرة إستر وبوليستر كلاسيك" },
        { id: "dining_patina", name: "تعتيق وورق دهب وباتينا" }
      ]
    },
    {
      id: "doors_windows",
      name: "أبواب وشبابيك وخشب شقق",
      desc: "أبواب شقق وغرف مقاومة للرطوبة والعوامل الجوية بأعلى لمعان",
      icon: "DoorOpen",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      subcategories: [
        { id: "doors_duco", name: "أبواب دوكو كابينة فرن" },
        { id: "doors_ester", name: "أبواب إستر وقشرة طبيعية" },
        { id: "doors_lacquer", name: "أبواب لاكيه وزيت مقاوم" }
      ]
    },
    {
      id: "kitchens_dressing",
      name: "مطابخ ودواليب ودريسنج",
      desc: "تشطيب مطابخ خشب طبيعي ودريسنج روم عازل ومقاوم للحرارة",
      icon: "Layers",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
      subcategories: [
        { id: "kitchens_duco", name: "مطابخ دوكو بولي لاك وألوان عصرية" },
        { id: "kitchens_wood", name: "مطابخ خشب أرو وقشرة طبيعية" },
        { id: "dressing_rooms", name: "دواليب ودريسنج روم" }
      ]
    },
    {
      id: "living_salons",
      name: "صالونات وأنتريهات وتجديد",
      desc: "دهان وتجديد صالونات كلاسيك وأنتريهات وورق دهب وفضي",
      icon: "Armchair",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      subcategories: [
        { id: "salons_gold", name: "صالونات ورق دهب وتعتيق فرنسي" },
        { id: "salons_duco", name: "أنتريهات دوكو مودرن" },
        { id: "salons_renew", name: "تجديد وصيانة صالونات مستعملة" }
      ]
    }
  ]
};
