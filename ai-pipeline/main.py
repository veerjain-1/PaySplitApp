from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import re

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

# In a real app, this would initialize LangChain, load Hugging Face NER pipelines, 
# and use scikit-learn/ONNX models for categorization.
def mock_langchain_ner_pipeline(text: str):
    # Simulated simple parsing logic
    items = []
    total = 0.0
    
    # Try to find prices in the text (e.g. $12.99 or 12.99)
    lines = text.split('\n')
    for line in lines:
        if not line.strip(): continue
        
        # Super basic regex for a price
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
        note="Parsed using Mock Hugging Face NER Pipeline"
    )

@app.post("/parse", response_model=ReceiptResponse)
async def parse_receipt(request: ReceiptRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Receipt text is required")
        
    result = mock_langchain_ner_pipeline(request.text)
    return result

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "paysplit-ai-pipeline"}
