import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion"
import { useIsTailwindSmallScreen } from "components/mediaBreakpoints"
import { cn } from "components/utils"
import { ReactElement, useState } from "react"
import { faqData } from "./faqData"

export function FAQ(): ReactElement {
  return (
    <div className="mt-8 flex w-full flex-col items-center">
      <h3 className="mb-8 text-3xl font-chakra text-center text-accent">
        Frequently Asked Questions
      </h3>
      <div className="mx-8 flex md:w-[1200px] flex-row gap-6 rounded-[2rem] bg-secondary p-12">
        <FAQEntries />
      </div>
    </div>
  )
}

export function FAQEntries(): JSX.Element {
  const isTailwindSmallScreen = useIsTailwindSmallScreen()
  const [selectedFAQKey, setSelectedFAQKey] = useState("faq1")
  const selectedFAQ = faqData.find((faq) => faq.key === selectedFAQKey)
  if (isTailwindSmallScreen) {
    return (
      <div className="flex flex-col gap-y-2">
        {faqData.map((faq) => (
          <Accordion type="single" collapsible>
            <AccordionItem value={faq.key}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    )
  }
  return (
    <div className="m-8 flex min-h-[400px] max-w-6xl flex-col">
      <div className="grid grid-cols-3 gap-8">
        {/* questions */}
        <div className="col-span-1 flex flex-col gap-1 text-left">
          {faqData.map(({ question, key }) => (
            <button
              key={key}
              onClick={() => setSelectedFAQKey(key)}
              className={cn(
                "daisy-btn-md justify-start text-left text-md hover:opacity-100 py-3 px-2",
                {
                  "font-normal opacity-80": selectedFAQKey !== key,
                  "font-medium bg-border rounded-[8px]": selectedFAQKey === key,
                }
              )}
            >
              {question}
            </button>
          ))}
        </div>

        {/* answers */}
        <div className="col-span-2 flex flex-col font-chakra">
          <h4 className="mb-4 text-secondary-foreground text-2xl">
            {selectedFAQ?.question}
          </h4>
          <div className="opacity-80">{selectedFAQ?.answer}</div>
        </div>
      </div>
    </div>
  )
}
