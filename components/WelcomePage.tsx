import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FavouriteLink, FavouriteFolder } from '../types';
import { 
    PlusIcon, FolderIcon, TrashIcon, PencilIcon, CloseIcon, ChevronDownIcon, 
    InstagramIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon, ClipboardIcon 
} from './Icons';

// --- Add/Edit Link Modal Component ---
interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Omit<FavouriteLink, 'id'> & { id?: string }) => void;
  folders: FavouriteFolder[];
  linkToEdit: FavouriteLink | null;
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose, onSave, folders, linkToEdit }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(linkToEdit?.title || '');
      setUrl(linkToEdit?.url || '');
      setDescription(linkToEdit?.description || '');
      setFolderId(linkToEdit?.folderId || null);
      setInstagramUrl(linkToEdit?.instagramUrl || '');
    }
  }, [linkToEdit, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFolderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: linkToEdit?.id,
      title,
      url,
      description,
      folderId,
      instagramUrl,
    });
    onClose();
  };
  
  const selectedFolderName = folders.find(f => f.id === folderId)?.name || 'No Folder';

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700/50">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700/50">
          <h2 className="text-xl font-bold">{linkToEdit ? 'Edit Page' : 'Add New Page'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close modal"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
              <input type="url" id="url" value={url} onChange={(e) => setUrl(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label htmlFor="instagram-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram Video URL <span className="text-gray-400">(Optional)</span></label>
              <input type="url" id="instagram-url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Folder</label>
                <div className="relative" ref={dropdownRef}>
                <button 
                  type="button" 
                  onClick={() => setIsFolderDropdownOpen(!isFolderDropdownOpen)}
                  className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-slate-600"
                >
                  <span className="text-gray-900 dark:text-gray-100">{selectedFolderName}</span>
                  <ChevronDownIcon />
                </button>
                {isFolderDropdownOpen && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-auto">
                    <div 
                      onClick={() => { setFolderId(null); setIsFolderDropdownOpen(false); }}
                      className={`px-3 py-2 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 ${folderId === null ? 'bg-sky-600 text-white hover:bg-sky-700' : ''}`}
                    >
                      No Folder
                    </div>
                    {folders.map(folder => (
                      <div 
                        key={folder.id} 
                        onClick={() => { setFolderId(folder.id); setIsFolderDropdownOpen(false); }}
                        className={`px-3 py-2 cursor-pointer text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 ${folderId === folder.id ? 'bg-sky-600 text-white hover:bg-sky-700' : ''}`}
                      >
                        {folder.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50 text-right rounded-b-2xl">
            <button type="submit" className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">Save Page</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Add New Folder Modal Component ---
interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const AddFolderModal: React.FC<AddFolderModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName(''); // Reset for next time
      onClose();
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700/50">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700/50">
          <h2 className="text-xl font-bold">Add New Folder</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close modal"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label htmlFor="new-folder-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Folder Name</label>
            <input 
              type="text" 
              id="new-folder-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" 
              autoFocus
            />
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50 text-right rounded-b-2xl">
            <button type="submit" className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">Create Folder</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Edit Folder Modal Component ---
interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderId: string, updatedValues: Partial<FavouriteFolder>) => void;
  folder: FavouriteFolder | null;
}

const FOLDER_COLORS = ['rose-500', 'slate-500', 'emerald-500', 'sky-500', 'indigo-500', 'purple-500'];

const EditFolderModal: React.FC<EditFolderModalProps> = ({ isOpen, onClose, onSave, folder }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setColor(folder.color);
    }
  }, [folder]);

  if (!isOpen || !folder) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(folder.id, { name, color });
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700/50">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700/50">
          <h2 className="text-xl font-bold">Edit Folder</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close modal"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Folder Name</label>
              <input type="text" id="folder-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Folder Color</label>
              <div className="flex items-center gap-3">
                {FOLDER_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full bg-${c} transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-blue-500' : ''}`}
                    aria-label={`Set color to ${c}`}
                  ></button>
                ))}
                <button
                    type="button"
                    onClick={() => setColor(undefined)}
                    className={`w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white transition-transform hover:scale-110 ${!color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-blue-500' : ''}`}
                    aria-label="Set default color"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50 text-right rounded-b-2xl">
            <button type="submit" className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 transition-colors">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Link Card Component ---
interface LinkCardProps {
  link: FavouriteLink;
  onEdit: (link: FavouriteLink) => void;
  onRemove: (linkId: string) => void;
  viewMode: 'grid' | 'list';
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onEdit, onRemove, viewMode }) => {
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(link.url);
        // Could add a toast notification here
    };

    if (viewMode === 'list') {
        return (
            <div className="group relative flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700/50 transition-all duration-200">
                 <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 flex-grow min-w-0">
                    <img 
                        src={`https://www.google.com/s2/favicons?sz=64&domain_url=${link.url}`} 
                        alt={`${link.title} favicon`}
                        className="w-8 h-8 object-contain shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">{link.title}</h3>
                        {link.description && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{link.description}</p>}
                    </div>
                 </a>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                     <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Copy Link"><ClipboardIcon className="h-4 w-4"/></button>
                     {link.instagramUrl && (
                        <a href={link.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><InstagramIcon /></a>
                     )}
                     <button onClick={() => onEdit(link)} className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"><PencilIcon /></button>
                     <button onClick={() => onRemove(link.id)} className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 dark:text-rose-400"><TrashIcon /></button>
                 </div>
            </div>
        );
    }

    return (
        <div className="group relative p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700/50 h-full flex flex-col">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="block flex-grow">
            <div className="flex items-center gap-3 mb-2">
                <img 
                    src={`https://www.google.com/s2/favicons?sz=64&domain_url=${link.url}`} 
                    alt={`${link.title} favicon`}
                    className="w-6 h-6 object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{link.title}</h3>
            </div>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{link.description}</p>
            </a>
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-gray-800/90 p-1 rounded-lg shadow-sm backdrop-blur-sm">
                <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Copy Link"><ClipboardIcon className="h-4 w-4"/></button>
                {link.instagramUrl && (
                <a href={link.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600" aria-label="View Instagram video">
                    <InstagramIcon />
                </a>
                )}
                <button onClick={() => onEdit(link)} className="p-1.5 rounded-md bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-600" aria-label="Edit link"><PencilIcon/></button>
                <button onClick={() => onRemove(link.id)} className="p-1.5 rounded-md bg-gray-200/50 dark:bg-gray-700/50 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 dark:text-rose-400" aria-label="Delete link"><TrashIcon/></button>
            </div>
        </div>
    );
};

// --- Main PowerfulWebSitesPage Component ---
interface PowerfulWebSitesPageProps {
  links: FavouriteLink[];
  folders: FavouriteFolder[];
  onAddOrUpdateLink: (link: Omit<FavouriteLink, 'id'> & { id?: string }) => void;
  onRemoveLink: (linkId: string) => void;
  onAddFolder: (name: string) => void;
  onUpdateFolder: (folderId: string, updatedValues: Partial<FavouriteFolder>) => void;
  onRemoveFolder: (folderId: string) => void;
}

const PowerfulWebSitesPage: React.FC<PowerfulWebSitesPageProps> = ({ links, folders, onAddOrUpdateLink, onRemoveLink, onAddFolder, onUpdateFolder, onRemoveFolder }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<FavouriteLink | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<FavouriteFolder | null>(null);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'az' | 'za' | 'newest'>('az');

  const handleAddFolderClick = () => {
    setIsAddFolderModalOpen(true);
  };

  const handleOpenModalToAdd = () => {
    setLinkToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleOpenModalToEdit = (link: FavouriteLink) => {
    setLinkToEdit(link);
    setIsModalOpen(true);
  };
  
  const handleOpenFolderModalToEdit = (folder: FavouriteFolder) => {
    setFolderToEdit(folder);
    setIsFolderModalOpen(true);
  };

  const handleRemoveFolderClick = (folderId: string, folderName: string) => {
    if (window.confirm(`Are you sure you want to delete the "${folderName}" folder? Links inside will become ungrouped.`)) {
      onRemoveFolder(folderId);
    }
  };
  
  const filteredLinks = useMemo(() => {
      let result = links.filter(l => 
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.url.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (sortBy === 'az') {
          result.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'za') {
          result.sort((a, b) => b.title.localeCompare(a.title));
      } else if (sortBy === 'newest') {
          // Assuming ID is roughly chronological or add a createdAt field
          result.reverse(); 
      }
      
      return result;
  }, [links, searchQuery, sortBy]);

  // Group filtered links
  const groupedLinks = useMemo(() => {
      const grouped: { folder: FavouriteFolder | null, links: FavouriteLink[] }[] = [];
      
      // Only show folders if search query is empty, otherwise just show results
      if (searchQuery) {
          grouped.push({ folder: null, links: filteredLinks });
          return grouped;
      }

      folders.forEach(folder => {
          const folderLinks = filteredLinks.filter(l => l.folderId === folder.id);
          if (folderLinks.length > 0) {
              grouped.push({ folder, links: folderLinks });
          }
      });
      
      const ungrouped = filteredLinks.filter(l => !l.folderId);
      if (ungrouped.length > 0) {
          grouped.push({ folder: null, links: ungrouped });
      }
      
      // If there are empty folders but no search, show them too? 
      // Current logic hides empty folders, let's keep it clean.
      // To show empty folders we'd iterate all folders regardless of links.
      const emptyFolders = folders.filter(f => !filteredLinks.some(l => l.folderId === f.id));
      emptyFolders.forEach(f => {
          grouped.push({ folder: f, links: [] });
      });

      // Sort folders A-Z always? or preserve creation order?
      // Let's just keep creation order for now.
      
      return grouped;
  }, [filteredLinks, folders, searchQuery]);


  return (
    <div className="w-full">
        {/* Hidden classes for dynamic colors */}
        <span className="hidden bg-rose-500 bg-slate-500 bg-emerald-500 bg-sky-500 bg-indigo-500 bg-purple-500 text-rose-500 text-slate-500 text-emerald-500 text-sky-500 text-indigo-500 text-purple-500"></span>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Powerful Web Sites</h2>
            <p className="text-gray-500 dark:text-gray-400">Your curated collection of essential tools.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-slate-500 outline-none w-full sm:w-64"
                />
             </div>
             <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}><Squares2X2Icon className="h-4 w-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}><ListBulletIcon className="h-4 w-4" /></button>
             </div>
             <button onClick={handleAddFolderClick} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-100 transition-colors text-sm font-medium">
               <FolderIcon className="h-4 w-4" />
               <span className="hidden sm:inline">Add Folder</span>
             </button>
             <button onClick={handleOpenModalToAdd} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white hover:bg-slate-700 rounded-lg shadow-md transition-colors text-sm font-semibold">
               <PlusIcon />
               <span className="hidden sm:inline">Add Page</span>
             </button>
          </div>
        </div>

        {groupedLinks.length === 0 && (
             <div className="text-center py-20 text-gray-400">
                 <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="h-8 w-8" />
                 </div>
                 <h3 className="text-lg font-medium">No sites found</h3>
                 <p>Try adjusting your search or add a new page.</p>
             </div>
        )}

        {groupedLinks.map((group, idx) => (
            <div key={group.folder ? group.folder.id : 'ungrouped'} className="mb-8 animate-fade-in">
                {/* Folder Header (only if not searching, or if searching but we want to separate context - simplifying to: only header if folder exists) */}
                {!searchQuery && group.folder && (
                     <div className="flex items-center gap-3 mb-4 border-b border-gray-200 dark:border-gray-700/50 pb-2 group">
                        <FolderIcon className={`h-6 w-6 ${group.folder.color ? `text-${group.folder.color}` : 'text-slate-500'}`} />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{group.folder.name}</h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenFolderModalToEdit(group.folder!)} className="p-1 rounded-md text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600"><PencilIcon /></button>
                            <button onClick={() => handleRemoveFolderClick(group.folder!.id, group.folder!.name)} className="p-1 rounded-md text-gray-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-500"><TrashIcon /></button>
                        </div>
                        <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{group.links.length}</span>
                    </div>
                )}
                {/* Fallback header for ungrouped items if folders exist */}
                {!searchQuery && !group.folder && folders.length > 0 && group.links.length > 0 && (
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-200 dark:border-gray-700/50 pb-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Other Pages</h3>
                        <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{group.links.length}</span>
                    </div>
                )}

                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {group.links.map(link => (
                        <LinkCard key={link.id} link={link} onEdit={handleOpenModalToEdit} onRemove={onRemoveLink} viewMode={viewMode} />
                    ))}
                </div>
                {group.links.length === 0 && group.folder && !searchQuery && (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500">This folder is empty.</p>
                    </div>
                )}
            </div>
        ))}

      <AddLinkModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddOrUpdateLink}
        folders={folders}
        linkToEdit={linkToEdit}
      />
      <EditFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSave={onUpdateFolder}
        folder={folderToEdit}
      />
      <AddFolderModal
        isOpen={isAddFolderModalOpen}
        onClose={() => setIsAddFolderModalOpen(false)}
        onSave={onAddFolder}
      />
    </div>
  );
};

export default PowerfulWebSitesPage;