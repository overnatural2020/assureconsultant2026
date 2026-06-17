// src/pages/FAQs.jsx
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const BASE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9'
const MEDIA = 'https://media.base44.com/images/public/6907ccd9d7dc18fba4a28df9'

const FAQS = [
  {
    pregunta: "1. ¿What Is Assure ForLife?",
    respuesta: "Assure for Life offers a Preneed Funeral Assistance Membership in the United States. As a member, you receive important benefits that the membership provides, allowing your loved ones to have tranquility about the funeral and services by enrolling in the membership plan.",
  },
  {
    pregunta: "2. ¿What benefits are covered in the United States?",
    respuesta: `Benefits for basic funeral services:
• Transfer of the deceased to the local funeral home provider
• Transportation of body
• Basic viewing service
• Embalming/body viewing
• Funeral urn (cremation)
• All other benefits

Includes:
Air tickets, round trip, exclusively for the entire family to attend the funeral of the member, for the 5 closest family members.
• One immediate personal assistance, once the member passes away, a new claim can then be submitted for all the members of the family.
• An additional member can be included within all state boundaries.
No geographical limitations on any claim, to the U.S. or in any country in America.`,
  },
  {
    pregunta: "3. ¿Who can replace a primary member in a Family Plan when he or she passes away?",
    respuesta: "After the death of the primary person/member, any one of the members, immediately family of the new can then be set as the primary member by our systems/processes.",
  },
  {
    pregunta: "4. ¿When a member passes away, how soon can they be replaced with someone else?",
    respuesta: "When a member passes away, the new member can be enrolled right after application, not for an immediate or the next service's dates or before, in accordance with the regulations and membership registration requirements.",
  },
  {
    pregunta: "5. ¿How much does the company pay for a funeral service?",
    respuesta: "Assure for Life pays up to a certain amount and does not exceed it in accordance in case of the members' funeral benefits, through a reputable supplier or different funeral home, according to the funds paid in the account.",
  },
  {
    pregunta: "6. ¿What is the waiting period for getting the benefits of the memberships?",
    respuesta: "Assure for Life reserves the right to apply a limitation after the membership has been active. Natural and Accidental death will provide cover until the process has been payment required. Assure for Life specifically states that an IEC membership does not require an age requirement.",
  },
  {
    pregunta: "7. ¿What are the preexisting conditions not accepted at the time of purchasing a plan?",
    respuesta: "All medical conditions. Please be informed at the time of the membership must be limited to a funeral assistance program to pay for any and all death claims.",
  },
  {
    pregunta: "8. ¿What are the age conditions to be a member of a Family Plan?",
    respuesta: "There are 7 people included from 0 to 65. When a member reaches a maximum of two, confirmation must be made for compliance, for the service provision of two, confirmations of use, confirmations of families, and removals, that will give you all of the membership to plan.",
  },
  {
    pregunta: "9. ¿What are the special rate states?",
    respuesta: "Special states include: Florida, New Jersey, Virginia, Carolina del Norte, New York, California and other states.",
  },
  {
    pregunta: "10. ¿What to do when a member passes?",
    respuesta: "The policyholder is immediately to contact our 24/7 to find the case damage. Help by call 1 855 0 2 507.",
  },
  {
    pregunta: "11. ¿When can I make changes to my funeral assistance membership?",
    respuesta: "Changes to the membership are processed to allow membership status changes as long as permitted by our plan. Changes in the membership may be made no later than 30 days from the initial enrollment date from the membership date to the 5th of the month from the effective date of the membership policy to the 5th of the month from the effective date of membership, and including the affective date of family, members, otherwise able to find add options to active.",
  },
  {
    pregunta: "12. ¿What plan can I offer to a 66 years old person?",
    respuesta: "Yes, as a Family Membership Plan at a Silver rate. Fit the appropriate plan as a member in some context.",
  },
  {
    pregunta: "13. ¿What plan can I offer to a 75 years old person?",
    respuesta: "Assure for Life can only be offered when for a person over 27 years old.",
  },
  {
    pregunta: "14. ¿Is the renewal automatic?",
    respuesta: "Due to membership rules, memberships are automatically renewed.",
  },
  {
    pregunta: "15. ¿When do pay periods begin and close?",
    respuesta: "Billing typically falls between the 5th day and the month's day from the 15th of the payment, 5th of the 10 and 15th of the month according to the payment date. However any verbal statements between the 5th to the 25th, count after all have been authorized, pay in the month in the system administrator reads your paid cover but no applicables all the types of portfolio.",
  },
  {
    pregunta: "16. ¿What does consultants get that their sales commissions paid?",
    respuesta: "Consultants will be paid bonuses on a financial each month. 5% payment when they decide to meet the applicable states from the account of each approved. Confirm the direct approved paid the membership plan with each agreed number above, the last two months, our business sales, and ask both your sales, time to sales from the minimum of and to agree above.",
  },
  {
    pregunta: "17. ¿What are the monthly requirements to maintain or upgrade the commission level?",
    respuesta: "Every month you must maintain a minimum active number of new membership-based member based on the number of sales according to your current program level. If you are current at all levels once for the next 3 months period of the new in December, for the maximum three months plan being will change requirements appropriately to their next.",
  },
  {
    pregunta: "18. ¿Can a person in Latin America or the Caribbean become a consultant?",
    respuesta: "Yes, one specific billing in the United States America. 4 to 200 additional by Visa is in the United States.",
  },
  {
    pregunta: "19. ¿Is a state license required to become a consultant?",
    respuesta: "Assure for Life is a membership, therefore a state insurance may not be required. You must not be in the same company or insurance company.",
  },
]

export default function FAQs() {
  const [open, setOpen] = useState(null)

  const toggle = (i) => setOpen(open === i ? null : i)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero: woman image + giant FAQ's text */}
      <div className="relative bg-white overflow-hidden min-h-[320px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-end justify-center min-h-[320px]">
            <div className="flex items-end">
              <img
                src={`${MEDIA}/f46733fa1_mujerencell.png`}
                alt="Consultora"
                className="h-72 md:h-80 w-auto object-contain object-bottom"
              />
              <h1
                className="text-8xl md:text-[120px] font-bold text-[#00565f] leading-none pb-4"
                style={{ fontFamily: "'Arca Majora 3', sans-serif" }}
              >
                FAQ's
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-[#00565f] text-sm md:text-base pr-4">
                  {faq.pregunta}
                </span>
                {open === i
                  ? <ChevronUp className="w-5 h-5 text-[#eb6e54] flex-shrink-0" />
                  : <ChevronDown className="w-5 h-5 text-[#eb6e54] flex-shrink-0" />
                }
              </button>
              {open === i && (
                <div className="px-6 pb-5 bg-white border-t border-gray-100">
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line pt-4">
                    {faq.respuesta}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer logo */}
        <div className="flex justify-center mt-14 mb-4">
          <img
            src={`${BASE}/b2a1ef2c6_Disenopaginadelconsultorinicio-14.png`}
            alt="Assure for Life"
            className="h-12 w-auto"
          />
        </div>
      </div>
    </div>
  )
}
