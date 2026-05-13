import { Settings, Timer } from 'lucide-react';
import { useState } from 'react';
import { SettingsModal } from './settings-modal';
import { Button } from './ui/button';

export function Navbar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-sm md:top-0 md:bottom-auto md:border-b md:border-t-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="hidden text-lg font-semibold md:block">
            Time Bubble
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              <Timer className="h-5 w-5" />
            </a>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open settings"
            className="ml-auto md:ml-0"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
