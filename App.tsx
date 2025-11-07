import React, { useState, useCallback } from 'react';
import { editImageWithGemini } from './services/geminiService';

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const Loader: React.FC = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400"></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-400" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

const App: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('Image size should be less than 4MB.');
        return;
      }
      setOriginalImageFile(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setEditedImageUrl(null);
      setError(null);
    }
  };
  
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!originalImageFile) {
      setError('Please upload an image first.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const resultUrl = await editImageWithGemini(originalImageFile, prompt);
      setEditedImageUrl(resultUrl);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, prompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            Gemini Image Editor
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Describe your edits in plain English and let AI do the magic.
          </p>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Column */}
            <div className="space-y-6 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
              <div>
                <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
                  1. Upload Your Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                    <div className="flex text-sm text-gray-400">
                      <label htmlFor="image-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 4MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
                  2. Describe Your Edit
                </label>
                <div className="mt-1">
                  <textarea
                    id="prompt"
                    name="prompt"
                    rows={4}
                    className="block w-full shadow-sm sm:text-sm bg-gray-900 border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                    placeholder="e.g., Add a retro filter, make it look like a watercolor painting..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !originalImageFile}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <Loader /> : 'Generate Image'}
              </button>
            </div>

            {/* Output Column */}
            <div className="grid grid-cols-1 gap-8 content-start">
               <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                <h3 className="font-semibold text-center text-gray-300 mb-4">Original Image</h3>
                <div className="aspect-square w-full bg-gray-900/50 rounded-lg flex items-center justify-center overflow-hidden">
                  {originalImageUrl ? (
                    <img src={originalImageUrl} alt="Original upload" className="object-contain h-full w-full" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <UploadIcon className="mx-auto h-12 w-12" />
                      <p>Your image will appear here</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                <h3 className="font-semibold text-center text-gray-300 mb-4">Edited Image</h3>
                <div className="aspect-square w-full bg-gray-900/50 rounded-lg flex items-center justify-center overflow-hidden relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center z-10">
                      <Loader />
                      <p className="mt-2 text-sm text-gray-400">Editing your image...</p>
                    </div>
                  )}
                  {editedImageUrl ? (
                    <img src={editedImageUrl} alt="AI Edited" className="object-contain h-full w-full" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <SparklesIcon className="mx-auto h-12 w-12" />
                      <p>Your edited image will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
