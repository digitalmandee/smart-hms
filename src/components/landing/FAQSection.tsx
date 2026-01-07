import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does it take to set up SmartHMS?",
    answer: "Most facilities are up and running within 24-48 hours. Our onboarding team helps you configure modules, import existing patient data, and train your staff.",
  },
  {
    question: "Can I use SmartHMS for multiple clinic branches?",
    answer: "Yes! SmartHMS supports unlimited branches under a single organization. Each branch can have its own settings, staff, and inventory while sharing patient records across locations.",
  },
  {
    question: "Is my patient data secure and HIPAA compliant?",
    answer: "Absolutely. We use bank-level encryption, role-based access controls, and regular security audits. All data is stored on secure, redundant servers with daily backups.",
  },
  {
    question: "Can doctors access the system from their phones?",
    answer: "Yes, SmartHMS is fully responsive and works on tablets and smartphones. Doctors can view their queue, write prescriptions, and access patient history from any device.",
  },
  {
    question: "Do you offer training and support?",
    answer: "We provide comprehensive training during onboarding, video tutorials, and documentation. Our support team is available via email, chat, and phone during business hours.",
  },
  {
    question: "Can I integrate with lab equipment or external systems?",
    answer: "Enterprise plans include API access for custom integrations. We also have pre-built integrations for popular lab systems and accounting software.",
  },
];

export const FAQSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked
            <span className="text-primary"> Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about SmartHMS.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 data-[state=open]:bg-muted/30"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
