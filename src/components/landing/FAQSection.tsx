import { useState } from "react";
import { ChevronDown, MessageCircle, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How long does it take to set up HealthOS 24?",
    answer: "Most clinics are up and running within 2 hours. We provide a dedicated onboarding specialist who migrates your existing patient data and trains your staff.",
  },
  {
    question: "Can I use my existing patient records?",
    answer: "Yes! We can import patient data from Excel sheets, other software, or even scanned paper records. Our team handles the migration free of charge.",
  },
  {
    question: "Does it work on mobile phones?",
    answer: "Absolutely. HealthOS 24 is fully responsive. Doctors can view patient history on their phones, and patients can check their queue status on any device.",
  },
  {
    question: "What if the internet goes down?",
    answer: "HealthOS 24 has offline mode for critical functions. Patient check-in, token generation, and prescription printing work without internet. Data syncs automatically when connection returns.",
  },
  {
    question: "How is patient data protected?",
    answer: "We use bank-level 256-bit encryption, HIPAA-compliant design, and store data in secure Pakistani data centers. Each organization's data is completely isolated.",
  },
  {
    question: "Can multiple branches share patient data?",
    answer: "Yes, that's a core feature! Patients can visit any branch and their complete history is available. Each branch can also have its own inventory and billing.",
  },
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Questions? We&apos;ve got answers.
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about HealthOS 24
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "bg-card border rounded-2xl overflow-hidden transition-all duration-300",
                openIndex === index ? "border-primary/30 shadow-lg" : "border-border hover:border-primary/20"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-start gap-4 p-6 text-left"
              >
                {/* Chat bubble style */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold text-foreground pr-8">{faq.question}</p>
                </div>
                
                <ChevronDown 
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 mt-1",
                    openIndex === index && "rotate-180"
                  )} 
                />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                openIndex === index ? "max-h-96" : "max-h-0"
              )}>
                <div className="px-4 sm:px-6 pb-6 pt-0">
                  {/* Remove left margin on mobile for full-width answer */}
                  <div className="flex items-start gap-3 sm:gap-4 sm:ml-14">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/50 flex items-center justify-center">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed bg-muted/50 p-3 sm:p-4 rounded-2xl rounded-tl-none">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
