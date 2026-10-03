export const finance = {
  repositoryUrl: 'https://github.com/JTKC00/Personal-Finance-Manager',
  features: [
    {
      name: 'Transactions',
      title: 'Keep the details together.',
      description: 'Add, edit, duplicate and search income and expenses. Filter by date, category, merchant, account, payment method or currency.',
    },
    {
      name: 'Budgets',
      title: 'Give each month a plan.',
      description: 'Set HKD category limits, revisit previous months and copy last month’s settings. See spending already recorded alongside upcoming commitments.',
    },
    {
      name: 'Analysis',
      title: 'See where your money goes.',
      description: 'Review monthly, yearly or custom periods, compare spending and explore category, merchant, payment and account breakdowns.',
    },
    {
      name: 'Savings goals',
      title: 'Follow your progress.',
      description: 'Track a goal through deposit records or a linked account balance. Keep the recorded contributions behind your progress in view.',
    },
    {
      name: 'Subscriptions',
      title: 'Keep recurring costs visible.',
      description: 'Track recurring expenses, next payment dates and trial end dates, with reminders shown in the app.',
    },
    {
      name: 'Accounts & transfers',
      title: 'Know which account it belongs to.',
      description: 'Organise cash, bank, wallet and credit-card accounts, and record transfers between accounts. Each account has its own base currency.',
    },
  ],
  receiptSteps: [
    { title: 'Capture a receipt', description: 'Take a photo or choose a receipt image while signed in.' },
    { title: 'Check the suggestions', description: 'Review the suggested amount, merchant, date, category and payment details. Unclear fields need your confirmation.' },
    { title: 'Confirm the transaction', description: 'Correct the details and save the transaction to your records.' },
  ],
} as const
