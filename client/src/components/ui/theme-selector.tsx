import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Waves,
  Leaf,
  Building2,
  Sunset,
  Check
} from "lucide-react";

interface ThemeSelectorProps {
  open: boolean;
  onClose: () => void;
}

export default function ThemeSelector({ open, onClose }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState('corporate');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme preferences
    const savedTheme = localStorage.getItem('selectedTheme') || 'corporate';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    
    setSelectedTheme(savedTheme);
    setIsDarkMode(savedDarkMode);
    
    // Apply theme to document
    applyTheme(savedTheme, savedDarkMode);
  }, []);

  const themes = [
    {
      id: 'corporate',
      name: 'Corporate Blue',
      description: 'Professional and trustworthy',
      icon: Building2,
      color: 'hsl(221.2, 83.2%, 53.3%)',
      preview: 'bg-blue-500'
    },
    {
      id: 'modern',
      name: 'Modern Purple',
      description: 'Innovative and creative',
      icon: Sparkles,
      color: 'hsl(271, 81%, 56%)',
      preview: 'bg-purple-500'
    },
    {
      id: 'nature',
      name: 'Nature Green',
      description: 'Fresh and sustainable',
      icon: Leaf,
      color: 'hsl(142, 71%, 45%)',
      preview: 'bg-green-600'
    },
    {
      id: 'sunset',
      name: 'Sunset Orange',
      description: 'Warm and energetic',
      icon: Sunset,
      color: 'hsl(25, 95%, 53%)',
      preview: 'bg-orange-500'
    },
    {
      id: 'ocean',
      name: 'Ocean Blue',
      description: 'Calm and focused',
      icon: Waves,
      color: 'hsl(199, 89%, 48%)',
      preview: 'bg-cyan-500'
    }
  ];

  const applyTheme = (themeId: string, darkMode: boolean) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    themes.forEach(theme => {
      root.classList.remove(`theme-${theme.id}`);
    });
    
    // Apply new theme
    root.classList.add(`theme-${themeId}`);
    
    // Apply dark mode
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId, isDarkMode);
    localStorage.setItem('selectedTheme', themeId);
  };

  const handleDarkModeToggle = (darkMode: boolean) => {
    setIsDarkMode(darkMode);
    applyTheme(selectedTheme, darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Palette className="w-6 h-6" />
            <span>Theme Customization</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Dark Mode Toggle */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Display Mode</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={!isDarkMode ? "default" : "outline"}
                onClick={() => handleDarkModeToggle(false)}
                className="flex items-center space-x-2 h-12"
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </Button>
              <Button
                variant={isDarkMode ? "default" : "outline"}
                onClick={() => handleDarkModeToggle(true)}
                className="flex items-center space-x-2 h-12"
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2 h-12"
                disabled
              >
                <Monitor className="w-4 h-4" />
                <span>Auto</span>
              </Button>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Color Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((theme) => {
                const Icon = theme.icon;
                const isSelected = selectedTheme === theme.id;
                
                return (
                  <Card
                    key={theme.id}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg ${theme.preview} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {theme.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {theme.description}
                      </p>
                      
                      {/* Theme Preview */}
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.color }}
                          />
                          <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                          <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800" />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Primary colors preview
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">Sample Dashboard Card</h4>
                  <Badge variant="outline">Active</Badge>
                </div>
                <p className="text-muted-foreground">
                  This is how your dashboard will look with the selected theme.
                </p>
                <div className="flex space-x-2">
                  <Button size="sm">Primary Action</Button>
                  <Button variant="outline" size="sm">Secondary</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Apply Button */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
              Apply Theme
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}