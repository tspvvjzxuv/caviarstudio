import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSound } from "@/components/sound-root";
import { useLanguage } from "@/lib/language";
import { playUiSound, unlockSound } from "@/lib/sound";

export function SoundToggle() {
  const { t } = useLanguage();
  const { muted, setMuted } = useSound();
  const label = muted ? t.soundUnmute : t.soundMute;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-sound-toggle=""
          data-magnetic=""
          aria-pressed={!muted}
          aria-label={label}
          className="icon-disc inline-flex size-11 shrink-0 items-center justify-center text-pearl"
          onClick={() => {
            const next = !muted;
            setMuted(next);
            void unlockSound().then(() => {
              if (!next) playUiSound("hit");
            });
          }}
        >
          {muted ? <VolumeX className="size-4" strokeWidth={1.75} /> : <Volume2 className="size-4" strokeWidth={1.75} />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
