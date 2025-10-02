"use client"

import { useState } from "react"
import { ServiceSelection } from "@/components/booking/service-selection"
import { ProfessionalSelection } from "@/components/booking/professional-selection"
import { DateTimeSelection } from "@/components/booking/datetime-selection"
import { BookingConfirmation } from "@/components/booking/booking-confirmation"
import { BookingSuccess } from "@/components/booking/booking-success"

type BookingStep = "service" | "professional" | "datetime" | "confirmation" | "success"

export function BookingFlow() {
  const [step, setStep] = useState<BookingStep>("service")
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null)
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  const handleServiceSelect = (service: any) => {
    setSelectedService(service)
    setStep("professional")
  }

  const handleProfessionalSelect = (professional: any) => {
    setSelectedProfessional(professional)
    setStep("datetime")
  }

  const handleDateTimeSelect = (dateTime: string) => {
    setSelectedDateTime(dateTime)
    setStep("confirmation")
  }

  const handleConfirm = (id: string) => {
    setAppointmentId(id)
    setStep("success")
  }

  const handleBack = () => {
    if (step === "professional") {
      setStep("service")
      setSelectedService(null)
    } else if (step === "datetime") {
      setStep("professional")
      setSelectedProfessional(null)
    } else if (step === "confirmation") {
      setStep("datetime")
      setSelectedDateTime(null)
    }
  }

  const handleReset = () => {
    setStep("service")
    setSelectedService(null)
    setSelectedProfessional(null)
    setSelectedDateTime(null)
    setAppointmentId(null)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["Servicio", "Profesional", "Fecha y Hora", "Confirmar"].map((label, index) => {
            const stepIndex = ["service", "professional", "datetime", "confirmation"].indexOf(step)
            const isActive = index <= stepIndex
            const isCurrent = index === stepIndex

            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`mt-2 hidden text-xs sm:block ${
                      isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {index < 3 && <div className={`mx-2 h-0.5 flex-1 ${index < stepIndex ? "bg-primary" : "bg-muted"}`} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === "service" && <ServiceSelection onSelect={handleServiceSelect} />}
        {step === "professional" && (
          <ProfessionalSelection
            serviceId={selectedService?.id}
            onSelect={handleProfessionalSelect}
            onBack={handleBack}
          />
        )}
        {step === "datetime" && (
          <DateTimeSelection
            professionalId={selectedProfessional?.id}
            serviceId={selectedService?.id}
            onSelect={handleDateTimeSelect}
            onBack={handleBack}
          />
        )}
        {step === "confirmation" && (
          <BookingConfirmation
            service={selectedService}
            professional={selectedProfessional}
            dateTime={selectedDateTime}
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        )}
        {step === "success" && <BookingSuccess appointmentId={appointmentId} onReset={handleReset} />}
      </div>
    </div>
  )
}
