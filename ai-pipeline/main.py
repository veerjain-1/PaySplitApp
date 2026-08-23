from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import re
from openai import OpenAI
import os

client = OpenAI() # Expects OPENAI_API_KEY environment variable

app = FastAPI(title="PaySplit AI Receipt Parser")

class ReceiptRequest(BaseModel):
    text: str

class ParsedItem(BaseModel):
    name: str
    cost: float

class ReceiptResponse(BaseModel):
    items: list[ParsedItem]
    total: float
    note: str

def parse_receipt_with_llm(text: str) -> ReceiptResponse:
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise receipt parser. Extract all line items, their individual costs, and the final total from the provided receipt text. Do not include tax as a line item if it's separated at the bottom, just get the purchased items and the grand total."
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            response_format=ReceiptResponse,
        )
        return completion.choices[0].message.parsed
    except Exception as e:
        # Fallback to mock parser if OpenAI fails (e.g. no API key)
        print(f"OpenAI parsing failed: {e}")
        return mock_langchain_ner_pipeline(text)

# Fallback parser for testing without an API key
def mock_langchain_ner_pipeline(text: str):
    items = []
    total = 0.0
    lines = text.split('\n')
    for line in lines:
        if not line.strip(): continue
        match = re.search(r'\$?(\d+\.\d{2})', line)
        if match:
            price = float(match.group(1))
            name = line.replace(match.group(0), '').strip()
            if not name:
                name = "Unknown Item"
            if 'total' in name.lower():
                total = price
            else:
                items.append(ParsedItem(name=name, cost=price))
    if total == 0.0:
        total = sum(item.cost for item in items)
    return ReceiptResponse(
        items=items,
        total=total,
        note="Parsed using Fallback Mock Pipeline (OpenAI unavailable)"
    )

@app.post("/parse", response_model=ReceiptResponse)
async def parse_receipt(request: ReceiptRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Receipt text is required")
        
    result = parse_receipt_with_llm(request.text)
    return result

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "paysplit-ai-pipeline"}
