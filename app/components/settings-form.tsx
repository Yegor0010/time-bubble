import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { useUserStore } from '~/stores/user-store';

export function SettingsForm() {
  const user = useUserStore((state) => state.user);
  const changeSettings = useUserStore((state) => state.changeSettings);
  const updateUser = useUserStore((state) => state.updateUser);

  const {
    focusTime = 25 * 60,
    breakTime = 5 * 60,
    notifications = true,
    offlineMode = true,
    theme = 'system',
  } = user.settings || {};

  const handleFocusTimeChange = (value: string | null) => {
    if (value) {
      changeSettings({ focusTime: Number(value) });
    }
  };

  const handleBreakTimeChange = (value: string | null) => {
    if (value) {
      changeSettings({ breakTime: Number(value) });
    }
  };

  const handleNotificationsChange = (checked: boolean) => {
    changeSettings({ notifications: checked });
  };

  const handleOnlineModeChange = (checked: boolean) => {
    changeSettings({ offlineMode: !checked });
  };

  const handleThemeChange = (value: string | null) => {
    if (value) {
      changeSettings({ theme: value });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUser({ name: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateUser({ email: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Timer Settings Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Timer Settings</h3>
        
        <div className="space-y-2">
          <Label htmlFor="focusTime">Focus Time</Label>
          <Select value={String(focusTime)} onValueChange={handleFocusTimeChange}>
            <SelectTrigger id="focusTime" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(15 * 60)}>15 minutes</SelectItem>
              <SelectItem value={String(20 * 60)}>20 minutes</SelectItem>
              <SelectItem value={String(25 * 60)}>25 minutes</SelectItem>
              <SelectItem value={String(30 * 60)}>30 minutes</SelectItem>
              <SelectItem value={String(45 * 60)}>45 minutes</SelectItem>
              <SelectItem value={String(60 * 60)}>60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="breakTime">Break Time</Label>
          <Select value={String(breakTime)} onValueChange={handleBreakTimeChange}>
            <SelectTrigger id="breakTime" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(3 * 60)}>3 minutes</SelectItem>
              <SelectItem value={String(5 * 60)}>5 minutes</SelectItem>
              <SelectItem value={String(10 * 60)}>10 minutes</SelectItem>
              <SelectItem value={String(15 * 60)}>15 minutes</SelectItem>
              <SelectItem value={String(20 * 60)}>20 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Preferences Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preferences</h3>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications" className="cursor-pointer">
            Notifications
          </Label>
          <Switch
            id="notifications"
            checked={notifications}
            onCheckedChange={handleNotificationsChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="onlineMode" className="cursor-pointer">
            Online Mode
          </Label>
          <Switch
            id="onlineMode"
            checked={!offlineMode}
            onCheckedChange={handleOnlineModeChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger id="theme" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Profile Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Profile</h3>
        
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={user.name}
            onChange={handleNameChange}
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user.email || ''}
            onChange={handleEmailChange}
            placeholder="Enter your email"
          />
        </div>
      </div>
    </div>
  );
}
