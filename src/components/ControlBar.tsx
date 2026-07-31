import { FileUpload } from "./FileUpload";
import { SettingsPanel } from "./SettingsPanel";
import { PlaybackControls } from "./PlaybackControls";

export function ControlBar() {
  return (
    <div className="control-bar" role="group" aria-label="Playback and settings controls">
      <FileUpload />
      <SettingsPanel />
      <PlaybackControls />
    </div>
  );
}
