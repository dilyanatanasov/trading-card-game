# AI-Generated Card Images Integration

## Option 1: Hugging Face Inference API (Free Tier Available)

### Setup
1. Sign up at https://huggingface.co
2. Get your API token from https://huggingface.co/settings/tokens
3. Add to `.env`:
   ```
   HUGGINGFACE_API_TOKEN=your_token_here
   ```

### Example Integration

```typescript
// backend/src/cards/ai-image.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiImageService {
  constructor(private configService: ConfigService) {}

  async generateCardImage(prompt: string): Promise<string> {
    const apiToken = this.configService.get('HUGGINGFACE_API_TOKEN');

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
      {
        inputs: `fantasy trading card art, ${prompt}, detailed, vibrant colors, digital art`,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        responseType: 'arraybuffer',
      }
    );

    // Save image to file storage or cloud (S3, Cloudinary, etc.)
    const base64Image = Buffer.from(response.data).toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return imageUrl;
  }
}
```

## Option 2: DALL-E via OpenAI (Paid)

### Setup
1. Get API key from https://platform.openai.com
2. Add to `.env`:
   ```
   OPENAI_API_KEY=your_key_here
   ```

### Example

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateCardImage(description: string) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Fantasy trading card artwork: ${description}. High quality, detailed digital art, vibrant colors`,
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url;
}
```

## Option 3: Replicate.com (Pay-per-use)

### Setup
1. Sign up at https://replicate.com
2. Get API token
3. Install: `npm install replicate`

### Example

```typescript
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function generateCardImage(prompt: string) {
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt: `fantasy trading card, ${prompt}, detailed artwork, vibrant colors`,
        num_outputs: 1,
      }
    }
  );

  return output[0]; // Returns image URL
}
```

## Option 4: Free Alternative - Pollinations.ai (No API Key Needed!)

### Simple URL-based generation

```typescript
function generateCardImage(description: string): string {
  const encodedPrompt = encodeURIComponent(
    `fantasy trading card, ${description}, digital art, detailed`
  );

  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&nologo=true`;
}

// Example usage in sample-cards.json
{
  "name": "Dragon Warrior",
  "description": "A powerful dragon warrior from the ancient mountains",
  "imageUrl": "https://image.pollinations.ai/prompt/fantasy%20trading%20card%20dragon%20warrior%20detailed%20digital%20art?width=512&height=768&nologo=true",
  "rarity": "legendary",
  "baseValue": 1000,
  "category": "Fantasy"
}
```

## Recommended Approach

For a quick start, use **Pollinations.ai** (Option 4):
- No API key required
- Free
- Simple URL-based generation
- Good quality images

For production with more control, use:
- **Hugging Face** (best free tier)
- **OpenAI DALL-E** (best quality, paid)
- **Replicate** (flexible models, pay-per-use)

## Implementation Steps

1. Choose your AI service
2. Update `sample-cards.json` with AI-generated image URLs
3. Or create a service to generate images when creating cards:

```typescript
// In cards.controller.ts
@Post()
async create(@Body() createCardDto: CreateCardDto) {
  // Generate AI image
  const imageUrl = await this.aiImageService.generateCardImage(
    createCardDto.description
  );

  // Create card with AI-generated image
  return this.cardsService.create({
    ...createCardDto,
    imageUrl,
  });
}
```

## Example: Update sample-cards.json with Pollinations.ai

```json
{
  "name": "Dragon Warrior",
  "description": "A powerful dragon warrior from the ancient mountains",
  "imageUrl": "https://image.pollinations.ai/prompt/fantasy%20dragon%20warrior%20trading%20card%20art%20detailed%20vibrant?width=400&height=600&nologo=true",
  "rarity": "legendary",
  "baseValue": 1000,
  "category": "Fantasy"
}
```

This way each card gets a unique AI-generated image based on its description!
