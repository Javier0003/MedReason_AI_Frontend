import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '../../components/sidebar'
import { useRef } from 'react'
import IconArrowRight from '../../assets/svg/IconArrowRight'
import UserLogo from '../../components/user-logo'
import MainPanel from '../../components/main-panel'

export const Route = createFileRoute('/doctor/consulta')({
  component: RouteComponent,
})

function RouteComponent() {
  const complaintsAndSymptoms = useRef<HTMLTextAreaElement>(null)
  const clinicalObservations = useRef<HTMLTextAreaElement>(null)

  const messages = [
    { sender: 'doctor', text: "I'm sorry to hear that. Can you tell me more about your symptoms?" },
    { sender: 'ai', text: "Based on the patient's symptoms, I suggest considering a diagnosis of vertigo or migraine." },
    { sender: 'doctor', text: "Thank you for the suggestion. I will consider those possibilities and order the necessary tests." },
    { sender: 'doctor', text: "Thank you for the suggestion. I will consider those possibilities and order the necessary tests." },
    { sender: 'doctor', text: "Thank you for the suggestion. I will consider those possibilities and order the necessary tests." },
    { sender: 'doctor', text: "Thank you for the suggestion. I will consider those possibilities and order the necessary tests." },
    { sender: 'doctor', text: "Thank you for the suggestion. I will consider those possibilities and order the necessary tests." },
    { sender: 'doctor', text: "Thank you for the suggestion. I will consider those possibilities and order the necessary tests." },
    { sender: 'doctor', text: "Thank you for the suggestion. I will consider those possibilities and order the necessary tests." },
    { sender: 'doctor', text: "Thank you for the suggestion. I will consider those possibilities and order the necessary tests." },
    { sender: 'doctor', text: "Thank you for the suggestion. I will consider those possibilities and order the necessary tests." },
  ]


  const metrics = [{
    label: "Blood Pressure",
    value: "120/80",
    measure: "mmHg",
  }, {
    label: "Heart Rate",
    value: "72",
    measure: "bpm",
  }, {
    label: "Temperature",
    value: "98.6",
    measure: "°F",
  }]

  const handleSaveDraft = () => {
    const symptoms = complaintsAndSymptoms.current?.value
    const observations = clinicalObservations.current?.value

    alert(`Draft saved: ${symptoms}, ${observations}`)
  }

  const handleCompleteConsultation = () => {
    const symptoms = complaintsAndSymptoms.current?.value
    const observations = clinicalObservations.current?.value

    alert(`Consultation completed: ${symptoms}, ${observations}`)
  }

  const messageForAi = useRef<HTMLInputElement>(null)

  const handleAskAI = () => {


    alert("AI suggestions requested")
  }



  return (
    <MainPanel sidebarRole="DOCTOR" userName="Dr. Smith" userProfession="Cardiologist">
      <div className="p-5 flex flex-row justify-between gap-3.5 h-10/12">
        <section className="w-full h-100">
          <div className="bg-white p-4 rounded-lg shadow flex flex-row gap-4 mb-5">
            <img src="/favicon.svg" alt="Favicon" className="w-16 h-16" />

            <div>
              <p className="text-lg font-bold">{"name"}</p>
              <section className="flex gap-2 flex-row">
                <p>{"62"} years</p>
                -
                <p>{"Female"}</p>
                -
                <p>ID: {"MRN-88291"}</p>
              </section>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow flex flex-col gap-4 mb-5">
            <p className="text-lg font-bold border-b border-gray-300 p-2 w-full">LIVE CONSULTATION INTAKE</p>

            <div className="flex flex-row gap-2 p-2 w-full">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex flex-col justify-between p-6 border-b border-gray-300 rounded-lg w-1/3 bg-gray-100 h-24">
                  <p className="text-sm text-gray-500">{metric.label}</p>
                  <div className="text-sm font-medium flex flex-row"><p className="text-lg font-bold">{metric.value}</p> <p className="text-sm text-gray-500 ml-1">{metric.measure}</p></div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 p-2 w-full">
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">Chief Complaint & symptoms</label>
              <textarea id="symptoms" ref={complaintsAndSymptoms} name="symptoms" rows={4} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter patient's symptoms..."></textarea>
            </div>

            <div className="flex flex-col gap-2 p-2 w-full">
              <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">Clinical Observations</label>
              <textarea id="diagnosis" ref={clinicalObservations} name="diagnosis" rows={4} className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter clinical observations..."></textarea>
            </div>

            <div className="flex flex-row gap-2 p-2 w-full justify-end">
              <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleCompleteConsultation}>
                Complete Consultation
              </button>
            </div>
          </div>
        </section>

        <section className="w-3/12 bg-white rounded-lg shadow flex flex-col justify-between ">
          <p className="text-lg font-medium p-4">Clinical Insight AI</p>
          <section className="flex flex-col gap-3 h-5/6 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <Message key={index} sender={message.sender} text={message.text} />
            ))}
          </section>

          <section className="p-4">
            <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 bg-[#fbfbfc] px-3 text-slate-500 focus-within:border-[#1565d8] focus-within:ring-2 focus-within:ring-[#1565d8]/10 ">
              <input
                aria-label="Ask AI for suggestions"
                placeholder="Ask AI for suggestions..."
                className="w-full bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
                ref={messageForAi}
              />
              <button
                type="button"
                onClick={handleAskAI}
                className="text-slate-400 hover:text-slate-600"
              >
                <IconArrowRight />
              </button>
            </div>
          </section>
        </section>
      </div>
    </MainPanel>
  )
}

function Message({ sender, text }: { sender: string, text: string }) {
  const isDoctor = sender === 'doctor'
  return (
    <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs p-3 rounded-lg ${isDoctor ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
        <p>{text}</p>
      </div>
    </div>
  )
}
