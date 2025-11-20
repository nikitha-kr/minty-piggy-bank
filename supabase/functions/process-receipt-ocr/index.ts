import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OCRResult {
  vendor: string;
  amount: number;
  category: string;
  date: string;
  rawText?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return new Response(
        JSON.stringify({ 
          error: "No image file provided",
          vendor: "Unknown",
          amount: 0,
          category: "Uncategorized",
          date: new Date().toISOString().split('T')[0]
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Processing image:', imageFile.name, 'size:', imageFile.size);

    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBytes))
    );

    const ocrFormData = new FormData();
    ocrFormData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);
    ocrFormData.append("language", "eng");
    ocrFormData.append("isOverlayRequired", "false");
    ocrFormData.append("detectOrientation", "true");
    ocrFormData.append("scale", "true");
    ocrFormData.append("OCREngine", "2");

    console.log('Calling OCR.space API...');

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: ocrFormData,
    });

    console.log('OCR response status:', ocrResponse.status);

    if (!ocrResponse.ok) {
      console.error('OCR API error:', ocrResponse.statusText);
      return new Response(
        JSON.stringify({
          error: "OCR service unavailable",
          vendor: "Receipt from " + imageFile.name.split('.')[0],
          amount: 0,
          category: "Uncategorized",
          date: new Date().toISOString().split('T')[0]
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const ocrData = await ocrResponse.json();
    console.log('OCR response data:', JSON.stringify(ocrData));

    if (ocrData.IsErroredOnProcessing) {
      console.error('OCR processing error:', ocrData.ErrorMessage);
      return new Response(
        JSON.stringify({
          error: ocrData.ErrorMessage || "OCR processing failed",
          vendor: "Receipt from " + imageFile.name.split('.')[0],
          amount: 0,
          category: "Uncategorized",
          date: new Date().toISOString().split('T')[0]
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
      console.error('No parsed results');
      return new Response(
        JSON.stringify({
          error: "Could not extract text from image",
          vendor: "Receipt from " + imageFile.name.split('.')[0],
          amount: 0,
          category: "Uncategorized",
          date: new Date().toISOString().split('T')[0]
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const text = ocrData.ParsedResults[0].ParsedText;
    console.log('Extracted text:', text);

    const result = extractReceiptData(text, imageFile.name);
    console.log('Final result:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("OCR processing error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to process image",
        vendor: "Unknown",
        amount: 0,
        category: "Uncategorized",
        date: new Date().toISOString().split('T')[0]
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function extractReceiptData(text: string, filename: string): OCRResult {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  let vendor = "Unknown Merchant";
  let amount = 0;
  let date = new Date().toISOString().split('T')[0];
  const category = "Uncategorized";

  const amountRegex = /\$?\s*(\d+[,.]\d{2})\b/g;
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g;
  
  if (lines.length > 0) {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 3 && !line.match(/^[\d\s\$\.,-]+$/)) {
        vendor = line.substring(0, 50);
        break;
      }
    }
  }

  if (vendor === "Unknown Merchant" && filename) {
    vendor = "Receipt from " + filename.split('.')[0];
  }

  const amounts: number[] = [];
  const totalKeywords = ['total', 'amount', 'balance', 'pay', 'due'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const isTotal = totalKeywords.some(keyword => line.includes(keyword));
    
    const matches = lines[i].matchAll(amountRegex);
    for (const match of matches) {
      const numStr = match[1].replace(',', '').replace('.', '.');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) {
        if (isTotal) {
          amounts.unshift(num);
        } else {
          amounts.push(num);
        }
      }
    }
  }

  if (amounts.length > 0) {
    amount = amounts[0];
  }

  for (const line of lines) {
    const dateMatch = line.match(dateRegex);
    if (dateMatch) {
      try {
        let dateStr = dateMatch[0];
        
        if (dateStr.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2}$/)) {
          const parts = dateStr.split(/[\/\-]/);
          dateStr = `${parts[0]}/${parts[1]}/20${parts[2]}`;
        }
        
        const parsedDate = new Date(dateStr);
        const year = parsedDate.getFullYear();
        
        if (!isNaN(parsedDate.getTime()) && year >= 2000 && year <= 2100) {
          date = parsedDate.toISOString().split('T')[0];
          break;
        }
      } catch {
        continue;
      }
    }
  }

  return {
    vendor,
    amount,
    category,
    date,
    rawText: text.substring(0, 200)
  };
}
