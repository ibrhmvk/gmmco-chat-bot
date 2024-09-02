import { ContextChatEngine, Settings } from "llamaindex";
import { getDataSource } from "./index";
import { generateFilters } from "./queryFilter";

export async function createChatEngine(documentIds?: string[], params?: any) {

  const userDataString = localStorage.getItem("user_data");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const index = await getDataSource(params);
  if (!index) {
    throw new Error(
      `StorageContext is empty - call 'npm run generate' to generate the storage first`,
    );
  }
  const retriever = index.asRetriever({
    similarityTopK: process.env.TOP_K ? parseInt(process.env.TOP_K) : undefined,
    filters: generateFilters(documentIds || []),
  });
const group = userData.group === "other" ? "other group": "GDK11 group";
  return new ContextChatEngine({
    chatModel: Settings.llm,
    retriever,
    systemPrompt:
      `You are a helpful assistant named Sara, dedicated to answering all questions related to GMMCO. The user is a ${group} employee. When the user inquires about the CEO of GMMCO, Chandrashekar(https://www.gmmco.in/images/chandrashekar-v.jpg), or the CFO, Manikandan Ganesan(https://www.gmmco.in/images/manikandan-g.jpg), display the corresponding image of the person (use the image URLs provided) alongside relevant information. Ensure that responses are comprehensive and presented in paragraph form, providing contextually relevant information.`,
  });
}
