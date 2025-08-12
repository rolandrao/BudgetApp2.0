import type { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function openDatabase() {
  return open({
    filename: 'data/transactions.db',
    driver: sqlite3.Database,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body;

  const question = messages[messages.length - 1]?.text || '';

  // 1. Ask LLM to generate SQL
  let gasInstructions = '';
  if (
    /gas|sunoco|shell|exxon|bp|mobil|citgo|chevron|phillips 66|speedway|marathon/i.test(
      question
    )
  ) {
    gasInstructions = `
- If a user asks about "Gas", interpret it as follows:
  - The 'Category' column contains values like 'Transportation', not 'Gas'.
  - To find gas purchases, look for transactions where Category = 'Transportation' AND the Notes column contains the name of a gas station.
  - Common gas station names include: 'SUNOCO', 'SHELL', 'EXXON', 'BP', 'MOBIL', 'CITGO', 'CHEVRON', 'PHILLIPS 66', 'SPEEDWAY', 'MARATHON'.
  - Use the SQL LIKE operator to match these names in the Notes column.
  - For example, to find all gas purchases in 2023:
    SELECT Roommate, SUM(Amount) as TotalSpend
    FROM transactions
    WHERE Category = 'Transportation'
      AND (
        Notes LIKE '%SUNOCO%' OR
        Notes LIKE '%SHELL%' OR
        Notes LIKE '%EXXON%' OR
        Notes LIKE '%BP%' OR
        Notes LIKE '%MOBIL%' OR
        Notes LIKE '%CITGO%' OR
        Notes LIKE '%CHEVRON%' OR
        Notes LIKE '%PHILLIPS 66%' OR
        Notes LIKE '%SPEEDWAY%' OR
        Notes LIKE '%MARATHON%' OR
        Notes LIKE '%Gas%'
      )
      AND strftime('%Y', Timestamp) = '2023'
    GROUP BY Roommate
    ORDER BY TotalSpend DESC;
`;
  }
  console.log("%%%%%%%%%%%%%%%");
  console.log(messages);
  console.log("%%%%%%%%%%%%%%%");
  const conversation = messages.map((m: { sender: string; text: any; }) => `${m.sender === 'user' ? 'User' : 'Assitant'}: ${m.text}`).join('\n');

  const sqlPrompt = `
You are an assistant that translates questions about a transactions database into SQL queries.

The table is called 'transactions' and has columns: id, Timestamp, Amount, Category, Shared, Roommate, Notes.
The Timestamp column is in ISO format (YYYY-MM-DD HH:MM:SS).
To extract the month or year from Timestamp in SQLite, use strftime('%m', Timestamp) for month and strftime('%Y', Timestamp) for year.
- Only return a SQL query, with no explanation or extra characters.
- DO NOT use the EXTRACT, YEAR, or MONTH functions.
- Do NOT include any Markdown formatting or code block tags (such as \`\`\`sql or \`\`\`).
${gasInstructions}

Conversation so far:
${conversation}

Based on the conversation, generate the appropriate SQL query for the latest user question.
SQL query:
`;

console.log("!!!!!!!!!!!!!!!!!!");
console.log(sqlPrompt);
console.log("!!!!!!!!!!!!!!!!!!");

  const sqlRes = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral',
      prompt: sqlPrompt,
      stream: false,
    }),
  });
  const sqlData = await sqlRes.json();
  const sqlQuery = sqlData.response.split(';')[0] + ';'; // crude extraction
  console.log("#####################");
  console.log(sqlQuery);
  console.log("#####################");

  // 2. Run the SQL query
  let result;
  try {
    const db = await openDatabase();
    result = await db.all(sqlQuery);
    console.log("@@@@@@@@@@@@@@@");
    console.log(result);
    console.log("@@@@@@@@@@@@@@@");
  } catch (e) {
    return res.status(400).json({ answer: `SQL Error: ${e}` });
  }

  // 3. (Optional) Ask LLM to explain the result
  const explainPrompt = `
User question: "${question}"
SQL query: ${sqlQuery}
SQL result: ${JSON.stringify(result)}
Answer in natural language:
`;

  const explainRes = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral',
      prompt: explainPrompt,
      stream: false,
    }),
  });
  const explainData = await explainRes.json();

  res.status(200).json({ answer: explainData.response, sql: sqlQuery, raw: result });
}