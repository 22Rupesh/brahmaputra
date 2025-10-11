import React, { useRef, useState, useEffect, useCallback } from 'react';
import { UserProfile, FileItem } from '../../types';
import { supabase } from '../../lib/supabaseClient';


interface FilesPageProps {
  currentUser: UserProfile;
}

const FileIcon = ({ type, size = 'large' }: { type: string, size?: 'small' | 'large' }) => {
  const iconSize = size === 'large' ? 'h-12 w-12' : 'h-8 w-8';
  let finalType = 'file';
  if (type.startsWith('image/')) finalType = 'img';
  if (type === 'application/pdf') finalType = 'pdf';
  if (type.includes('word')) finalType = 'doc';
  if (type.includes('excel') || type.includes('spreadsheet')) finalType = 'xls';
  if (type.includes('presentation') || type.includes('powerpoint')) finalType = 'ppt';

  const iconMap: { [key: string]: React.ReactElement } = {
    folder: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-yellow-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    pdf: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>,
    doc: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    xls: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5l4 4v10a2 2 0 01-2 2z" /></svg>,
    ppt: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-orange-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>,
    img: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-purple-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    file: <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSize} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  };
  return iconMap[finalType] || iconMap['file'];
};

const FilesPage: React.FC<FilesPageProps> = ({ currentUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ file: FileItem, url: string } | null>(null);


  const isAdmin = currentUser.title.includes('(Admin)');
  const SHARED_RECORDS_PATH = 'shared_project_records';

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from('files').list(SHARED_RECORDS_PATH, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.error("Error fetching files:", error.message);
      if (error.message.includes('not found')) {
        setFiles([]);
      }
    } else {
      setFiles(data.filter(f => f.name !== '.placeholder'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      setUploadingFileName(file.name);
      const { error } = await supabase.storage
        .from('files')
        .upload(`${SHARED_RECORDS_PATH}/${file.name}`, file, { upsert: true });

      setUploading(false);
      setUploadingFileName(null);
      if (error) {
        alert(`Error uploading file: ${error.message}`);
      } else {
        alert('File uploaded successfully!');
        await fetchFiles();
      }
    }
  };

  const handleFileItemClick = async (file: FileItem) => {
      const { data } = supabase.storage.from('files').getPublicUrl(`${SHARED_RECORDS_PATH}/${file.name}`);
      if (data.publicUrl) {
          setPreviewFile({ file, url: data.publicUrl });
      } else {
          alert("Could not generate a preview link for this file.");
      }
  };
  
  const handleDownload = async (fileName: string) => {
    const { data, error } = await supabase.storage.from('files').download(`${SHARED_RECORDS_PATH}/${fileName}`);
      if (error) {
          alert(`Error downloading file: ${error.message}`);
      } else if (data) {
          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      }
  }

  const handleDeleteFile = async (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation(); // Prevent preview when clicking the delete button
    if (window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
        const { error } = await supabase.storage.from('files').remove([`${SHARED_RECORDS_PATH}/${fileName}`]);
        if (error) {
            alert(`Error deleting file: ${error.message}`);
        } else {
            alert('File deleted successfully.');
            setPreviewFile(null); // Close preview if the file was deleted from there
            await fetchFiles();
        }
    }
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const renderFileGrid = () => (
     <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark">Project Records Archive</h2>
          <p className="text-sm text-brand-light">A central repository for completed project records, for audit and improvement purposes.</p>
        </div>
        {isAdmin && (
            <button onClick={handleUploadClick} disabled={uploading} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
            {uploading ? 'Uploading...' : 'Upload Record'}
            </button>
        )}
      </div>
      {loading ? <p>Loading files...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {uploading && (
            <div className="col-span-full bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md flex items-center space-x-3">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading <strong>{uploadingFileName}</strong>... Please wait.</span>
            </div>
          )}

          {files.map((file) => (
            <div 
              key={file.id} 
              onClick={() => handleFileItemClick(file)}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center cursor-pointer hover:shadow-lg transition-shadow relative group"
            >
              {isAdmin && (
                 <button 
                    onClick={(e) => handleDeleteFile(e, file.name)}
                    className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all text-lg font-bold"
                    aria-label={`Delete ${file.name}`}
                    title="Delete file"
                >
                    &times;
                </button>
              )}
              <FileIcon type={file.metadata?.mimetype || ''} />
              <p className="font-semibold text-brand-dark mt-2 text-sm truncate w-full" title={file.name}>{file.name}</p>
              <p className="text-xs text-brand-light mt-1">
                {file.metadata?.size ? formatBytes(file.metadata.size) : 'N/A'}
              </p>
              {file.created_at && <p className="text-xs text-brand-light">Added: {new Date(file.created_at).toLocaleDateString()}</p>}
            </div>
          ))}
          {!loading && files.length === 0 && !uploading && <p className="col-span-full text-center text-gray-500 py-8">No project records found. An administrator can upload files here.</p>}
        </div>
      )}
    </div>
  );

  const renderFilePreview = () => {
    if (!previewFile) return null;

    const { file, url } = previewFile;
    const mimeType = file.metadata?.mimetype || '';
    const canPreview = mimeType.startsWith('image/') || mimeType === 'application/pdf';

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 h-full flex flex-col">
            <div className="flex justify-between items-center border-b pb-4 mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setPreviewFile(null)} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Archive
                    </button>
                    <div className="border-l pl-3">
                       <h3 className="text-xl font-bold text-brand-dark truncate" title={file.name}>{file.name}</h3>
                       <p className="text-xs text-brand-light">{formatBytes(file.metadata?.size || 0)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button onClick={(e) => handleDeleteFile(e, file.name)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Delete</button>
                  )}
                  <button onClick={() => handleDownload(file.name)} className="bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Download</button>
                </div>
            </div>
            <div className="flex-grow min-h-0">
                {canPreview ? (
                     mimeType.startsWith('image/') ? (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-md">
                           <img src={url} alt={file.name} className="max-w-full max-h-full object-contain" />
                        </div>
                    ) : ( // PDF
                        <iframe src={url} title={file.name} className="w-full h-full border-none rounded-md" />
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg p-8">
                       <FileIcon type={mimeType} size="large" />
                       <h4 className="mt-4 text-lg font-semibold text-brand-dark">Preview not available</h4>
                       <p className="text-brand-light mt-1">This file type cannot be displayed in the browser. Please download it to view.</p>
                       <button onClick={() => handleDownload(file.name)} className="mt-6 bg-brand-accent hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Download File</button>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="h-full">
       <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      {previewFile ? renderFilePreview() : renderFileGrid()}
    </div>
  );
};

export default FilesPage;