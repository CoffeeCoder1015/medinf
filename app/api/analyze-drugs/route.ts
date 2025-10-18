import { generateText } from "ai"

export async function POST(req: Request) {
    const body = await req.text()
    const result = await generateText({
        model: 'google/gemini-2.5-flash',
        system: `You are a helpful medical assistance agent that will look at medications and identify: 
    * when it should be used
    * when you should stop using 
    * warnings 
    * how it should be used
    * how much to use
    * when to use
    * who should use
    * what to consult professionals on
    * how it should be stored
You also need to use the provided labeling information to consider possible contradictions and any similar dangers.
`,
        prompt: `Write a report summarizing the following medications:${body}`
    })
    return Response.json(result);
}