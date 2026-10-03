export const swiftlocal = {
  downloadUrl: 'https://github.com/JTKC00/SwiftLocal/releases/latest',
  repositoryUrl: 'https://github.com/JTKC00/SwiftLocal',
  workspaces: [
    {
      name: 'PDF',
      headline: 'Make documents work for you.',
      description: 'Read and fill forms, add signature images, organise pages, and merge, split or compress your PDFs.',
      formats: 'Read · Edit · Organise',
    },
    {
      name: 'OCR',
      headline: 'Find the words in your scans.',
      description: 'Turn images and scanned PDFs into text or searchable PDFs, with Traditional Chinese and English recognition.',
      formats: 'Scans → Text · Searchable PDF',
    },
    {
      name: 'Office',
      headline: 'From working file to finished PDF.',
      description: 'Convert Word, Excel and PowerPoint documents to PDF, or turn a PDF into an editable Word document. Layout preservation is best-effort.',
      formats: 'Word · Excel · PowerPoint',
    },
    {
      name: 'Images',
      headline: 'A whole folder, ready to share.',
      description: 'Convert, compress, resize and rotate images, add watermarks, or collect images into a PDF. Process files in batches.',
      formats: 'JPG · PNG · WebP',
    },
    {
      name: 'Media',
      headline: 'The format you need. The size you want.',
      description: 'Convert audio and video, extract an audio track, trim clips, change resolution or bitrate, and create GIFs.',
      formats: 'Audio · Video · GIF',
    },
  ],
} as const
