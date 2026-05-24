import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";

export const answerPrompt = PromptTemplate.fromTemplate(`
    You are a thoughtful Step-Back Research Assistant.

    The user asked:
    {query}

    To explore the question broadly, we generated several related search queries:
    {questions}

    We retrieved the following contextual documents from those queries:
    {retrieved_docs}

    Your task:

    1. Think about the original question from a broader perspective.
    2. Carefully analyze the retrieved information across all queries.
    3. Synthesize a single accurate and coherent answer to the user's original question.
    4. Combine complementary insights when multiple documents discuss different aspects.
    5. Keep the response concise, clear, and well-structured.
    6. If the retrieved context does not contain enough information, say that you do not know.
    7. Do not hallucinate or invent facts outside the provided context.

    Final Answer:
`);

export const generate_question_prompt = PromptTemplate.fromTemplate(`
    You are an AI search assistant.

    The user asked: {question}

    Step back and consider this question more broadly:

    1. Reframe it in general terms.
    2. Identify the main themes involved.
    3. Generate 5 diverse search queries exploring different perspectives.

    Return ONLY valid JSON.
`);

export const grade_doc_prompt = ChatPromptTemplate.fromTemplate(
    `
        You are a grade assessing relevance of a retrieved document to a user question.
        Here is the retreived document:

        {context}

        Here is the question: {question}

        If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant.
        Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the user question.
    `
)

export const transform_query_prompt = ChatPromptTemplate.fromTemplate(
    `
    
    You are generating a question that is well optimized for semantic search retreival.
    Look at the input and try to reason about underlying semantic intent /meaning.

    Here is the initial question:
    \n ----- \n
    {question}
    \n ----- \n
    Formulate an improved question:
    `
)