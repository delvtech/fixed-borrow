import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion"
import { useIsTailwindSmallScreen } from "components/mediaBreakpoints"
import { cn } from "components/utils"
import { ReactElement, useState } from "react"
import { faqData } from "static/faqData"

export function FAQ(): ReactElement {
  return (
    <div className="mt-8 flex w-full flex-col items-center">
      <h3 className="mb-8 text-center font-chakra text-3xl text-accent">
        Frequently Asked Questions
      </h3>
      <div className="mx-8 flex flex-row gap-6 rounded-[2rem] bg-secondary p-12 lg:w-[1200px]">
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
        {faqData.map(({ question, key, answer }) => (
          <Accordion type="single" collapsible>
            <AccordionItem value={key}>
              <AccordionTrigger className="text-left text-secondary-foreground">
                {question}
              </AccordionTrigger>
              <AccordionContent className="my-2 rounded-lg bg-border p-4">
                {answer}
              </AccordionContent>
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
                "text-md justify-start p-3 text-left hover:opacity-100",
                {
                  "font-normal opacity-80": selectedFAQKey !== key,
                  "rounded-[8px] bg-border font-medium": selectedFAQKey === key,
                }
              )}
            >
              {question}
            </button>
          ))}
        </div>

        {/* answers */}
        <div className="col-span-2 flex flex-col font-chakra">
          <h4 className="mb-4 text-2xl text-secondary-foreground">
            {selectedFAQ?.question}
          </h4>
          <div className="opacity-80">{selectedFAQ?.answer}</div>
        </div>
      </div>
    </div>
  )
}
