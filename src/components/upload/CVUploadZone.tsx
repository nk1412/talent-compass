import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { uploadResume, parseResumeWithAI, createCandidate } from '@/lib/api/candidates';
import { useQueryClient } from '@tanstack/react-query';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

export function CVUploadZone() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const extractContentFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const annotations = await page.getAnnotations();
      const items = textContent.items as any[];

      const getLinkForItem = (item: any) => {
        if (!item) return null;
        const x = item.transform[4];
        const y = item.transform[5];

        return annotations.find((ann: any) => {
          if (ann.subtype === 'Link' && ann.url && ann.rect) {
            const [xMin, yMin, xMax, yMax] = ann.rect;
            return (x >= xMin - 2 && x <= xMax + 2 && y >= yMin - 2 && y <= yMax + 2);
          }
          return false;
        });
      };

      let pageText = "";

      for (let j = 0; j < items.length; j++) {
        const currentItem = items[j];
        const nextItem = items[j + 1]; // Look ahead to the next item

        const currentLink = getLinkForItem(currentItem);
        const nextLink = getLinkForItem(nextItem);

        let textPart = currentItem.str;

        if (currentLink) {
          if (!nextLink || nextLink.url !== currentLink.url) {
            textPart += ` (${currentLink.url})`;
          }
        }
        pageText += textPart + (items[j].hasEOL ? "\n" : " ");
      }

      fullText += pageText + "\n";
    }

    return fullText;
  };

  const processFile = async (file: File, fileId: string) => {
    try {
      // Update to uploading status
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'uploading', progress: 20 } : f))
      );

      // Upload the file to storage
      const { path, fileName } = await uploadResume(file);

      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: 50 } : f))
      );

      // Read file content for parsing
      let text = "";
      const fileType = file.type;

      if (fileType === "application/pdf") {
        // Use the PDF helper
        text = await extractContentFromPDF(file);
      } else if (fileType === "text/plain") {
        // Standard text read
        text = await file.text();
      } else {
        console.warn("Word document parsing requires 'mammoth' or server-side parsing.");
        text = "Text extraction for Word documents pending implementation.";
      }

      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'processing', progress: 70 } : f))
      );

      // Parse with AI
      const parsedData = await parseResumeWithAI(text, fileName);

      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: 90 } : f))
      );

      // Create candidate in database
      await createCandidate({
        full_name: parsedData.fullName || 'Unknown',
        email: parsedData.email || `unknown-${Date.now()}@placeholder.com`,
        phone: parsedData.phone,
        location: parsedData.location,
        total_experience: parsedData.totalExperience || 0,
        skills: parsedData.skills || [],
        education: parsedData.education || [],
        employment_history: parsedData.employmentHistory || [],
        resume_file_path: path,
        resume_file_name: fileName,
        parsed_resume_text: text.slice(0, 10000), // Limit text size
        source: parsedData.source || 'CV Upload',
        stage: 'screening',
      });

      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'complete', progress: 100 } : f))
      );

      // Invalidate candidates query to refresh data
      queryClient.invalidateQueries({ queryKey: ['candidates'] });

      toast({
        title: 'CV Processed Successfully',
        description: `${parsedData.fullName || fileName} has been added to candidates.`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Processing failed' }
            : f
        )
      );
      toast({
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'Failed to process CV',
        variant: 'destructive',
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading' as const,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Process each file
    newFiles.forEach((uploadedFile) => {
      processFile(uploadedFile.file, uploadedFile.id);
    });
  }, []);

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  });

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-secondary/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
              isDragActive ? 'bg-primary/20' : 'bg-secondary'
            )}
          >
            <Upload
              className={cn(
                'w-8 h-8 transition-colors',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold">
              {isDragActive ? 'Drop files here' : 'Drag & drop CVs here'}
            </p>
            <p className="text-muted-foreground mt-1">
              or click to browse files
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Supports PDF, DOC, DOCX, TXT • Max 10MB per file
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h3 className="font-heading font-semibold">Uploaded Files</h3>
            {files.map((uploadedFile) => (
              <motion.div
                key={uploadedFile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <File className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <div className="flex items-center gap-2">
                        {uploadedFile.status === 'complete' && (
                          <CheckCircle className="w-5 h-5 text-success" />
                        )}
                        {uploadedFile.status === 'error' && (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                        {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFile(uploadedFile.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Progress value={uploadedFile.progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-24 text-right">
                        {uploadedFile.status === 'uploading' && 'Uploading...'}
                        {uploadedFile.status === 'processing' && 'Processing...'}
                        {uploadedFile.status === 'complete' && 'Complete'}
                        {uploadedFile.status === 'error' && 'Error'}
                      </span>
                    </div>
                    {uploadedFile.error && (
                      <p className="text-xs text-destructive mt-1">{uploadedFile.error}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
