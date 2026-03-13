import { Plus, Trash2, Edit2, Tag } from 'lucide-react';
import React, { useState } from 'react';
import { useVttStore } from '../../../store';

export const TagsTab: React.FC = () => {
  const { tags, addTagModel, deleteTagModel, setEditingEntity } = useVttStore();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#10b981');
  const [newTagPoints, setNewTagPoints] = useState(0);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    addTagModel({
      name: newTagName,
      color: newTagColor,
      icon: 'Tag', // Default icon string
      lives: 0,
      points: newTagPoints,
      votes: 0,
      uses: 1,
      callOrderDay: null,
      callOrderNight: null,
    });
    setNewTagName('');
    setNewTagPoints(0);
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
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Points:</label>
              <input
                type="number"
                value={newTagPoints}
                onChange={(e) => setNewTagPoints(parseInt(e.target.value) || 0)}
                className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              title="Couleur du tag"
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
            tags.map((tag) => (
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
                    className="flex items-center justify-center w-6 h-6 rounded-md border border-border"
                    style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
                  >
                    <Tag size={12} style={{ color: tag.color }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-none">{tag.name}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Pts: {tag.points} • Uses: {tag.uses}
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
            ))
          )}
        </div>
      </section>
    </div>
  );
};