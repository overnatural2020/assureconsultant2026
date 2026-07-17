// src/pages/Memberships.jsx
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const BASE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9'
const MEDIA = 'https://media.base44.com/images/public/6907ccd9d7dc18fba4a28df9'

const FAMILIAR = {
  tarifaRegular: '$85',
  tarifaEspecial: '$75',
  imagenPersonas: `${BASE}/22391f993_DisenopaginadelconsultorMembresia-27.png`,
}

const SILVER = {
  planes: [
    { titleKey: 'memberships.silver_plan_1_title', tarifaRegular: '$60', tarifaEspecial: '$50' },
    { titleKey: 'memberships.silver_plan_2_title', tarifaRegular: '$85', tarifaEspecial: '$75' },
  ],
}

function EstamosContigo({ t }) {
  return (
    <div className="bg-[#daedf0] rounded-3xl overflow-hidden relative flex flex-col md:flex-row items-stretch">
      <div className="flex-1 px-10 py-8 flex flex-col justify-center">
        <div className="inline-flex items-center mb-5 self-start">
          <div className="w-14 h-14 rounded-full bg-[#7db8b3] flex items-center justify-center z-10 flex-shrink-0">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div className="text-white font-black text-[1.75rem] px-5 rounded-r-xl -ml-3 bg-[#00565f]">
            {t('memberships.we_are_with_you')}
          </div>
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-[#005761] mb-3 leading-snug ml-[52px]">
          {t('memberships.we_are_sub')}
        </h3>
        <p className="leading-relaxed text-[#00565f] text-lg ml-[52px]">
          {t('memberships.we_are_desc')}
        </p>
      </div>
      <div className="relative flex-shrink-0 w-full md:w-[320px] flex items-end justify-center self-end">
        <div className="absolute w-48 h-48 bg-[#fcc469] rounded-full bottom-4 right-4 z-0" />
        <img
          src={`${MEDIA}/86767f806_142.png`}
          alt="Acompañamiento psicológico"
          className="relative z-10 w-[270px]"
        />
      </div>
    </div>
  )
}

function Stats({ t }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-[#00565f] rounded-3xl p-8 text-center">
        <div className="relative inline-block mb-2">
          <div className="absolute top-[1px] left-[-3px] w-3 h-3 bg-[#eb6e54] rounded-full z-0" />
          <p className="relative z-10 text-5xl font-black text-white">3</p>
        </div>
        <h3 className="font-bold text-white text-xl mb-1">{t('memberships.stat_1_title')}</h3>
        <p className="text-white/80 text-lg">{t('memberships.stat_1_sub')}</p>
      </div>
      <div className="bg-[#00565f] rounded-3xl p-8 text-center">
        <div className="relative inline-block mb-2">
          <div className="absolute top-[1px] left-[-3px] w-3 h-3 bg-[#eb6e54] rounded-full z-0" />
          <p className="relative z-10 text-5xl font-black text-white">1</p>
        </div>
        <h3 className="font-bold text-white text-xl mb-1">{t('memberships.stat_2_title')}</h3>
        <p className="text-white/80 text-lg">{t('memberships.stat_2_sub')}</p>
      </div>
      <div className="bg-[#00565f] rounded-3xl p-8 text-center flex flex-col justify-center">
        <div className="relative inline-block mb-2">
          <h3 className="relative z-10 font-bold text-white text-xl">
            <span className="relative inline-block">
              <div className="absolute top-[-2px] left-[-3px] w-3 h-3 bg-[#eb6e54] rounded-full z-0" />
              <span className="relative z-10">{t('memberships.stat_3_title')}</span>
            </span>
          </h3>
        </div>
        <p className="text-white/80 text-lg">{t('memberships.stat_3_sub')}</p>
      </div>
    </div>
  )
}

const BENEFIT_KEYS = [
  'memberships.benefit_1',
  'memberships.benefit_2',
  'memberships.benefit_3',
  'memberships.benefit_4',
  'memberships.benefit_5',
  'memberships.benefit_6',
]

const SILVER_BENEFIT_KEYS = [
  'memberships.silver_benefit_1',
  'memberships.silver_benefit_2',
  'memberships.silver_benefit_3',
  'memberships.silver_benefit_4',
  'memberships.silver_benefit_5',
]

export default function Memberships() {
  const [tab, setTab] = useState('familiar')
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      {/* Title */}
      <div className="text-center mb-12 px-4 pt-8">
        <div className="inline-block relative mb-4">
          <div className="absolute top-[-2px] left-[63px] md:left-[-3px] w-[18px] h-[18px] bg-[#eb6e54] rounded-full z-0" />
          <h1
            className="relative z-10 text-5xl md:text-6xl font-bold text-gray-800"
            style={{ fontFamily: "'Arca Majora 3', sans-serif" }}
          >
            <span className="text-[#7db8b3]">{t('memberships.page_title_1')}</span>{' '}
            <span className="text-[#00565f]">{t('memberships.page_title_2')}</span>
          </h1>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex justify-center mb-8 px-4">
        <div className="inline-flex border border-gray-200 bg-gray-50 p-1 gap-1 rounded-md">
          <button
            onClick={() => setTab('familiar')}
            className={`px-8 py-3 font-semibold transition-all duration-300 rounded-md ${
              tab === 'familiar' ? 'bg-[#eb6e54] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('memberships.family_plan')}
          </button>
          <button
            onClick={() => setTab('silver')}
            className={`px-8 py-3 font-semibold transition-all duration-300 rounded-md ${
              tab === 'silver' ? 'bg-[#00565f] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t('memberships.silver_plan')}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {tab === 'familiar' ? (
          <div className="space-y-8">
            {/* Plan Familiar card */}
            <div className="bg-[#daedf0] rounded-3xl p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                <div className="flex justify-center relative overflow-visible">
                  <img
                    src={FAMILIAR.imagenPersonas}
                    alt="Plan Familiar"
                    className="relative z-10 w-full max-w-lg scale-110"
                  />
                </div>
                <div>
                  <div className="flex justify-center mb-6">
                    <div className="inline-block bg-[#00565f] text-white px-6 py-2 rounded-2xl">
                      <h3 className="text-xl font-extrabold">{t('memberships.family_plan')}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 items-start">
                    <div className="flex flex-col">
                      <div className="bg-[#eb6e54]/10 border border-[#eb6e54] rounded-2xl p-5 text-center">
                        <p className="text-[#00565f] mb-1 text-2xl font-medium">{t('memberships.regular_rate')}</p>
                        <p className="text-5xl text-[#eb6e54] mb-1 font-bold">{FAMILIAR.tarifaRegular}</p>
                        <p className="text-[#00565f] text-2xl font-medium">{t('common.monthly')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="bg-[#eb6e54]/40 border border-[#eb6e54] rounded-2xl p-5 text-center relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-[#eb6e54] text-white text-xs font-bold px-3 py-1 rounded-full">
                            {t('common.special')}
                          </span>
                        </div>
                        <p className="text-[#00565f] mb-1 text-2xl font-medium">{t('memberships.special_rate')}</p>
                        <p className="text-5xl text-[#eb6e54] mb-1 font-bold">{FAMILIAR.tarifaEspecial}</p>
                        <p className="text-[#00565f] text-2xl font-medium">{t('common.monthly')}</p>
                      </div>
                      <p className="text-xs text-[#00565f] italic mt-2">{t('memberships.special_rate_note')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#00565f]/20 my-8" />

              <div>
                <h3 className="text-2xl font-bold text-[#00565f] mb-6" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
                  {t('memberships.benefits_title')}
                </h3>
                <div className="space-y-4">
                  {BENEFIT_KEYS.map((key, i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-[#00565f]/20 last:border-0">
                      <img
                        src={`${BASE}/9cc2d8efa_DisenopaginadelconsultorMembresia-29.png`}
                        alt="check"
                        className="w-6 h-6 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-[#00565f] text-lg leading-relaxed">{t(key)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-[#aecfcc] rounded-2xl p-5 flex items-center gap-4">
                  <img
                    src={`${BASE}/4660e41ae_DisenopaginadelconsultorMembresia-21.png`}
                    alt="info"
                    className="w-16 h-16 flex-shrink-0"
                  />
                  <p className="text-[#00565f] text-xl text-center">
                    {t('memberships.no_affiliation_note')}
                  </p>
                </div>
              </div>
            </div>

            <EstamosContigo t={t} />
            <Stats t={t} />

            <div className="flex justify-center pt-4">
              <img
                src={`${BASE}/b2a1ef2c6_Disenopaginadelconsultorinicio-14.png`}
                alt="Assure for Life"
                className="h-16 w-auto"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-[#eeeae5] rounded-3xl p-8 md:p-10">
              <div className="flex justify-center mb-8">
                <div className="bg-[#eb6e54] text-white px-8 py-3 text-center rounded-2xl">
                  <h3 className="font-bold text-2xl">{t('memberships.silver_exclusive')}</h3>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {SILVER.planes.map((plan, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className={`inline-block px-5 py-2 rounded-lg mb-4 ${
                        idx === 0 ? 'bg-[#7db8b3] text-[#00565f]' : 'bg-[#00565f] text-white'
                      }`}
                    >
                      <h3 className="font-bold text-xl">{t(plan.titleKey)}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full items-stretch">
                      <div className="flex flex-col">
                        <div className="bg-[#7db8b3]/60 rounded-2xl p-4 text-center border border-[#005761] min-h-[160px] flex flex-col justify-center items-center">
                          <p className="text-[#00565f] font-semibold mb-1 text-base">{t('memberships.regular_rate')}</p>
                          <p className="text-4xl font-bold text-[#00565f] mb-1">{plan.tarifaRegular}</p>
                          <p className="text-[#00565f] font-semibold text-base">{t('common.monthly')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div
                          className={`rounded-2xl p-4 text-center border border-[#005761] min-h-[160px] flex flex-col justify-center items-center ${
                            idx === 1 ? 'bg-[#00565f]' : 'bg-[#7db8b3]'
                          }`}
                        >
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-[5px] inline-block mb-2 ${
                              idx === 1 ? 'bg-white/20 text-white' : 'bg-[#00565f] text-white'
                            }`}
                          >
                            ✦ {t('common.special')}
                          </span>
                          <p className={`font-semibold mb-1 text-base ${idx === 1 ? 'text-white' : 'text-[#00565f]'}`}>
                            {t('memberships.special_rate')}
                          </p>
                          <p className={`text-4xl font-bold mb-1 ${idx === 1 ? 'text-white' : 'text-[#00565f]'}`}>
                            {plan.tarifaEspecial}
                          </p>
                          <p className={`font-semibold text-base ${idx === 1 ? 'text-white' : 'text-[#00565f]'}`}>
                            {t('common.monthly')}
                          </p>
                        </div>
                        <p className="text-xs text-[#00565f] italic mt-2 text-center">{t('memberships.special_rate_note')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-bold text-[#00565f] mb-6" style={{ fontFamily: "'Arca Majora 3', sans-serif" }}>
                  {t('memberships.benefits_title')}
                </h3>
                <div className="space-y-4">
                  {SILVER_BENEFIT_KEYS.map((key, i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-[#00565f]/20 last:border-0">
                      <img
                        src={`${BASE}/a2a14d100_DisenopaginadelconsultorMembresia-31.png`}
                        alt="check"
                        className="w-6 h-6 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-[#00565f] text-lg leading-relaxed">{t(key)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <EstamosContigo t={t} />
            <Stats t={t} />

            <div className="flex justify-center pt-4">
              <img
                src={`${BASE}/b2a1ef2c6_Disenopaginadelconsultorinicio-14.png`}
                alt="Assure for Life"
                className="h-16 w-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
