import {END, START, StateGraph, Annotation} from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
    // 1. It allows to know on which node we are
    // 2. We can use a state to know the value inside of it
    currentNode: Annotation<string>({
        default:()=>"",
        reducer:(previousVal,nextVal) => previousVal?previousVal:nextVal,
    })
});