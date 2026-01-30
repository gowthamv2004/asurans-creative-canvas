import { Check } from "lucide-react";

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  preview: string;
  prompt: string;
}

const presets: StylePreset[] = [
  {
    id: "photorealistic",
    name: "Photorealistic",
    description: "Ultra-realistic photography",
    preview: "📷",
    prompt: "photorealistic, ultra detailed, 8k, professional photography",
  },
  {
    id: "anime",
    name: "Anime",
    description: "Japanese animation style",
    preview: "🎨",
    prompt: "anime style, vibrant colors, detailed, studio quality",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft watercolor painting",
    preview: "🖼️",
    prompt: "watercolor painting, soft edges, artistic, traditional art",
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    description: "Classical oil painting",
    preview: "🎭",
    prompt: "oil painting, classical art, rich textures, museum quality",
  },
  {
    id: "3d-render",
    name: "3D Render",
    description: "Modern 3D graphics",
    preview: "💎",
    prompt: "3d render, octane render, cinema 4d, high quality",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic neon aesthetic",
    preview: "🌆",
    prompt: "cyberpunk style, neon lights, futuristic, dark atmosphere",
  },
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Magical fantasy world",
    preview: "✨",
    prompt: "fantasy art, magical, ethereal, detailed illustration",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean minimal design",
    preview: "⬜",
    prompt: "minimalist, clean, simple, modern design, white space",
  },
];

interface StylePresetsProps {
  selectedPreset: string;
  onSelectPreset: (preset: StylePreset) => void;
}

const StylePresets = ({ selectedPreset, onSelectPreset }: StylePresetsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Style Presets</h3>
        <span className="text-sm text-muted-foreground">
          {presets.length} styles
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className={`preset-card text-left ${
              selectedPreset === preset.id ? "active" : ""
            }`}
          >
            <div className="text-3xl mb-2">{preset.preview}</div>
            <h4 className="font-medium text-sm">{preset.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {preset.description}
            </p>
            {selectedPreset === preset.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StylePresets;
export { presets };
