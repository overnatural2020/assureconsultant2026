// src/pages/FAQs.jsx
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const BASE = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6907ccd9d7dc18fba4a28df9'
const MEDIA = 'https://media.base44.com/images/public/6907ccd9d7dc18fba4a28df9'

const FAQS_ES = [
  {
    pregunta: '1. ¿Qué es Assure For Life?',
    respuesta: `Assure For Life ofrece una Membresía de Coordinación de Servicios Funerarios en los Estados Unidos.

A diferencia de un seguro o un contrato de previsión funeraria, esta membresía no entrega sumas de dinero. En su lugar, al convertirte en miembro, brindamos acompañamiento integral en la planificación y coordinación de los servicios funerarios para los seres queridos fallecidos, mediante la contratación de proveedores de servicios funerarios.`,
  },
  {
    pregunta: '2. ¿Qué beneficios están cubiertos en los Estados Unidos?',
    respuesta: `Cobertura de los servicios funerarios básicos:
• Traslado del fallecido al proveedor local de servicios funerarios.
• Preparación del cuerpo.
• Tiempo básico para el velorio.
• Ataúd para el velorio.
• Honorarios del Director Funerario.
• Libro de firmas y recordatorios.
• Certificado de defunción.

Además:
• Tiquete aéreo de ida y regreso, exclusivamente para el titular, con el fin de asistir al funeral de uno de los miembros del plan.
• Opción de cremación: cremación y urna para las cenizas.
• Opción de sepultura: ataúd básico y carroza fúnebre hasta el cementerio (no incluye los costos del cementerio en EE. UU.).`,
  },
  {
    pregunta: '3. ¿Quién puede reemplazar al titular de un Plan Familiar cuando fallece?',
    respuesta: `Cuando el titular del plan fallece, puede ser reemplazado inmediatamente por cualquiera de los miembros actuales del plan o por un nuevo miembro que cumpla con los requisitos.`,
  },
  {
    pregunta: '4. Cuando fallece un miembro del plan, ¿cuándo puede ser reemplazado?',
    respuesta: `Cuando fallece un miembro (que no sea el titular del plan), el reemplazo podrá realizarse en la siguiente fecha de aniversario de la membresía.
El titular deberá comunicarse con la compañía para completar la nueva solicitud.`,
  },
  {
    pregunta: '5. ¿Cuánto paga la compañía por un servicio funerario?',
    respuesta: `Assure For Life no garantiza una suma específica de dinero, ya que está autorizada únicamente para brindar asistencia mediante un proveedor funerario independiente y de reconocida trayectoria, ubicado cerca del lugar donde se requiera el servicio.`,
  },
  {
    pregunta: '6. ¿Cuál es el período de espera para acceder a los beneficios?',
    respuesta: `A partir del tercer día hábil después de la inscripción y una vez realizado el primer pago, Assure For Life cubre fallecimientos por:
• Accidente.
• Muerte violenta.
• Suicidio.

Las muertes por causas naturales están cubiertas 180 días calendario después de haber realizado el primer pago.`,
  },
  {
    pregunta: '7. ¿Qué condiciones preexistentes no son aceptadas al adquirir una membresía?',
    respuesta: `Al momento de la inscripción, el titular o cualquiera de los miembros del plan no debe:
• Tener una enfermedad terminal.
• Tener diagnóstico de cáncer.
• Estar en tratamiento de diálisis.
• Tener un tumor cerebral.`,
  },
  {
    pregunta: '8. ¿Cuáles son las condiciones de edad para pertenecer a un Plan Familiar?',
    respuesta: `Se pueden incluir miembros de hasta 65 años, sin importar el parentesco con el titular.
También pueden incluirse hasta dos padres o la pareja del titular, con una edad máxima de 80 años, únicamente al momento de la inscripción.
La cobertura permanecerá vigente siempre que la membresía continúe pagándose.`,
  },
  {
    pregunta: '9. ¿Cuáles son los estados con tarifa especial?',
    respuesta: `Los estados con tarifa especial son:
• Florida
• Carolina del Norte
• Carolina del Sur
• Nueva York
• California
• Puerto Rico`,
  },
  {
    pregunta: '10. ¿Qué hacer cuando fallece un miembro?',
    respuesta: `El titular o cualquier miembro del plan debe comunicarse inmediatamente con nuestra línea de emergencias funerarias disponible las 24 horas:
1-888-815-5817`,
  },
  {
    pregunta: '11. ¿Cuándo puedo realizar cambios en mi membresía?',
    respuesta: `Los cambios únicamente pueden realizarse:
• Durante los primeros 3 días después de enviar la solicitud de inscripción.
• En cada fecha de aniversario de la membresía.

Si fallece el titular, podrá ser reemplazado inmediatamente por un miembro actual o por un nuevo miembro que cumpla con los requisitos.

Para realizar cambios, deberá enviar un correo electrónico a:
contracts@assureforlife.com

Incluyendo la siguiente información:
• Nombre completo.
• Fecha de nacimiento.
• Nacionalidad.
• Relación con el titular.
• Ciudad.
• Estado.`,
  },
  {
    pregunta: '12. ¿Qué plan puedo ofrecer a una persona de 73 años?',
    respuesta: `Puede ofrecer el Plan Silver (de 66 a 75 años) si la persona no tiene hijos.
Si tiene hijos, el plan recomendado es el Plan Familiar.`,
  },
  {
    pregunta: '13. ¿Qué plan puedo ofrecer a una persona de 92 años?',
    respuesta: `Assure For Life no ofrece membresías para personas mayores de 80 años.`,
  },
  {
    pregunta: '14. ¿La renovación es automática?',
    respuesta: `Sí. La membresía se renueva automáticamente en la fecha de aniversario.`,
  },
  {
    pregunta: '15. ¿Cuándo comienzan y terminan los períodos de pago?',
    respuesta: `Los períodos de pago son:
• Del 1 al 15 de cada mes, con cierre a las 5:00 p. m. (ET).
• Del 16 al 30 o 31 de cada mes, con cierre a las 5:00 p. m. (ET).`,
  },
  {
    pregunta: '16. ¿Cuándo reciben los consultores el pago de sus comisiones?',
    respuesta: `Las comisiones serán transferidas a la institución financiera entre 3 y 5 días hábiles después del cierre del período de pago.
Antes del primer pago se enviará un depósito de prueba. Una vez sea confirmado correctamente por la institución financiera, el pago será procesado dos días hábiles después.`,
  },
  {
    pregunta: '17. ¿Cuáles son los requisitos mensuales para mantener o subir de nivel de comisiones?',
    respuesta: `Cada mes deberás:
• Realizar al menos dos ventas personales.
• Mantener el volumen de ventas correspondiente a tu categoría.

Si durante tres meses consecutivos no alcanzas el volumen requerido, en el cuarto mes recibirás comisiones de acuerdo con tus ventas actuales.
Si no realizas ventas durante seis meses consecutivos, tu estatus como consultor será desactivado.`,
  },
  {
    pregunta: '18. ¿Puede una persona de Latinoamérica o el Caribe convertirse en consultor?',
    respuesta: `No.
Únicamente las personas que residen en los Estados Unidos pueden convertirse en consultores.
Es indispensable contar con un Tax ID o un Número de Seguro Social (Social Security Number).`,
  },
  {
    pregunta: '19. ¿Se requiere una licencia estatal para convertirse en consultor?',
    respuesta: `No.
Assure For Life ofrece una membresía, por lo que no se requiere una licencia estatal.
Sin embargo, es obligatorio completar la certificación de Assure For Life para poder desempeñarse como consultor.`,
  },
]

