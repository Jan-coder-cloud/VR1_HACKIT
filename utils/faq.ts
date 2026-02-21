interface faqType {
    question : string,
    answer : string
}

export const faqItems : Array<faqType> = [
  {
    question: "Which savings option is better for long-term goals in India: PPF or FD?",
    answer:
      "PPF is often chosen for long-term goals due to lock-in discipline and tax benefits, while FDs can offer more flexibility with tenure choices. The right mix depends on your liquidity needs and risk comfort.",
  },
  {
    question: "Do I need both life insurance and health insurance?",
    answer:
      "Yes, they solve different problems. Life insurance supports dependents if the earning member is not around, while health insurance helps handle hospitalization and medical costs.",
  },
  {
    question: "Is term insurance enough for most families?",
    answer:
      "For many households, term insurance is a practical base because it gives higher cover at lower cost. You can then add savings and investment products separately based on goals.",
  },
  {
    question: "How can I start savings if my monthly income is limited?",
    answer:
      "Start small with automated monthly contributions, focus on emergency fund first, and then allocate toward goal-based instruments such as recurring deposits, SIPs, or government-backed schemes.",
  },
  {
    question: "Can government schemes be combined with private insurance plans?",
    answer:
      "In many cases, yes. Government schemes can provide basic coverage, while private plans may offer wider benefits and higher coverage limits.",
  },
];