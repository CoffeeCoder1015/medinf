# Medicine Information Application

A comprehensive medicine information application that helps users identify medications, understand drug interactions, and find alternative medications.

## Features

- **Drug Identification**: Search by name, NDC number, or upload a photo
- **FDA Integration**: Real-time drug information from FDA databases
- **AI Analysis**: Comprehensive safety analysis including contradictions, interactions, and warnings
- **Drug Substitutes**: Find alternative medications and generic equivalents
- **Interactive Chat**: Ask questions about your medications using AI

## Drug Substitutes Inference Endpoint

The application supports integration with external ML inference services for finding drug substitutes:

### Supported Platforms

1. **Google Vertex AI**
2. **Amazon SageMaker**
3. **Generic REST API**

### Configuration

Set the following environment variables to connect your inference endpoint:

#### Common Variables
\`\`\`bash
INFERENCE_ENDPOINT_URL=https://your-endpoint-url.com
INFERENCE_ENDPOINT_TYPE=vertex-ai|sagemaker|local
INFERENCE_API_KEY=your-api-key
\`\`\`

#### Google Vertex AI
\`\`\`bash
INFERENCE_ENDPOINT_TYPE=vertex-ai
VERTEX_AI_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1
INFERENCE_ENDPOINT_URL=https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/endpoints/YOUR_ENDPOINT:predict
INFERENCE_API_KEY=your-gcp-access-token
\`\`\`

#### Amazon SageMaker
\`\`\`bash
INFERENCE_ENDPOINT_TYPE=sagemaker
SAGEMAKER_ENDPOINT_NAME=your-endpoint-name
AWS_REGION=us-east-1
INFERENCE_ENDPOINT_URL=https://runtime.sagemaker.us-east-1.amazonaws.com/endpoints/YOUR_ENDPOINT/invocations
INFERENCE_API_KEY=your-aws-credentials
\`\`\`

### API Request Format

The inference endpoint receives requests in the following format:

\`\`\`json
{
  "drugs": [
    {
      "name": "Tylenol",
      "generic_name": "Acetaminophen",
      "ndc": "50580-0506-01",
      "dosage_form": "Tablet",
      "strength": "500mg"
    }
  ],
  "patient_context": {
    "age": 45,
    "conditions": ["hypertension"],
    "allergies": ["penicillin"]
  }
}
\`\`\`

### Expected Response Format

Your inference endpoint should return:

\`\`\`json
{
  "recommendations": [
    {
      "originalDrug": { /* drug object */ },
      "substitutes": [
        {
          "id": "sub-1",
          "name": "Generic Acetaminophen",
          "genericName": "Acetaminophen",
          "ndcNumber": "00000-0000-00",
          "manufacturer": "Generic Manufacturer",
          "dosageForm": "Tablet",
          "strength": "500mg",
          "reason": "Lower cost generic alternative",
          "costComparison": "lower",
          "availability": "widely-available"
        }
      ],
      "reasoning": "Found 2 potential substitutes...",
      "warnings": ["Always consult your healthcare provider..."]
    }
  ],
  "modelVersion": "v1.0",
  "confidence": 0.85
}
\`\`\`

### Development Mode

When no inference endpoint is configured (`INFERENCE_ENDPOINT_TYPE=local` or no URL provided), the application uses mock data for development and testing.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables (optional for basic functionality)

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- FDA openFDA API
- AI SDK for chat and analysis

## Disclaimer

This application provides general information only. Always consult your healthcare provider for medical advice, diagnosis, or treatment decisions.