const FAQS_EN = [
  {
    pregunta: '1. What is Assure For Life?',
    respuesta: `Assure For Life offers a Professional Funeral Assistance Membership in the United States.

Unlike insurances or prepaid funeral contracts, this membership does not provide monetary sums. Instead, upon becoming a member, we offer comprehensive support in the planning and organization of funerals for deceased loved ones, by contracting funeral service providers.`,
  },
  {
    pregunta: '2. What benefits are covered in the United States?',
    respuesta: `Payment for basic funeral services:
• Transfer of the deceased to the local funeral service provider.
• Preparation of the body.
• Basic viewing time.
• Coffin for the viewing.
• Funeral Director's fees.
• Book of signatures and reminders.
• A death certificate.

Besides:
• Airline ticket, round trip, exclusively for the holder, in order to attend the funeral of the members of the plan.
• Cremation option: cremation and urn for ashes.
• Burial option: Basic casket and hearse to the cemetery (does not include cemetery fees in the US).`,
  },
  {
    pregunta: '3. Who can replace a primary member in a Family Plan when he or she passes away?',
    respuesta: `When the primary member passes away, he or she may be replaced immediately by any of the current members or by a new qualifying member.`,
  },
  {
    pregunta: '4. When a member passes away, how soon can they be replaced with someone else?',
    respuesta: `When a member (non-plan holder) passes away, an eligible replacement can be completed on the next anniversary date of the plan. The plan holder must communicate with the company to complete the new application.`,
  },
  {
    pregunta: '5. How much does the company pay for a funeral service?',
    respuesta: `Assure For Life does not guarantee a specific amount because it is authorized to deliver assistance only, through a reputable independent funeral home, near the client's area or as required.`,
  },
  {
    pregunta: '6. What is the waiting period for getting the benefits of the memberships?',
    respuesta: `Starting on the third business day after enrollment, after the first payment has been made, Assure For Life covers accidental, violent death, or suicide.

Assure For Life covers death by natural causes 180 calendar days after making the first payment.`,
  },
  {
    pregunta: '7. What are the preexisting conditions not accepted at the time of purchasing a plan?',
    respuesta: `At the time of enrollment, the plan holder or any of its members must not be terminally ill, have a cancer diagnosis, be on dialysis, or have a brain tumor.`,
  },
  {
    pregunta: '8. What are the age conditions to be a member of a Family Plan?',
    respuesta: `Members age 65 or younger can be included, regardless of kinship to the holder.
Parents or partner of the plan holder up to 80 years of age, a maximum of two, can be added at the time of enrollment, and coverage will not expire as long as the membership is paid.`,
  },
  {
    pregunta: '9. What are the special rate states?',
    respuesta: `Special rate states include Florida, North Carolina, South Carolina, New York, California, and Puerto Rico.`,
  },
  {
    pregunta: '10. What to do when a member passes?',
    respuesta: `The plan holder or any member must call our 24-hour funeral emergency line at 1 888-815-5817.`,
  },
  {
    pregunta: '11. When can I make changes to my funeral assistance membership?',
    respuesta: `Changes to the funeral assistance membership can be made only within 3 days after submitting the application or on each anniversary date. If the primary member passes away, he or she may be replaced immediately by any of the current members or by a new member who meets the requirements.

Steps to change the funeral assistance membership include forwarding an email to contracts@assureforlife.com as well as including full name, date of birth, nationality, holder's relationship, city, and state.`,
  },
  {
    pregunta: '12. What plan can I offer to a 73 years old person?',
    respuesta: `You can offer the Silver Plan (from 66 to 75 years old) if the person has no children; otherwise, the Family Plan is the best option.`,
  },
  {
    pregunta: '13. What plan can I offer to a 92 years old person?',
    respuesta: `Assure For Life does not offer plans for people over 80 years old.`,
  },
  {
    pregunta: '14. Is the renewal automatic?',
    respuesta: `On the anniversary date, the membership is automatically renewed.`,
  },
  {
    pregunta: '15. When do pay periods begin and close?',
    respuesta: `The first pay period schedule is between the 1st day of the month through the 15th, and closes at 5 p.m. ET.
The second pay period schedule is between the 16th through the 30th or 31st and closes at 5 p.m. ET.`,
  },
  {
    pregunta: '16. When do consultants get their sales commissions paid?',
    respuesta: `Your payment will be transferred to your financial institution 3 to 5 business days after the pay period closes. Confirm the payment with your bank. Prior to your initial payment, a test amount will be sent to your financial institution. Upon successful receipt, two business days later your payment will be sent out.`,
  },
  {
    pregunta: '17. What are the monthly requirements to maintain or upgrade the commission level?',
    respuesta: `Every month, you must make a minimum of two personal sales and maintain the number of sales corresponding to your current category level. If you do not have the number of sales in that category for three consecutive months, in the fourth month you will receive commissions according to current sales.

If you do not make any sales for six consecutive months, your status as a consultant will become deactivated in the company.`,
  },
  {
    pregunta: '18. Can a person in Latin America or the Caribbean become a consultant?',
    respuesta: `No, only people living in the USA can become consultants. A Tax ID or Social Security Number is required.`,
  },
  {
    pregunta: '19. Is a state license required to become a consultant?',
    respuesta: `Assure For Life is a membership, therefore a state license is not required. You must get certified with Assure For Life to become a consultant.`,
  },
]

export default function FAQs() {
  const [open, setOpen] = useState(null)
  const { i18n } = useTranslation()

  const isEs = (i18n.language || 'es').toLowerCase().startsWith('es')
  const FAQS = isEs ? FAQS_ES : FAQS_EN

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
