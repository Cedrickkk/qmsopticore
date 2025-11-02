import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useInitials } from '@/hooks/use-initials';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface RecipientListProps {
  users: User[];
  onSignatoryChange: (userId: number) => void;
  onRemoveUser: (userId: number) => void;
  onReorder?: (users: User[]) => void;
}

function SortableUserItem({
  user,
  onSignatoryChange,
  onRemoveUser,
}: {
  user: User;
  onSignatoryChange: (userId: number) => void;
  onRemoveUser: (userId: number) => void;
}) {
  const getInitials = useInitials();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: user.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center justify-between gap-5 border-b py-3 last:border-0">
      <div className="flex items-center space-x-4">
        <div
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab touch-none transition-colors active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm leading-none font-medium">{user.name}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id={`signatory-${user.id}`} onCheckedChange={() => onSignatoryChange(user.id)} />
          <label
            htmlFor={`signatory-${user.id}`}
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Signatory
          </label>
        </div>

        <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveUser(user.id)}>
          <Trash2 className="text-destructive h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function RecipientList({ users, onSignatoryChange, onRemoveUser, onReorder }: RecipientListProps) {
  const [items, setItems] = useState(users);

  // Sync state with props when users change
  useEffect(() => {
    setItems(users);
  }, [users]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder?.(newItems);
        return newItems;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm leading-none font-medium">Recipients</p>
        <small className="text-muted-foreground block text-xs">Note: Drag and drop to arrange users in the order they will sign the document.</small>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(u => u.id)} strategy={verticalListSortingStrategy}>
          <div>
            {items.map(user => (
              <SortableUserItem key={user.id} user={user} onSignatoryChange={onSignatoryChange} onRemoveUser={onRemoveUser} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
