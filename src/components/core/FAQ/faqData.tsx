export const faqData = [
  {
    key: "faq1",
    question: "What is Fixed Rate Borrow?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          Fixed Rate Borrow allows users to hedge against variable interest rate
          fluctuations by taking a Short position on Hyperdrive, effectively
          capping borrowing costs.
        </p>
        <p>
          By earning the lender's rate on your borrow position, you can
          counteract the variability of your loan's costs with your lending
          profits through the corresponding Hyperdrive market.
        </p>
        <p>
          A dedicated Fixed Rate Borrow product is expected to launch soon (Q2
          2024).
        </p>
      </div>
    ),
  },
  {
    key: "faq2",
    question: "How does Fixed Rate Borrow work?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          When you take a Short position on Hyperdrive, you pay a fixed rate to
          the pool and receive the pool's capital to generate yield. This yield
          can counterbalance the variable interest rates of your loan.
        </p>
        <p>
          For example, if you borrow 1,000 DAI at a variable rate of 4% and take
          a Short position on Hyperdrive at a fixed rate of 2.5%, the profits
          from lending at Hyperdrive can help mitigate the effects of rising
          variable rates.
        </p>
      </div>
    ),
  },
  {
    key: "faq3",
    question: "Can you provide an example of Fixed Rate Borrow in action?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          Sure! Let's say Francine is borrowing 1,000 DAI at a variable rate of
          4%. To hedge against rate increases, she takes a Short position on
          Hyperdrive at a fixed rate of 2.5%.
        </p>
        <p>
          If the variable rate rises to 8%, Francine would pay 80 DAI for her
          loan, but she would earn 75 DAI from Hyperdrive, resulting in total
          borrow costs of 30 DAI (3.0%). This hedging reduces the impact of
          variable rate increases.
        </p>
      </div>
    ),
  },
  {
    key: "faq4",
    question: "What happens if the variable borrow rate decreases?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          If the variable borrow rate decreases, the hedge might perform worse
          than the variable borrow rate alone. For instance, if the rate drops
          to 2%, Francine would pay 20 DAI for her loan and earn 5 DAI from
          Hyperdrive, resulting in a total cost of 40 DAI (4.0%).
        </p>
        <p>
          Despite this, the hedged position provides predictability and caps the
          maximum borrowing cost.
        </p>
      </div>
    ),
  },
  {
    key: "faq5",
    question: "What are the benefits of hedging with Hyperdrive?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          Hedging with Hyperdrive offers predictability in borrowing costs,
          capping the downside risk of variable interest rate loans.
        </p>
        <p>
          It allows borrowers to manage their financial exposure more
          effectively, ensuring that even if variable rates spike, the total
          borrowing costs remain controlled.
        </p>
      </div>
    ),
  },
  {
    key: "faq6",
    question: "Are there any fees associated with Fixed Rate Borrow?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          Yes, trading fees are applied when opening or closing Short positions.
          These fees include a dynamic Curve Fee and a Flat Fee proportional to
          the position size.
        </p>
        <p>
          For detailed information on fees, you can refer to the{" "}
          <a
            className="daisy-link"
            rel="noreferrer"
            target="_blank"
            href="https://docs-delv.gitbook.io/hyperdrive/trading/fees"
          >
            Fees
          </a>{" "}
          section of our documentation.
        </p>
      </div>
    ),
  },
]
