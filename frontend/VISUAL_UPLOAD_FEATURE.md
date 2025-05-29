# Visual Upload Feature for AOP Chat Builder

## Overview
The AOP (Automated Operations Procedure) chat builder now supports uploading images and videos to provide visual context when creating workflows. This feature leverages GPT-4 vision capabilities to analyze screenshots, screen recordings, and other visual content to automatically generate appropriate automation workflows.

## Features

### File Upload Support
- **Image formats**: JPEG, PNG, GIF, WebP, and other common image formats
- **Video formats**: MP4, WebM, AVI, MOV, and other common video formats
- **Multiple files**: Support for uploading multiple files at once
- **File preview**: Visual preview of uploaded files before sending

### Visual Analysis Capabilities
When you upload visual content, the system will:
1. Analyze UI elements, forms, screens, and workflows shown in the images
2. Identify tools, systems, or applications visible in the visuals
3. Extract text, labels, and data fields from the images
4. Understand the sequence of steps or actions demonstrated
5. Map visual elements to appropriate data sources and automated actions

### How to Use

1. **Upload Files**: Click the paperclip icon next to the text input to select images or videos from your device
2. **Preview**: Uploaded files will appear as thumbnails above the input field
3. **Remove Files**: Hover over a thumbnail and click the X button to remove a file
4. **Add Context**: Optionally type a message to provide additional context about the visuals
5. **Send**: Click the Send button to analyze the visuals and generate an AOP

### Example Use Cases

- **Screenshot of a manual process**: Upload screenshots showing the steps of a manual process you want to automate
- **Screen recording of a workflow**: Record your screen while performing a task and upload the video
- **Application interfaces**: Capture images of forms, dashboards, or tools that need to be integrated
- **Process diagrams**: Upload workflow diagrams or flowcharts to convert them into automated procedures

### Technical Implementation

The feature uses:
- **Frontend**: React with file upload handling and preview capabilities
- **Vision Model**: GPT-4o with vision capabilities for image analysis
- **Base64 Encoding**: Images are converted to base64 for API transmission
- **Video Handling**: Videos are noted in the context (direct video analysis may require frame extraction)

### API Configuration

To enable the vision capabilities, ensure your OpenAI API key is configured:
```env
VITE_OPENAI_API_KEY=your-api-key-here
```

### Limitations

- Large files may take longer to process
- Video analysis is limited to context description (consider extracting key frames)
- Complex workflows may require additional text description for accuracy
- API rate limits apply for vision model usage

## Future Enhancements

- Frame extraction from videos for better analysis
- Support for PDF and document uploads
- OCR capabilities for text extraction
- Drawing/annotation tools for highlighting specific areas
- Batch processing for multiple workflow creation 