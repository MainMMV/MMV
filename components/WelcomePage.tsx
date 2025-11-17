import React, { useState, useRef, useEffect } from 'react';
import { FavouriteLink, FavouriteFolder } from '../types';
import { PlusIcon, FolderIcon, TrashIcon, PencilIcon, CloseIcon, ChevronDownIcon, InstagramIcon } from './Icons';

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
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl w-full max-w-lg border border-zinc-200 dark:border-zinc-700/50">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-700/50">
          <h2 className="text-xl font-bold">{linkToEdit ? 'Edit Page' : 'Add New Page'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700" aria-label="Close modal"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">URL</label>
              <input type="url" id="url" value={url} onChange={(e) => setUrl(e.target.value)} required className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
              <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label htmlFor="instagram-url" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Instagram Video URL <span className="text-zinc-400">(Optional)</span></label>
              <input type="url" id="instagram-url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Folder</label>
                <div className="relative" ref={dropdownRef}>
                <button 
                  type="button" 
                  onClick={() => setIsFolderDropdownOpen(!isFolderDropdownOpen)}
                  className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-md p-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-slate-600"
                >
                  <span className="text-zinc-900 dark:text-zinc-100">{selectedFolderName}</span>
                  <ChevronDownIcon />
                </button>
                {isFolderDropdownOpen && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-lg max-h-48 overflow-auto">
                    <div 
                      onClick={() => { setFolderId(null); setIsFolderDropdownOpen(false); }}
                      className={`px-3 py-2 cursor-pointer text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600 ${folderId === null ? 'bg-sky-600 text-white hover:bg-sky-700' : ''}`}
                    >
                      No Folder
                    </div>
                    {folders.map(folder => (
                      <div 
                        key={folder.id} 
                        onClick={() => { setFolderId(folder.id); setIsFolderDropdownOpen(false); }}
                        className={`px-3 py-2 cursor-pointer text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600 ${folderId === folder.id ? 'bg-sky-600 text-white hover:bg-sky-700' : ''}`}
                      >
                        {folder.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700/50 text-right rounded-b-2xl">
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
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-700/50">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-700/50">
          <h2 className="text-xl font-bold">Add New Folder</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700" aria-label="Close modal"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label htmlFor="new-folder-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Folder Name</label>
            <input 
              type="text" 
              id="new-folder-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" 
              autoFocus
            />
          </div>
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700/50 text-right rounded-b-2xl">
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
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl w-full max-w-md border border-zinc-200 dark:border-zinc-700/50">
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-700/50">
          <h2 className="text-xl font-bold">Edit Folder</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700" aria-label="Close modal"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="folder-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Folder Name</label>
              <input type="text" id="folder-name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-600 rounded-md p-2 focus:ring-slate-600 focus:border-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Folder Color</label>
              <div className="flex items-center gap-3">
                {FOLDER_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full bg-${c} transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-800 ring-blue-500' : ''}`}
                    aria-label={`Set color to ${c}`}
                  ></button>
                ))}
                <button
                    type="button"
                    onClick={() => setColor(undefined)}
                    className={`w-8 h-8 rounded-full bg-zinc-400 flex items-center justify-center text-white transition-transform hover:scale-110 ${!color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-800 ring-blue-500' : ''}`}
                    aria-label="Set default color"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700/50 text-right rounded-b-2xl">
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
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onEdit, onRemove }) => (
  <div className="group relative p-6 bg-white dark:bg-zinc-800/50 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-zinc-200 dark:border-zinc-700/50">
    <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
      <div className="flex items-center gap-3">
        <img 
            src={`https://www.google.com/s2/favicons?sz=64&domain_url=${link.url}`} 
            alt={`${link.title} favicon`}
            className="w-6 h-6 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white truncate">{link.title}</h3>
      </div>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400 h-10">{link.description}</p>
    </a>
    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {link.instagramUrl && (
          <a href={link.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md bg-zinc-200/50 dark:bg-zinc-700/50 hover:bg-zinc-300 dark:hover:bg-zinc-600" aria-label="View Instagram video">
            <InstagramIcon />
          </a>
        )}
        <button onClick={() => onEdit(link)} className="p-1.5 rounded-md bg-zinc-200/50 dark:bg-zinc-700/50 hover:bg-zinc-300 dark:hover:bg-zinc-600" aria-label="Edit link"><PencilIcon/></button>
        <button onClick={() => onRemove(link.id)} className="p-1.5 rounded-md bg-zinc-200/50 dark:bg-zinc-700/50 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 dark:text-rose-400" aria-label="Delete link"><TrashIcon/></button>
    </div>
  </div>
);

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

  const ungroupedLinks = links.filter(link => !link.folderId);

  return (
    <div className="w-full">
        {/*This is a hack to make sure tailwind includes the dynamic color classes. They are not visible.*/}
        <span className="hidden bg-rose-500 bg-slate-500 bg-emerald-500 bg-sky-500 bg-indigo-500 bg-purple-500 text-rose-500 text-slate-500 text-emerald-500 text-sky-500 text-indigo-500 text-purple-500"></span>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Powerful Web Sites</h2>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button onClick={handleAddFolderClick} className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-200 dark:bg-zinc-700/80 rounded-lg text-zinc-800 dark:text-zinc-100 shadow-sm hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-sm font-medium">
              <FolderIcon className="h-4 w-4" />
              <span>Add Folder</span>
            </button>
            <button onClick={handleOpenModalToAdd} className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-colors text-sm font-semibold">
              <PlusIcon />
              <span>Add Page</span>
            </button>
          </div>
        </div>

        {folders.map(folder => (
          <div key={folder.id} className="mb-10">
            <div className="flex items-center gap-3 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <FolderIcon className={`h-6 w-6 ${folder.color ? `text-${folder.color}` : 'text-slate-500'}`} />
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{folder.name}</h3>
              <button onClick={() => handleOpenFolderModalToEdit(folder)} className="p-1 rounded-md text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 hover:text-zinc-500" aria-label={`Edit ${folder.name} folder`}>
                <PencilIcon />
              </button>
              <button onClick={() => handleRemoveFolderClick(folder.id, folder.name)} className="p-1 rounded-md text-zinc-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-500" aria-label={`Delete ${folder.name} folder`}>
                <TrashIcon />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {links.filter(link => link.folderId === folder.id).map(link => (
                <LinkCard key={link.id} link={link} onEdit={handleOpenModalToEdit} onRemove={onRemoveLink} />
              ))}
            </div>
          </div>
        ))}
        
        {ungroupedLinks.length > 0 && (
          <div className="mb-10">
             <div className="flex items-center gap-3 mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Other Pages</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ungroupedLinks.map(link => (
                <LinkCard key={link.id} link={link} onEdit={handleOpenModalToEdit} onRemove={onRemoveLink} />
              ))}
            </div>
          </div>
        )}

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
