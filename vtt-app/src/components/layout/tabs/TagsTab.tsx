import { Plus, Trash2, Edit2, Tag, icons, ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useVttStore } from '../../../store';
import { ColorPicker } from '../../ColorPicker';

const TAG_ICONS = [
  'Tag', 'Shield', 'Sword', 'Heart', 'Star', 'Flag', 'Skull', 'Ghost',
  'Crown', 'Flame', 'Zap', 'Droplet', 'Sun', 'Moon', 'Eye', 'Feather',
  'Key', 'Anchor', 'Axe', 'Castle', 'Crosshair', 'Hexagon', 'Sprout', 'Target', 'Gem'
];

export const TagsTab: React.FC = () => {
  const { tags, tagCategories, addTagModel, deleteTagModel, setEditingEntity, addTagCategory, deleteTagCategory } = useVttStore();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#10b981');
  const [newTagPoints, setNewTagPoints] = useState<number | ''>('');
  const [newTagLives, setNewTagLives] = useState<number | ''>('');
  const [newTagVotes, setNewTagVotes] = useState<number | ''>('');
  const [newTagUses, setNewTagUses] = useState<number | ''>('');
  const [newTagCallOrderDay, setNewTagCallOrderDay] = useState<number | ''>('');
  const [newTagCallOrderNight, setNewTagCallOrderNight] = useState<number | ''>('');
  const [newTagAutoDelete, setNewTagAutoDelete] = useState(false);
  const [newTagDesc, setNewTagDesc] = useState('');
  const [newTagIcon, setNewTagIcon] = useState('Tag');
  const [newTagShowInTooltip, setNewTagShowInTooltip] = useState(true);
  const [newTagShowInGameTab, setNewTagShowInGameTab] = useState(true);
  const [newTagCategoryId, setNewTagCategoryId] = useState<string>('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Folder');

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const tagsByCategory = useMemo(() => {
    const grouped: Record<string, typeof tags> = {
      'no-category': []
    };

    tagCategories.forEach(c => grouped[c.id] = []);

    tags.forEach(tag => {
      if (tag.categoryId && grouped[tag.categoryId]) {
        grouped[tag.categoryId].push(tag);
      } else {
        grouped['no-category'].push(tag);
      }
    });

    return grouped;
  }, [tags, tagCategories]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addTagCategory({
      name: newCategoryName,
      color: newCategoryColor,
      icon: newCategoryIcon,
    });
    setNewCategoryName('');
    setNewCategoryIcon('Folder');
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    addTagModel({
      name: newTagName,
      color: newTagColor,
      icon: newTagIcon,
      lives: newTagLives === '' ? null : newTagLives,
      points: newTagPoints === '' ? null : newTagPoints,
      votes: newTagVotes === '' ? null : newTagVotes,
      uses: newTagUses === '' ? null : newTagUses,
      autoDeleteOnZeroUses: newTagAutoDelete,
      description: newTagDesc,
      showInTooltip: newTagShowInTooltip,
      showInGameTab: newTagShowInGameTab,
      categoryId: newTagCategoryId || null,
      callOrderDay: newTagCallOrderDay === '' ? null : newTagCallOrderDay,
      callOrderNight: newTagCallOrderNight === '' ? null : newTagCallOrderNight,
    });
    setNewTagName('');
    setNewTagPoints('');
    setNewTagLives('');
    setNewTagVotes('');
    setNewTagUses('');
    setNewTagCallOrderDay('');
    setNewTagCallOrderNight('');
    setNewTagAutoDelete(false);
    setNewTagDesc('');
    setNewTagIcon('Tag');
    setNewTagShowInTooltip(true);
    setNewTagShowInGameTab(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create Global Tag (Model) Section */}
      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Créer un Tag (Modèle)</h3>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nom du tag (ex: Empoisonné)"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Catégorie :</label>
            <select
              value={newTagCategoryId}
              onChange={(e) => setNewTagCategoryId(e.target.value)}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">-- Aucune --</option>
              {tagCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-medium text-muted-foreground">Icône :</label>
            <div className="flex flex-wrap gap-1 bg-input border border-border rounded-md p-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {TAG_ICONS.map(iconName => {
                const IconComponent = icons[iconName as keyof typeof icons];
                if (!IconComponent) return null;
                return (
                  <button
                    key={iconName}
                    onClick={() => setNewTagIcon(iconName)}
                    className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
                      newTagIcon === iconName
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                    }`}
                    title={iconName}
                  >
                    {React.createElement(IconComponent, { size: 16 })}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-muted-foreground italic">
              Vous pourrez ajouter une image personnalisée en modifiant le tag.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap flex-1" title="Ordre d'Appel Jour">Appel Jour:</label>
              <input
                type="number"
                value={newTagCallOrderDay}
                onChange={(e) => setNewTagCallOrderDay(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="-"
                className="w-16 bg-input border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap flex-1" title="Ordre d'Appel Nuit">Appel Nuit:</label>
              <input
                type="number"
                value={newTagCallOrderNight}
                onChange={(e) => setNewTagCallOrderNight(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="-"
                className="w-16 bg-input border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap flex-1">Ajout Vie:</label>
              <input
                type="number"
                value={newTagLives}
                onChange={(e) => setNewTagLives(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="0"
                className="w-16 bg-input border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap flex-1">Votes:</label>
              <input
                type="number"
                value={newTagVotes}
                onChange={(e) => setNewTagVotes(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="-1"
                title="-1 pour illimité"
                className="w-16 bg-input border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap flex-1">Pts:</label>
              <input
                type="number"
                value={newTagPoints}
                onChange={(e) => setNewTagPoints(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="0"
                className="w-16 bg-input border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap flex-1">Uses:</label>
                <input
                  type="number"
                  value={newTagUses}
                  onChange={(e) => setNewTagUses(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="1"
                  className="w-16 bg-input border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
                />
              </div>
              <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTagAutoDelete}
                  onChange={(e) => setNewTagAutoDelete(e.target.checked)}
                  className="rounded border-border w-2.5 h-2.5"
                />
                Suppr. auto à 0
              </label>
            </div>
          </div>

          <textarea
            value={newTagDesc}
            onChange={(e) => setNewTagDesc(e.target.value)}
            placeholder="Texte libre..."
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px]"
          />

          <div className="flex flex-col gap-2 mt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newTagShowInTooltip}
                onChange={(e) => setNewTagShowInTooltip(e.target.checked)}
                className="rounded border-border w-3 h-3"
              />
              Visible dans l'info-bulle (au survol du joueur)
            </label>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newTagShowInGameTab}
                onChange={(e) => setNewTagShowInGameTab(e.target.checked)}
                className="rounded border-border w-3 h-3"
              />
              Visible dans l'onglet Jeu (sous le joueur)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <ColorPicker
              color={newTagColor}
              onChange={setNewTagColor}
              label="Couleur du tag"
            />
            <button
              onClick={handleAddTag}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Ajouter Tag
            </button>
          </div>
        </div>
      </section>

      {/* List Tags Section */}
      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Modèles Globaux</h3>
        <div className="flex flex-col gap-2">
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun tag défini.</p>
          ) : (
            <>
              {Object.entries(tagsByCategory).map(([categoryId, categoryTags]) => {
                if (categoryTags.length === 0) return null;

                const category = categoryId === 'no-category' ? null : tagCategories.find(c => c.id === categoryId);
                const isExpanded = expandedCategories[categoryId] !== false; // Default to true
                const CategoryIcon = category && category.icon ? icons[category.icon as keyof typeof icons] : null;

                return (
                  <div key={categoryId} className="flex flex-col gap-1">
                    <button
                      onClick={() => toggleCategory(categoryId)}
                      className="flex items-center justify-between w-full p-1.5 rounded bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {category ? (
                          <div className="flex items-center gap-1.5" style={{ color: category.color }}>
                            {CategoryIcon && React.createElement(CategoryIcon, { size: 14 })}
                            {category.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sans Catégorie</span>
                        )}
                        <span className="text-xs text-muted-foreground ml-1">({categoryTags.length})</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="flex flex-col gap-1.5 pl-4 mt-1 border-l-2 border-border/30 ml-2">
                        {categoryTags.map((tag) => {
                          const IconComponent = icons[tag.icon as keyof typeof icons] || Tag;
                          return (
                            <div
                              key={tag.id}
                              className="flex items-center justify-between p-2 rounded-md border border-border bg-card hover:bg-accent/50 group"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'new_marker', data: tag }));
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex items-center justify-center w-6 h-6 rounded-md border border-border overflow-hidden"
                                  style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
                                >
                                  {tag.imageUrl ? (
                                    <img src={tag.imageUrl} alt={tag.name} className="w-full h-full object-cover" draggable={false} />
                                  ) : (
                                    <IconComponent size={12} style={{ color: tag.color }} />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium leading-none">{tag.name}</span>
                                  <span className="text-[10px] text-muted-foreground mt-1">
                                    {tag.uses !== null ? `Uses: ${tag.uses}` : ''} {tag.points !== null ? `Pts: ${tag.points}` : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingEntity({ type: 'tagModel', id: tag.id })}
                                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                                  title="Modifier"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteTagModel(tag.id)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                                  title="Supprimer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>

      {/* Create Tag Category Section */}
      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Créer une Catégorie</h3>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nom de la catégorie"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Icône :</label>
            <div className="flex flex-wrap gap-1 bg-input border border-border rounded-md p-1.5 max-h-32 overflow-y-auto custom-scrollbar">
              {['Folder', 'Bookmark', 'Layers', 'Boxes', 'Library', 'List', 'Hash'].map(iconName => {
                const IconComponent = icons[iconName as keyof typeof icons];
                if (!IconComponent) return null;
                return (
                  <button
                    key={iconName}
                    onClick={() => setNewCategoryIcon(iconName)}
                    className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
                      newCategoryIcon === iconName
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                    }`}
                    title={iconName}
                  >
                    {React.createElement(IconComponent, { size: 16 })}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColorPicker
              color={newCategoryColor}
              onChange={setNewCategoryColor}
              label="Couleur de la catégorie"
            />
            <button
              onClick={handleAddCategory}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Ajouter Catégorie
            </button>
          </div>
        </div>

        {/* List of categories */}
        {tagCategories.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {tagCategories.map(category => {
              const CategoryIcon = icons[category.icon as keyof typeof icons] || Tag;
              return (
                <div key={category.id} className="flex items-center justify-between p-2 rounded-md border border-border bg-card group">
                  <div className="flex items-center gap-2" style={{ color: category.color }}>
                    <CategoryIcon size={16} />
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingEntity({ type: 'tagCategory', id: category.id })}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                      title="Modifier"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteTagCategory(category.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};