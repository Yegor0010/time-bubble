import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from './ui/dialog';
import { SettingsForm } from './settings-form';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]" showCloseButton={false}>
        <div className="flex items-center justify-between mb-4">
          <DialogTitle>Settings</DialogTitle>
          <DialogClose
            render={<Button variant="ghost" size="icon-sm" />}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>
        
        <SettingsForm />
      </DialogContent>
    </Dialog>
  );
}
